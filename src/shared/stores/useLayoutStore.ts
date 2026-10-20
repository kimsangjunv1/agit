import { create } from "zustand";

export type RouteTransitionPhase = "idle" | "covering" | "navigating" | "waiting" | "revealing";
export type RouteTransitionDirection = "forward" | "back";

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
    registerPageBlocker: (key: string) => void;
    releasePageBlocker: (key: string) => void;
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
        set(() => ({
            transitionPhase: "covering",
            transitionDirection: direction,
            pendingNavigation: navigation,
            isRouteChange: direction === "forward" ? 1 : 99,
            isRouteChangeType: direction === "forward" ? 1 : 2,
        }));
    },
    beginInitialReveal: () => {
        set(() => ({
            transitionPhase: "covering",
            transitionDirection: "forward",
            pendingNavigation: null,
            isPageContentVisible: false,
            isRouteChange: 1,
            isRouteChangeType: 1,
        }));
    },
    setIsPageContentVisible: (args: boolean) => {
        set(() => ({
            isPageContentVisible: args,
        }));
    },
    registerPageBlocker: (key: string) => {
        set((state) => ({
            pageReadinessBlockers: { ...state.pageReadinessBlockers, [key]: true },
        }));
    },
    releasePageBlocker: (key: string) => {
        set((state) => {
            const next = { ...state.pageReadinessBlockers };
            delete next[key];

            return { pageReadinessBlockers: next };
        });
    },
    resetPageReadiness: () => {
        set(() => ({
            pageReadinessBlockers: {},
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
