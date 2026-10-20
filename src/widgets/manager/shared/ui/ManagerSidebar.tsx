"use client";

import { usePathname } from "next/navigation";

import TransitionLink from "@/shared/ui/common/TransitionLink";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";

import { MANAGER_MENUS } from "./managerMenus";

export type ManagerSidebarProfile = {
    name?: string | null;
    email?: string | null;
};

type ManagerSidebarProps = {
    profile: ManagerSidebarProfile;
};

const MENU_ICONS: Record<string, string> = {
    "/manager/category": "category",
    "/manager/invitation": "confirmation_number",
    "/manager/post": "article",
    "/manager/user": "group",
    "/manager/comment": "chat_bubble",
    "/manager/images": "image",
};

const ManagerSidebar = ({ profile }: ManagerSidebarProps) => {
    const pathname = usePathname();
    const profileName = profile.name || "관리자";
    const profileInitial = profileName.trim().charAt(0).toUpperCase() || "A";

    return (
        <>
            <aside className="hidden h-full min-h-0 flex-col border-r border-[var(--color-gray-300)] bg-[var(--color-gray-100)] px-[2rem] py-[2.4rem] tablet:flex">
                <TransitionLink
                    href="/manager"
                    className="mb-[3.2rem] flex items-center gap-[1.2rem] text-[1.6rem] font-bold tracking-[0.08em]"
                >
                    <span className="flex size-[2.8rem] items-center justify-center rounded-[0.8rem] bg-[var(--color-surface-floating)] text-[1.2rem] text-[var(--color-text-primary)]">A</span>
                    AGIT ADMIN
                </TransitionLink>

                <p className="mb-[1.2rem] px-[1.2rem] text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Management</p>
                <nav
                    className="flex flex-col gap-[0.4rem]"
                    aria-label="관리자 메뉴"
                >
                    {MANAGER_MENUS.map((menu) => {
                        const isActive = pathname === menu.url || pathname.startsWith(`${menu.url}/`);

                        return (
                            <TransitionLink
                                key={menu.url}
                                href={menu.url}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-[1.2rem] rounded-[0.8rem] px-[1.2rem] py-[1.2rem] text-[1.6rem] font-medium transition-colors ${
                                    isActive
                                        ? "bg-[var(--color-surface)] text-[var(--color-gray-1000)] shadow-[var(--shadow-normal)]"
                                        : "text-[var(--color-gray-600)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-gray-900)]"
                                }`}
                            >
                                <MaterialIcon
                                    name={MENU_ICONS[menu.url] ?? "settings"}
                                    size={20}
                                />
                                {menu.title}
                            </TransitionLink>
                        );
                    })}
                </nav>

                <div className="mt-auto flex items-center gap-[1.2rem] border-t border-[var(--color-gray-300)] pt-[1.6rem]">
                    <span className="flex size-[3.6rem] shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-floating)] text-[1.2rem] font-bold text-[var(--color-text-primary)]">{profileInitial}</span>
                    <div className="min-w-0">
                        <p className="truncate text-[1.2rem] font-semibold text-[var(--color-gray-900)]">{profileName}</p>
                        <p className="truncate text-[1.2rem] text-[var(--color-gray-500)]">{profile.email}</p>
                    </div>
                </div>
            </aside>
            <details className="relative border-b border-[var(--color-gray-300)] bg-[var(--color-gray-100)] tablet:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-[1.6rem] py-[1.2rem] text-[1.2rem] font-semibold">
                    관리자 메뉴
                    <MaterialIcon
                        name="menu"
                        size={20}
                    />
                </summary>
                <nav
                    className="absolute left-0 top-full z-[120] grid w-full grid-cols-2 gap-[0.8rem] border-b border-[var(--color-gray-300)] bg-[var(--color-gray-100)] p-[1.2rem] shadow-[var(--shadow-normal)]"
                    aria-label="모바일 관리자 메뉴"
                >
                    {MANAGER_MENUS.map((menu) => (
                        <TransitionLink
                            key={menu.url}
                            href={menu.url}
                            className={`rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.2rem] ${pathname === menu.url ? "bg-[var(--color-surface)] font-semibold" : "text-[var(--color-gray-600)]"}`}
                        >
                            {menu.title}
                        </TransitionLink>
                    ))}
                </nav>
            </details>
        </>
    );
};

export default ManagerSidebar;
