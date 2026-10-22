BEGIN;

-- 기존 좋아요 기록과 posts.likes 누적 값은 유지한다. 새 ID는 클릭 묶음의 UUID다.
ALTER TABLE public.likes
    ADD COLUMN increment_count integer NOT NULL DEFAULT 1 CHECK (increment_count > 0),
    DROP CONSTRAINT IF EXISTS unique_like;

-- unique_like가 제공하던 게시물별 조회 인덱스는 유지한다.
CREATE INDEX likes_post_user_idx ON public.likes (post_id, user_id);

CREATE FUNCTION public.increment_cheer_up_batch(
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
        OR p_count IS NULL OR p_count <= 0 OR p_user_id IS NULL
        OR p_known_batch_ids IS NULL OR cardinality(p_known_batch_ids) > 256 THEN
        RAISE EXCEPTION 'Invalid Cheer Up batch' USING ERRCODE = '22023';
    END IF;

    -- 같은 글의 모든 묶음은 이 잠금을 거친다. 공개 범위 변경/삭제와도 직렬화한다.
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
        -- 다른 글에서 동일한 ID가 동시에 제출된 경우에도 PK 충돌 후 확정된 값을 비교한다.
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

    -- posts 잠금이 유지되는 동안 확인 ID를 읽어 합계와 확인 상태가 어긋나지 않게 한다.
    SELECT coalesce(array_agg(l.id ORDER BY l.id), '{}'::uuid[]) INTO v_acknowledged_ids
    FROM public.likes l
    WHERE l.post_id = p_post_id AND l.user_id = p_user_id
        AND l.id = ANY (array_append(p_known_batch_ids, p_batch_id));

    RETURN jsonb_build_object(
        'batchId', p_batch_id,
        'likes', v_likes,
        'applied', v_applied,
        'acknowledgedBatchIds', v_acknowledged_ids
    );
END;
$$;

CREATE FUNCTION public.get_cheer_up_state(p_post_id integer, p_user_id uuid, p_batch_ids uuid[] DEFAULT '{}'::uuid[])
RETURNS jsonb
LANGUAGE sql STABLE
SET search_path = ''
AS $$
    -- 한 SQL snapshot에서 합계와 확인 ID를 함께 조회한다.
    SELECT jsonb_build_object(
        'likes', coalesce(p.likes, 0),
        'acknowledgedBatchIds', ARRAY(
            SELECT l.id FROM public.likes l
            WHERE l.post_id = p.idx AND l.user_id = p_user_id AND l.id = ANY (p_batch_ids)
            ORDER BY l.id
        )
    )
    FROM public.posts p
    WHERE p.idx = p_post_id AND p_user_id IS NOT NULL AND cardinality(p_batch_ids) <= 256
        AND (p.visibility = 'public' OR (p.visibility = 'private' AND p.user_id = p_user_id));
$$;

REVOKE ALL ON FUNCTION public.increment_cheer_up_batch(integer, uuid, integer, uuid, text, uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_cheer_up_state(integer, uuid, uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_cheer_up_batch(integer, uuid, integer, uuid, text, uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_cheer_up_state(integer, uuid, uuid[]) TO service_role;

COMMIT;
