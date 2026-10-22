BEGIN;

-- 비회원 응원은 likes.user_id를 비워 둔다. 회원 외래키에 임의 ID를 넣지 않는다.
CREATE OR REPLACE FUNCTION public.increment_cheer_up_batch(
    p_post_id integer,
    p_batch_id uuid,
    p_count integer,
    p_user_id uuid,
    p_ip text,
    p_known_batch_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_likes integer;
    v_batch public.likes%ROWTYPE;
    v_inserted_id uuid;
    v_applied boolean := false;
    v_acknowledged_ids uuid[];
BEGIN
    IF p_post_id IS NULL OR p_post_id <= 0 OR p_batch_id IS NULL
        OR p_count IS NULL OR p_count <= 0
        OR p_known_batch_ids IS NULL OR cardinality(p_known_batch_ids) > 256 THEN
        RAISE EXCEPTION 'Invalid Cheer Up batch' USING ERRCODE = '22023';
    END IF;

    SELECT coalesce(p.likes, 0) INTO v_likes
    FROM public.posts p
    WHERE p.idx = p_post_id
        AND (p.visibility = 'public' OR (p.visibility = 'private' AND p.user_id = p_user_id))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post not found' USING ERRCODE = 'PT404';
    END IF;

    INSERT INTO public.likes (id, post_id, user_id, ip, increment_count)
    VALUES (p_batch_id, p_post_id, p_user_id, coalesce(p_ip, 'unknown'), p_count)
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_inserted_id;

    IF v_inserted_id IS NULL THEN
        SELECT * INTO v_batch FROM public.likes WHERE id = p_batch_id;
        IF v_batch.post_id IS DISTINCT FROM p_post_id
            OR v_batch.user_id IS DISTINCT FROM p_user_id
            OR v_batch.increment_count IS DISTINCT FROM p_count THEN
            RAISE EXCEPTION 'Conflicting Cheer Up batch' USING ERRCODE = 'PT409';
        END IF;
    ELSE
        UPDATE public.posts
        SET likes = coalesce(likes, 0) + p_count
        WHERE idx = p_post_id
        RETURNING likes INTO v_likes;
        v_applied := true;
    END IF;

    SELECT coalesce(array_agg(l.id ORDER BY l.id), '{}'::uuid[]) INTO v_acknowledged_ids
    FROM public.likes l
    WHERE l.post_id = p_post_id AND l.user_id IS NOT DISTINCT FROM p_user_id
        AND l.id = ANY (array_append(p_known_batch_ids, p_batch_id));

    RETURN jsonb_build_object(
        'batchId', p_batch_id,
        'likes', v_likes,
        'applied', v_applied,
        'acknowledgedBatchIds', v_acknowledged_ids
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_cheer_up_state(p_post_id integer, p_user_id uuid, p_batch_ids uuid[] DEFAULT '{}'::uuid[])
RETURNS jsonb
LANGUAGE sql STABLE
SET search_path = ''
AS $$
    SELECT jsonb_build_object(
        'likes', coalesce(p.likes, 0),
        'acknowledgedBatchIds', ARRAY(
            SELECT l.id FROM public.likes l
            WHERE l.post_id = p.idx AND l.user_id IS NOT DISTINCT FROM p_user_id AND l.id = ANY (p_batch_ids)
            ORDER BY l.id
        )
    )
    FROM public.posts p
    WHERE p.idx = p_post_id AND cardinality(p_batch_ids) <= 256
        AND (p.visibility = 'public' OR (p.visibility = 'private' AND p.user_id = p_user_id));
$$;

COMMIT;
