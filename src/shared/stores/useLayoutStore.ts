import { create } from "zustand";

export type RouteTransitionPhase = "idle" | "covering" | "navigating" | "waiting" | "revealing";
export type RouteTransitionDirection = "forward" | "back";
export type PageReadinessKind = "data" | "image";

export type PendingNavigation = {
    type: "push" | "replace" | "back";
    url?: string;
};

interface LayoutStoreType {
    isMobile: boolean;
    isSearchOpen: boolean;
    isSidebarOpen: boolean;
    isRouteChangeType: 0 | 1 | 2 | 99;
    isRouteChange: 0 | 1 | 2 | 99;
    transitionPhase: RouteTransitionPhase;
    transitionDirection: RouteTransitionDirection;
    pendingNavigation: PendingNavigation | null;
    isPageContentVisible: boolean;
    pageReadinessBlockers: Record<string, true>;
    pageReadinessTasks: Record<string, { ready: boolean; kind: PageReadinessKind }>;
    pageReadinessId: number;
    isPageReadinessComplete: boolean;
    isNeedBackdrop: boolean;
    isNeedNavigation: boolean;
    isMobileMenuOpen: boolean;
    isFloatingMenuOpen: boolean;
    isAccountSidebarOpen: boolean;
    isMiniMapCapture: boolean;
    statusViewMode: number;

    listViewMode: "default" | "grid";

    setListViewMode: (args: "default" | "grid") => void;

    setIsMobile: (args: boolean) => void;
    setIsSearchOpen: (args: boolean) => void;
    setIsSidebarOpen: (args: boolean) => void;
    setIsRouteChangeType: (args: 0 | 1 | 2 | 99) => void;
    setIsRouteChange: (args: 0 | 1 | 2 | 99) => void;
    setTransitionPhase: (args: RouteTransitionPhase) => void;
    beginRouteTransition: (args: { direction: RouteTransitionDirection; navigation: PendingNavigation }) => void;
    beginInitialReveal: () => void;
    setIsPageContentVisible: (args: boolean) => void;
    registerPageBlocker: (key: string, ready?: boolean, kind?: PageReadinessKind) => void;
    releasePageBlocker: (key: string) => void;
    completePageReadiness: () => void;
    resetPageReadiness: () => void;
    completeRouteTransition: () => void;
    setIsNeedBackdrop: (args: boolean) => void;
    setIsNeedNavigation: (args: boolean) => void;
    setIsMobileMenuOpen: (args: boolean) => void;
    setIsFloatingMenuOpen: (args: boolean) => void;
    setIsAccountSidebarOpen: (args: boolean) => void;
    setIsMiniMapCapture: (args: boolean) => void;
    setStatusViewMode: (args: number) => void;
}

export const useLayoutStore = create<LayoutStoreType>()((set) => ({
    isMobile: false,
    isSearchOpen: false,
    isSidebarOpen: false,
    isRouteChangeType: 2,
    isRouteChange: 0,
    transitionPhase: "idle",
    transitionDirection: "forward",
    pendingNavigation: null,
    isPageContentVisible: false,
    pageReadinessBlockers: {},
    pageReadinessTasks: {},
    pageReadinessId: 0,
    isPageReadinessComplete: false,
    isNeedBackdrop: false,
    isNeedNavigation: false,
    isMobileMenuOpen: false,
    isFloatingMenuOpen: false,
    isAccountSidebarOpen: false,
    isMiniMapCapture: false,
    statusViewMode: 0,

    listViewMode: "default",

    setStatusViewMode: (args: number) => {
        set(() => ({
            statusViewMode: args,
        }));
    },
    setIsSearchOpen: (args: boolean) => {
        set(() => ({
            isSearchOpen: args,
        }));
    },
    setIsSidebarOpen: (args: boolean) => {
        set(() => ({
            isSidebarOpen: args,
        }));
    },
    setIsAccountSidebarOpen: (args: boolean) => {
        set(() => ({
            isAccountSidebarOpen: args,
        }));
    },
    setIsRouteChangeType: (args: 0 | 1 | 2 | 99) => {
        set(() => ({
            isRouteChangeType: args,
        }));
    },
    setIsRouteChange: (args: 0 | 1 | 2 | 99) => {
        set(() => ({
            isRouteChange: args,
        }));
    },
    setTransitionPhase: (args: RouteTransitionPhase) => {
        set(() => ({
            transitionPhase: args,
        }));
    },
    beginRouteTransition: ({ direction, navigation }) => {
        set((state) => ({
            transitionPhase: "covering",
            transitionDirection: direction,
            pendingNavigation: navigation,
            isRouteChange: direction === "forward" ? 1 : 99,
            isRouteChangeType: direction === "forward" ? 1 : 2,
            pageReadinessId: state.pageReadinessId + 1,
            pageReadinessBlockers: {},
            pageReadinessTasks: {},
            isPageReadinessComplete: false,
        }));
    },
    beginInitialReveal: () => {
        set((state) => ({
            transitionPhase: "covering",
            transitionDirection: "forward",
            pendingNavigation: null,
            isPageContentVisible: false,
            isRouteChange: 1,
            isRouteChangeType: 1,
            pageReadinessId: state.pageReadinessId + 1,
            pageReadinessBlockers: {},
            pageReadinessTasks: {},
            isPageReadinessComplete: false,
        }));
    },
    setIsPageContentVisible: (args: boolean) => {
        set(() => ({
            isPageContentVisible: args,
        }));
    },
    registerPageBlocker: (key, ready = false, kind = "data") => {
        set((state) => {
            const existing = state.pageReadinessTasks[key];
            if (existing?.ready === ready && existing.kind === kind) return state;

            const blockers = { ...state.pageReadinessBlockers };
            if (ready) delete blockers[key];
            else blockers[key] = true;

            return {
                pageReadinessBlockers: blockers,
                pageReadinessTasks: { ...state.pageReadinessTasks, [key]: { ready, kind } },
            };
        });
    },
    releasePageBlocker: (key: string) => {
        set((state) => {
            const next = { ...state.pageReadinessBlockers };
            const tasks = { ...state.pageReadinessTasks };
            delete next[key];
            delete tasks[key];

            return { pageReadinessBlockers: next, pageReadinessTasks: tasks };
        });
    },
    completePageReadiness: () => {
        set((state) => state.transitionPhase === "waiting" && Object.keys(state.pageReadinessBlockers).length === 0
            ? { isPageReadinessComplete: true }
            : state);
    },
    resetPageReadiness: () => {
        set(() => ({
            pageReadinessBlockers: {},
            pageReadinessTasks: {},
            isPageReadinessComplete: false,
        }));
    },
    completeRouteTransition: () => {
        set(() => ({
            transitionPhase: "idle",
            pendingNavigation: null,
            isRouteChange: 0,
            isRouteChangeType: 0,
            isPageContentVisible: true,
            pageReadinessBlockers: {},
            pageReadinessTasks: {},
        }));
    },
    setIsNeedBackdrop: (args: boolean) => {
        set(() => ({
            isNeedBackdrop: args,
        }));
    },
    setIsNeedNavigation: (args: boolean) => {
        set(() => ({
            isNeedNavigation: args,
        }));
    },
    setIsFloatingMenuOpen: (args: boolean) => {
        set(() => ({
            isFloatingMenuOpen: args,
        }));
    },
    setIsMobile: (args: boolean) => {
        set(() => ({
            isMobile: args,
        }));
    },
    setIsMiniMapCapture: (args: boolean) => {
        set(() => ({
            isMiniMapCapture: args,
        }));
    },
    setIsMobileMenuOpen: (args: boolean) => {
        set(() => ({
            isMobileMenuOpen: args,
        }));
    },
    setListViewMode: (args: "default" | "grid") => {
        set(() => ({
            listViewMode: args,
        }));
    },
}));

// 이동·데이터·이미지 각 단계의 완료 비율을 같은 비중으로 합산해요.
export const getPageReadinessProgress = ({ transitionPhase, pageReadinessTasks }: Pick<LayoutStoreType, "transitionPhase" | "pageReadinessTasks">) => {
    if (transitionPhase !== "waiting") return 0;

    const tasks = Object.values(pageReadinessTasks);
    const data = tasks.filter((task) => task.kind === "data");
    const images = tasks.filter((task) => task.kind === "image");
    const dataProgress = data.length > 0 ? data.filter((task) => task.ready).length / data.length : 1;
    const imageProgress = images.length > 0 ? images.filter((task) => task.ready).length / images.length : dataProgress < 1 ? 0 : 1;

    return (1 + dataProgress + imageProgress) / 3;
};
