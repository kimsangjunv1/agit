"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { updatePostLikeCaches } from "@/entities/post/lib/updatePostLikeCaches";
import { CheerUpQueue } from "@/features/managePost/lib/cheerUpQueue";
import { useToastStore } from "@/shared/stores/useToastStore";

const GUEST_ACTOR_KEY = "cheer-up:v1:guest";
const queues = new Map<string, CheerUpQueue>();
let activeActorId: string | null = null;
let guestActorId: string | undefined;
const emptySubscribe = () => () => undefined;
const emptySnapshot = () => 0;

const getGuestActorId = () => {
    if (guestActorId) return guestActorId;
    try {
        const stored = localStorage.getItem(GUEST_ACTOR_KEY);
        if (stored) return (guestActorId = stored);
        const created = crypto.randomUUID();
        localStorage.setItem(GUEST_ACTOR_KEY, created);
        return (guestActorId = created);
    } catch {
        return (guestActorId = crypto.randomUUID());
    }
};

const getQueue = (actorId: string) => {
    let queue = queues.get(actorId);
    if (!queue) {
        queue = new CheerUpQueue(actorId, {
            onError: () => useToastStore.getState().setToast({ msg: "Cheer Up 저장 여부를 확인하지 못했어요.", type: "fail", time: 3 }),
        });
        queues.set(actorId, queue);
    }
    return queue;
};

const activateActor = (actorId: string | null) => {
    if (activeActorId !== actorId) {
        if (activeActorId) queues.get(activeActorId)?.stop();
        activeActorId = actorId;
    }
    if (actorId) getQueue(actorId).start();
};

export const useCheerUp = (postId: number, serverCount: number): { count: number; cheer: () => boolean; hasCheered: boolean } => {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const sessionUserId = session?.user?.id ?? null;
    const actorId = status !== "loading" && typeof window !== "undefined" ? (sessionUserId ?? getGuestActorId()) : null;
    const queue = useMemo(() => actorId ? getQueue(actorId) : undefined, [actorId]);
    const serverCountRef = useRef(serverCount);
    const pendingCheers = useRef(0);
    serverCountRef.current = serverCount;
    useSyncExternalStore(queue?.subscribe ?? emptySubscribe, queue?.getVersion ?? emptySnapshot, emptySnapshot);

    useEffect(() => {
        if (!queue || status === "loading") return;
        queue.setOnConfirmed((id, likes) => updatePostLikeCaches(queryClient, id, sessionUserId, likes));
    }, [queue, queryClient, sessionUserId, status]);

    useEffect(() => { queue?.seed(postId, serverCount); }, [queue, postId, serverCount]);

    useEffect(() => {
        if (status === "loading" || !actorId || !queue || !Number.isSafeInteger(postId) || postId <= 0) return;
        activateActor(actorId);
        const pending = pendingCheers.current;
        pendingCheers.current = 0;
        queue.seed(postId, serverCountRef.current);
        for (let index = 0; index < pending; index += 1) queue.cheer(postId);
        return queue.watch(postId);
    }, [queue, actorId, postId, status]);

    const cheer = useCallback(() => {
        if (status === "loading" || !actorId || !queue) {
            pendingCheers.current += 1;
            return true;
        }
        activateActor(actorId);
        queue.seed(postId, serverCount);
        return queue.cheer(postId);
    }, [status, actorId, queue, postId, serverCount]);

    return { count: queue?.getCount(postId, serverCount) ?? serverCount, cheer, hasCheered: queue?.hasCheered(postId) ?? false };
};
