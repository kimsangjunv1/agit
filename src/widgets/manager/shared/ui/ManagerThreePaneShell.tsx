"use client";

import type { ReactNode } from "react";

type ManagerThreePaneShellProps = {
    sidebar: ReactNode;
    children: ReactNode;
};

const ManagerThreePaneShell = ({ sidebar, children }: ManagerThreePaneShellProps) => {
    return (
        <div className="grid h-[100svh] grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden pt-[var(--header-height)] tablet:grid-cols-[20rem_minmax(0,1fr)] tablet:grid-rows-1 tablet:pt-[var(--header-height)] pc:grid-cols-[24rem_minmax(0,1fr)]">
            <div className="min-w-0">{sidebar}</div>
            <div className="grid min-h-0 min-w-0 grid-cols-1 pc:grid-cols-[minmax(28rem,36rem)_minmax(32rem,1fr)]">{children}</div>
        </div>
    );
};

export default ManagerThreePaneShell;
