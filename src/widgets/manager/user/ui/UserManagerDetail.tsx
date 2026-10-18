"use client";
import { useUserManagerProvider } from "../model/UserManagerContext";
import { util } from "@/shared/lib/util";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";

const UserManagerDetail = () => {
    const { selectedUser } = useUserManagerProvider();
    return (
        <ManagerDetailPane>
            {selectedUser ? (
                <article>
                    <ManagerDetailPaneHeader
                        title={selectedUser.name}
                        description={selectedUser.email}
                    />
                    <div className="p-[2.4rem]">
                        <ManagerDetailMetaGrid
                            items={[
                                { label: "Name", value: selectedUser.name },
                                { label: "Email", value: selectedUser.email },
                                { label: "Member ID", value: selectedUser.id },
                                {
                                    label: "Joined",
                                    value: util.string.getCurrentDate(selectedUser.created_at, 4),
                                },
                            ]}
                        />
                    </div>
                </article>
            ) : (
                <ManagerEmptyState variant="no-item" />
            )}
        </ManagerDetailPane>
    );
};
export default UserManagerDetail;
