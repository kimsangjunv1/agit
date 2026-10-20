UPDATE public.post_types
SET title = 'Article'
WHERE code = 'article' AND title IN ('일반', '일반 글');
