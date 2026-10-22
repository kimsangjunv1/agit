"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { updatePostLikeCaches } from "@/entities/post/lib/updatePostLikeCaches";
import { CheerUpQueue } from "@/features/managePost/lib/cheerUpQueue";
import { useToastStore } from "@/shared/stores/useToastStore";

const queues = new Map<string, CheerUpQueue>();
let activeUserId: string | null = null;
const emptySubscribe = () => () => undefined;
const emptySnapshot = () => 0;

const getQueue = (userId: string) => {
    let queue = queues.get(userId);
    if (!queue) {
        queue = new CheerUpQueue(userId, {
            onError: () => useToastStore.getState().setToast({ msg: "Cheer Up 저장 여부를 확인하지 못했어요.", type: "fail", time: 3 }),
        });
        queues.set(userId, queue);
    }
    return queue;
};

const activateUser = (userId: string | null) => {
    if (activeUserId !== userId) {
        if (activeUserId) queues.get(activeUserId)?.stop();
        activeUserId = userId;
    }
    if (userId) getQueue(userId).start();
};

export const useCheerUp = (postId: number, serverCount: number): { count: number; cheer: () => boolean; hasCheered: boolean } => {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const userId = session?.user?.id ?? null;
    const queue = useMemo(() => userId && typeof window !== "undefined" ? getQueue(userId) : undefined, [userId]);
    useSyncExternalStore(queue?.subscribe ?? emptySubscribe, queue?.getVersion ?? emptySnapshot, emptySnapshot);

    useEffect(() => {
        if (queue && userId) queue.setOnConfirmed((id, likes) => updatePostLikeCaches(queryClient, id, userId, likes));
    }, [queue, queryClient, userId]);

    useEffect(() => {
        if (status === "loading") return;
        activateUser(userId);
        if (!queue || !Number.isSafeInteger(postId) || postId <= 0) return;
        return queue.watch(postId);
    }, [queue, userId, postId, status]);

    useEffect(() => { queue?.seed(postId, serverCount); }, [queue, postId, serverCount]);

    const cheer = useCallback(() => {
        if (!userId || !queue) {
            useToastStore.getState().setToast({ msg: "로그인이 필요합니다", time: 2 });
            return false;
        }
        activateUser(userId);
        queue.seed(postId, serverCount);
        return queue.cheer(postId);
    }, [userId, queue, postId, serverCount]);

    return { count: queue?.getCount(postId, serverCount) ?? serverCount, cheer, hasCheered: queue?.hasCheered(postId) ?? false };
};
