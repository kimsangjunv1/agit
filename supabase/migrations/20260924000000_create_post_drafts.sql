CREATE TABLE IF NOT EXISTS public.post_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL DEFAULT '',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_drafts_user_updated_idx
    ON public.post_drafts (user_id, updated_at DESC);

ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.post_drafts FROM anon, authenticated;
GRANT ALL ON public.post_drafts TO service_role;
