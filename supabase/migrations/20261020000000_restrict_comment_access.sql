-- 댓글은 서버 API에서 공개 컬럼과 비밀댓글 여부를 확인한 뒤 조회한다.
-- 브라우저의 Supabase 직접 조회로 비밀번호와 비밀댓글이 노출되는 것을 막는다.
BEGIN;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_public_select" ON public.comments;
REVOKE ALL ON TABLE public.comments FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.comments_idx_seq FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.comments TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.comments_idx_seq TO service_role;

COMMIT;
