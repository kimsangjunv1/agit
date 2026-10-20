"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";
import { useBlockStore } from "@/features/managePost/model/useEditorBlockStore";

function SessionCacheBoundary({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const router = useRouter();
    const previousUser = useRef<string | null | undefined>(undefined);
    const userId = session?.user?.id ?? null;

    useEffect(() => {
        if (status === "loading") return;
        if (previousUser.current !== undefined && previousUser.current !== userId) {
            queryClient.clear();
            useCreatePostStore.getState().reset();
            usePostDraftImageStore.getState().reset();
            useBlockStore.getState().reset();
            router.refresh();
        }
        previousUser.current = userId;
    }, [status, userId, queryClient, router]);

    return children;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <SessionCacheBoundary>{children}</SessionCacheBoundary>
        </SessionProvider>
    );
}
