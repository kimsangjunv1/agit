import { useLayoutEffect } from "react";

import { useLayoutStore, type PageReadinessKind } from "@/shared/stores/useLayoutStore";

const usePageTransitionReady = (key: string, isReady: boolean, kind: PageReadinessKind = "data") => {
    const transitionPhase = useLayoutStore((state) => state.transitionPhase);
    const registerPageBlocker = useLayoutStore((state) => state.registerPageBlocker);
    const releasePageBlocker = useLayoutStore((state) => state.releasePageBlocker);

    const isWaiting = transitionPhase === "waiting";

    useLayoutEffect(() => {
        if (!isWaiting) return;

        return () => {
            if (useLayoutStore.getState().transitionPhase === "waiting") releasePageBlocker(key);
        };
    }, [key, isWaiting, releasePageBlocker]);

    useLayoutEffect(() => {
        if (isWaiting) registerPageBlocker(key, isReady, kind);
    }, [key, isReady, kind, isWaiting, registerPageBlocker]);
};

export default usePageTransitionReady;
