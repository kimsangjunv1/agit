import type { ReactNode } from "react";

import ManagerSidebar, { type ManagerSidebarProfile } from "./ui/ManagerSidebar";
import ManagerThreePaneShell from "./ui/ManagerThreePaneShell";

type ManagerLayoutPanelProps = {
    children: ReactNode;
    profile: ManagerSidebarProfile;
};

const ManagerLayoutPanel = ({ children, profile }: ManagerLayoutPanelProps) => {
    return <ManagerThreePaneShell sidebar={<ManagerSidebar profile={profile} />}>{children}</ManagerThreePaneShell>;
};

export default ManagerLayoutPanel;
