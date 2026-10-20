BEGIN;

CREATE TABLE public.post_types (
    code text PRIMARY KEY CHECK (code ~ '^[a-z][a-z0-9_-]{0,49}$' AND code <> 'all'),
    title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 40),
    sort_no integer NOT NULL DEFAULT 0 CHECK (sort_no BETWEEN 0 AND 9999),
    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.post_types (code, title, sort_no) VALUES
    ('article', '일반', 0),
    ('til', 'TIL', 1),
    ('diary', 'Diary', 2);

ALTER TABLE public.post_types ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.post_types FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.post_types TO anon, authenticated;
GRANT ALL ON public.post_types TO service_role;
CREATE POLICY post_types_public_select ON public.post_types
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.posts
    DROP CONSTRAINT posts_post_type_check,
    ADD CONSTRAINT posts_post_type_fkey FOREIGN KEY (post_type)
        REFERENCES public.post_types (code) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- 임시저장 글도 종류 삭제 시 참조가 끊기지 않도록 함께 보호한다.
ALTER TABLE public.post_drafts
    ADD COLUMN post_type text GENERATED ALWAYS AS (coalesce(payload->>'post_type', 'article')) STORED,
    ADD CONSTRAINT post_drafts_post_type_fkey FOREIGN KEY (post_type)
        REFERENCES public.post_types (code) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE INDEX post_drafts_post_type_idx ON public.post_drafts (post_type);

COMMIT;
