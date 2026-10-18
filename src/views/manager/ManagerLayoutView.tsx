import { ReactNode } from "react";

import { ManagerLayoutPanel, type ManagerSidebarProfile } from "@/widgets/manager/shared";

type ManagerLayoutViewProps = {
    children: ReactNode;
    profile: ManagerSidebarProfile;
};

export default function ManagerLayoutView({ children, profile }: ManagerLayoutViewProps) {
    return <ManagerLayoutPanel profile={profile}>{children}</ManagerLayoutPanel>;
}
