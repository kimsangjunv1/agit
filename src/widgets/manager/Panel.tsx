"use client";

import * as ManagerLayer from "@/widgets/manager/ui";

export default function Panel() {
    return (
        <article className="col-span-full h-full min-h-0 overflow-y-auto flex-1 flex flex-col gap-[2.4rem] w-full">
            <ManagerLayer.ManagerTitle />
            <ManagerLayer.ManagerMenu />
        </article>
    );
}
