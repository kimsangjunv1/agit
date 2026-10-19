import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useDirtyStore } from "@/shared/stores/useDirtyStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

const useNavigate = (_fallbackUrl = "/new-home") => {
    const router = useRouter();
    const pathName = usePathname();

    const { setModal } = useModalStore();
    const { isDirty, resetDirty } = useDirtyStore();
    const { beginRouteTransition } = useLayoutStore();

    const DEFENCE_ROUTE = ["/", "/new-home", "/check", "/password", "/exit/receipt", "/exit/payment"];

    const setPreventModal = ({ onClick }: { onClick: () => void }) =>
        setModal({
            type: "CHECK",
            title: "저장하지 않고 나가시겠어요?",
            description: "변경 사항이 모두 사라져요.",
            cancel: { text: "취소" },
            confirm: {
                text: "나가기",
                onClick: () => {
                    onClick();
                    resetDirty();
                },
            },
            isOpen: true,
        });

    const pushToUrl = (url: string) => {
        if (useLayoutStore.getState().transitionPhase !== "idle") return;

        const MOVE = () => {
            if (new URL(url, window.location.href).pathname === pathName) {
                router.push(url);
                return;
            }

            beginRouteTransition({
                direction: "forward",
                navigation: { type: "push", url },
            });
        };

        if (isDirty) {
            setPreventModal({ onClick: () => MOVE() });
        } else {
            MOVE();
        }
    };

    const replaceToUrl = (url: string, animation: boolean = true) => {
        if (useLayoutStore.getState().transitionPhase !== "idle") return;

        const MOVE = () => {
            if (animation && new URL(url, window.location.href).pathname !== pathName) {
                beginRouteTransition({
                    direction: "forward",
                    navigation: { type: "replace", url },
                });
                return;
            }

            router.replace(url);
        };

        if (isDirty) {
            setPreventModal({ onClick: () => MOVE() });
        } else {
            MOVE();
        }
    };

    const backToUrl = () => {
        if (useLayoutStore.getState().transitionPhase !== "idle") return;

        const MOVE = () => {
            beginRouteTransition({
                direction: "back",
                navigation: { type: "back" },
            });
        };

        if (isDirty) {
            setPreventModal({ onClick: () => MOVE() });
        } else {
            MOVE();
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    return {
        pushToUrl,
        replaceToUrl,
        backToUrl,
        currentPathName: pathName,
        isLandingPage: DEFENCE_ROUTE.includes(pathName),
    };
};

export default useNavigate;
