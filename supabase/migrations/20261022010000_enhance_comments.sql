BEGIN;

-- 기존 password는 신뢰하지 않는다. 새 비회원 댓글에만 검증된 해시를 저장한다.
ALTER TABLE public.comments
    ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    ADD COLUMN password_hash text,
    ADD COLUMN parent_id integer REFERENCES public.comments(idx),
    ADD COLUMN reply_to_id integer REFERENCES public.comments(idx),
    ADD COLUMN reply_to_author text,
    ADD COLUMN emoji_id text,
    ADD COLUMN deleted_at timestamptz,
    ADD COLUMN request_id uuid UNIQUE,
    ADD COLUMN request_fingerprint text,
    ADD CONSTRAINT comments_not_self_parent CHECK (parent_id IS DISTINCT FROM idx),
    ADD CONSTRAINT comments_reply_requires_parent CHECK (reply_to_id IS NULL OR parent_id IS NOT NULL);

CREATE INDEX comments_post_roots_idx ON public.comments(post_id, idx) WHERE parent_id IS NULL;
CREATE INDEX comments_parent_idx ON public.comments(parent_id, idx) WHERE parent_id IS NOT NULL;
CREATE INDEX comments_user_idx ON public.comments(user_id) WHERE user_id IS NOT NULL;

-- IP 원문 대신 서버가 만든 HMAC 키만 보관한다. 만료된 버킷은 새 요청 때 정리한다.
CREATE TABLE public.comment_rate_limits (
    key text PRIMARY KEY,
    window_started_at timestamptz NOT NULL,
    hits integer NOT NULL CHECK (hits > 0),
    window_seconds integer NOT NULL CHECK (window_seconds > 0)
);
CREATE INDEX comment_rate_limits_window_idx ON public.comment_rate_limits(window_started_at);
ALTER TABLE public.comment_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.comment_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comment_rate_limits TO service_role;

CREATE FUNCTION public.consume_comment_rate(p_key text, p_window_seconds integer, p_limit integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
    v_key text;
    v_now timestamptz := clock_timestamp();
BEGIN
    IF p_key IS NULL OR length(p_key) < 1 OR length(p_key) > 200
        OR p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400
        OR p_limit IS NULL OR p_limit < 1 OR p_limit > 1000 THEN
        RAISE EXCEPTION 'Invalid comment rate configuration' USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.comment_rate_limits
    WHERE window_started_at < v_now - interval '1 day';
    INSERT INTO public.comment_rate_limits AS r(key, window_started_at, hits, window_seconds)
    VALUES (p_key, v_now, 1, p_window_seconds)
    ON CONFLICT (key) DO UPDATE SET
        window_started_at = CASE WHEN r.window_started_at + r.window_seconds * interval '1 second' <= v_now THEN v_now ELSE r.window_started_at END,
        hits = CASE WHEN r.window_started_at + r.window_seconds * interval '1 second' <= v_now THEN 1 ELSE r.hits + 1 END,
        window_seconds = p_window_seconds
    WHERE r.window_started_at + r.window_seconds * interval '1 second' <= v_now OR r.hits < p_limit
    RETURNING key INTO v_key;
    RETURN v_key IS NOT NULL;
END;
$$;

CREATE FUNCTION public.check_comment_rate(p_key text, p_window_seconds integer, p_limit integer)
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
    SELECT p_key IS NOT NULL AND p_window_seconds BETWEEN 1 AND 86400 AND p_limit BETWEEN 1 AND 1000
        AND NOT EXISTS (
            SELECT 1 FROM public.comment_rate_limits r WHERE r.key = p_key
                AND r.window_started_at + r.window_seconds * interval '1 second' > now()
                AND r.hits >= p_limit
        );
$$;

CREATE FUNCTION public.create_comment(
    p_request_id uuid, p_post_id integer, p_author text, p_msg text,
    p_profile integer, p_emoji_id text, p_user_id uuid, p_password_hash text,
    p_is_admin boolean, p_parent_id integer, p_reply_to_id integer,
    p_reply_to_author text, p_rate_key text, p_request_fingerprint text
)
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
    v_previous public.comments%ROWTYPE;
    v_parent public.comments%ROWTYPE;
    v_target public.comments%ROWTYPE;
    v_idx integer;
    v_is_admin boolean := false;
BEGIN
    IF p_request_id IS NULL OR p_post_id IS NULL OR p_post_id <= 0
        OR p_author IS NULL OR length(btrim(p_author)) = 0 OR length(p_author) > 320
        OR p_msg IS NULL OR length(btrim(p_msg)) = 0 OR length(p_msg) > 2000
        OR p_profile IS NULL OR p_profile < 1
        OR p_request_fingerprint IS NULL OR length(p_request_fingerprint) NOT BETWEEN 1 AND 128
        OR (p_user_id IS NULL AND (p_password_hash IS NULL OR p_password_hash !~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'))
        OR (p_user_id IS NOT NULL AND p_password_hash IS NOT NULL)
        OR (p_parent_id IS NULL AND p_reply_to_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Invalid comment' USING ERRCODE = '22023';
    END IF;

    -- 같은 요청의 동시 재전송은 IP 제한보다 먼저 직렬화한다.
    PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
    SELECT * INTO v_previous FROM public.comments WHERE request_id = p_request_id;
    IF FOUND THEN
        IF v_previous.request_fingerprint IS DISTINCT FROM p_request_fingerprint
            OR v_previous.post_id IS DISTINCT FROM p_post_id OR v_previous.user_id IS DISTINCT FROM p_user_id THEN
            RAISE EXCEPTION 'Comment request conflict' USING ERRCODE = '23505';
        END IF;
        RETURN jsonb_build_object('idx', v_previous.idx, 'duplicate', true);
    END IF;

    -- 게시물 공개 범위 변경·삭제와 등록을 동기화한다.
    PERFORM 1 FROM public.posts p WHERE p.idx = p_post_id
        AND p.post_type NOT IN ('til', 'diary')
        AND (p.visibility = 'public' OR (p.visibility = 'private' AND p.user_id = p_user_id)) FOR SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post not found' USING ERRCODE = 'PT404';
    END IF;

    IF p_parent_id IS NOT NULL THEN
        SELECT * INTO v_parent FROM public.comments WHERE idx = p_parent_id FOR UPDATE;
        IF NOT FOUND OR v_parent.post_id IS DISTINCT FROM p_post_id OR v_parent.parent_id IS NOT NULL
            OR v_parent.deleted_at IS NOT NULL OR coalesce(v_parent.is_secret, false) THEN
            RAISE EXCEPTION 'Invalid parent comment' USING ERRCODE = '22023';
        END IF;
        IF p_reply_to_id IS NOT NULL THEN
            SELECT * INTO v_target FROM public.comments WHERE idx = p_reply_to_id FOR UPDATE;
            IF NOT FOUND OR v_target.post_id IS DISTINCT FROM p_post_id
                OR (v_target.idx IS DISTINCT FROM p_parent_id AND v_target.parent_id IS DISTINCT FROM p_parent_id)
                OR v_target.deleted_at IS NOT NULL OR coalesce(v_target.is_secret, false) THEN
                RAISE EXCEPTION 'Invalid reply target' USING ERRCODE = '22023';
            END IF;
        END IF;
    END IF;

    IF NOT public.consume_comment_rate(p_rate_key, 60, 5) THEN
        RAISE EXCEPTION 'Comment rate limit reached' USING ERRCODE = 'PT429';
    END IF;
    IF p_user_id IS NOT NULL THEN
        SELECT u.role = 'admin' INTO v_is_admin FROM public.users u WHERE u.id = p_user_id;
    END IF;
    INSERT INTO public.comments(post_id, author, msg, profile, emoji_id, user_id, password_hash,
        is_admin, is_secret, parent_id, reply_to_id, reply_to_author, request_id, request_fingerprint)
    VALUES (p_post_id, p_author, p_msg, p_profile, p_emoji_id, p_user_id, p_password_hash,
        coalesce(v_is_admin, false) AND coalesce(p_is_admin, false), false, p_parent_id, p_reply_to_id,
        CASE WHEN p_reply_to_id IS NOT NULL THEN v_target.author ELSE NULL END, p_request_id, p_request_fingerprint)
    RETURNING idx INTO v_idx;
    RETURN jsonb_build_object('idx', v_idx, 'duplicate', false);
END;
$$;

-- 삭제와 개인정보 정리는 같은 UPDATE 트랜잭션 안에서 처리한다.
CREATE FUNCTION public.scrub_deleted_comment()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    NEW.author := NULL;
    NEW.msg := NULL;
    NEW.profile := NULL;
    NEW.emoji_id := NULL;
    NEW.user_id := NULL;
    NEW.password := NULL;
    NEW.password_hash := NULL;
    NEW.is_admin := false;
    NEW.reply_to_author := NULL;
    UPDATE public.comments SET reply_to_author = NULL WHERE reply_to_id = NEW.idx;
    RETURN NEW;
END;
$$;
CREATE TRIGGER comments_scrub_on_delete
BEFORE UPDATE OF deleted_at ON public.comments
FOR EACH ROW WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION public.scrub_deleted_comment();
REVOKE ALL ON FUNCTION public.scrub_deleted_comment() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.scrub_deleted_comment() TO service_role;

-- 읽기 전용 projection: 삭제된 부모는 답글이 있을 때만 남기고 개인정보를 가린다.
CREATE VIEW public.comment_threads WITH (security_invoker = true) AS
SELECT c.idx, c.id, c.post_id, c.parent_id, c.reply_to_id,
    CASE WHEN c.deleted_at IS NULL THEN c.user_id ELSE NULL END AS user_id,
    CASE WHEN c.deleted_at IS NULL THEN c.profile ELSE NULL END AS profile,
    CASE WHEN c.deleted_at IS NULL THEN c.author ELSE NULL END AS author,
    CASE WHEN c.deleted_at IS NULL THEN c.msg ELSE NULL END AS msg,
    CASE WHEN c.deleted_at IS NULL THEN c.emoji_id ELSE NULL END AS emoji_id,
    CASE WHEN c.deleted_at IS NULL AND (c.reply_to_id IS NULL OR EXISTS (
        SELECT 1 FROM public.comments t WHERE t.idx = c.reply_to_id AND t.deleted_at IS NULL AND NOT coalesce(t.is_secret, false)
    )) THEN c.reply_to_author ELSE NULL END AS reply_to_author,
    CASE WHEN c.deleted_at IS NULL THEN c.is_admin ELSE false END AS is_admin,
    c.is_modified, c.created_at, c.updated_at, c.deleted_at,
    (c.deleted_at IS NULL AND c.password_hash IS NOT NULL) AS has_password,
    children.reply_count
FROM public.comments c
CROSS JOIN LATERAL (
    SELECT count(*)::integer AS reply_count FROM public.comments r
    WHERE r.parent_id = c.idx AND r.deleted_at IS NULL AND NOT coalesce(r.is_secret, false)
) children
WHERE NOT coalesce(c.is_secret, false)
    AND (c.deleted_at IS NULL OR (c.parent_id IS NULL AND children.reply_count > 0));

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.comments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO service_role;
REVOKE ALL ON TABLE public.comment_threads FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.comment_threads TO service_role;
REVOKE ALL ON FUNCTION public.consume_comment_rate(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_comment_rate(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_comment(uuid, integer, text, text, integer, text, uuid, text, boolean, integer, integer, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_comment_rate(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_comment_rate(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_comment(uuid, integer, text, text, integer, text, uuid, text, boolean, integer, integer, text, text, text) TO service_role;

-- 비밀번호를 비교하기 전에 슬롯을 예약해 동시 요청도 실패 한도를 넘지 못하게 한다.
CREATE FUNCTION public.reserve_comment_password(p_key text)
RETURNS timestamptz LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_started timestamptz;
BEGIN
    IF NOT public.consume_comment_rate(p_key, 600, 5) THEN RETURN NULL; END IF;
    SELECT window_started_at INTO v_started FROM public.comment_rate_limits WHERE key = p_key;
    RETURN v_started;
END;
$$;

-- 성공한 확인만 반납한다. 이전 시간창의 응답이 새 시간창을 줄이지 못하게 한다.
CREATE FUNCTION public.release_comment_password(p_key text, p_window_started_at timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_hits integer;
BEGIN
    SELECT hits INTO v_hits FROM public.comment_rate_limits
    WHERE key = p_key AND window_started_at = p_window_started_at FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;
    IF v_hits = 1 THEN
        DELETE FROM public.comment_rate_limits WHERE key = p_key;
    ELSE
        UPDATE public.comment_rate_limits SET hits = hits - 1 WHERE key = p_key;
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_comment_password(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_comment_password(text, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_comment_password(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_comment_password(text, timestamptz) TO service_role;

COMMIT;
