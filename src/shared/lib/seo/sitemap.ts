import { supabaseServer } from "@/shared/lib/supabase/supabaseServer";

export type PostSitemapEntry = {
    idx: number;
    created_at: string;
};

export async function getPostSitemapEntries(): Promise<PostSitemapEntry[]> {
    const supabase = await supabaseServer();

    const { data, error } = await supabase.from("posts").select("idx, created_at").order("idx", { ascending: true });

    if (error) {
        console.error("sitemap post fetch error:", error);
        return [];
    }

    return data ?? [];
}
