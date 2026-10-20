BEGIN;

ALTER TABLE public.posts
    ADD COLUMN post_type text NOT NULL DEFAULT 'article',
    ADD COLUMN visibility text NOT NULL DEFAULT 'public',
    ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('article', 'til', 'diary')),
    ADD CONSTRAINT posts_visibility_check CHECK (visibility IN ('public', 'private'));

CREATE INDEX posts_type_created_idx ON public.posts (post_type, created_at DESC);
CREATE INDEX posts_owner_visibility_idx ON public.posts (user_id, visibility);

-- NextAuth 세션의 작성자 조회는 서버에서 확인한다. 직접 DB 조회는 공개 글만 허용한다.
DROP POLICY IF EXISTS posts_public_select ON public.posts;
CREATE POLICY posts_public_select ON public.posts FOR SELECT TO anon, authenticated USING (visibility = 'public');

DROP POLICY IF EXISTS views_public_select ON public.views;
CREATE POLICY views_public_select ON public.views FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.posts WHERE idx = post_id AND visibility = 'public'));
DROP POLICY IF EXISTS likes_public_select ON public.likes;
CREATE POLICY likes_public_select ON public.likes FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.posts WHERE idx = post_id AND visibility = 'public'));

REVOKE EXECUTE ON FUNCTION public.increment_view(integer, uuid, text) FROM PUBLIC, anon, authenticated;

-- 기존 이미지도 글의 공개 범위에 따라 서버 이미지 API로 제공한다.
UPDATE storage.buckets SET public = false WHERE id = 'post-images';
DROP POLICY IF EXISTS post_images_public_read ON storage.objects;

-- 썸네일, 이미지 블록, 본문 img 태그의 실제 참조만 사용한다.
CREATE FUNCTION public.post_image_urls(p_thumbnail text, p_contents jsonb)
RETURNS SETOF text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
    WITH blocks AS (SELECT block FROM jsonb_path_query(coalesce(p_contents, '[]'::jsonb), '$[*][*]') AS block)
    SELECT p_thumbnail
    UNION ALL SELECT block->>'imageUrl' FROM blocks
    UNION ALL
    SELECT matched[1] FROM blocks,
        LATERAL regexp_matches(
            CASE WHEN jsonb_typeof(block->'content') = 'string' THEN block->>'content' ELSE '' END,
            '<img[^>]*[[:space:]]src[[:space:]]*=[[:space:]]*["'']([^"'']+)["'']', 'gi'
        ) AS matched;
$$;
REVOKE ALL ON FUNCTION public.post_image_urls(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_image_urls(text, jsonb) TO service_role;

CREATE FUNCTION public.can_read_post_image(p_path text, p_user_id uuid DEFAULT NULL)
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
    SELECT
        (p_user_id IS NOT NULL AND starts_with(p_path, 'posts/' || p_user_id::text || '/'))
        OR EXISTS (
            SELECT 1 FROM public.posts p,
                LATERAL public.post_image_urls(p.thumbnail, p.contents) AS images(image_url)
            WHERE (p.visibility = 'public' OR (p.visibility = 'private' AND p.user_id = p_user_id))
              AND (split_part(split_part(image_url, '/post-images/', 2), '?', 1) = p_path
                OR split_part(split_part(image_url, '/api/v1/post/image/', 2), '?', 1) = p_path)
        )
        OR EXISTS (
            SELECT 1 FROM public.post_drafts d,
                LATERAL public.post_image_urls(d.payload->>'thumbnail', d.payload->'contents') AS images(image_url)
            WHERE d.user_id = p_user_id
              AND (split_part(split_part(image_url, '/post-images/', 2), '?', 1) = p_path
                OR split_part(split_part(image_url, '/api/v1/post/image/', 2), '?', 1) = p_path)
        );
$$;
REVOKE ALL ON FUNCTION public.can_read_post_image(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_post_image(text, uuid) TO service_role;

COMMIT;
