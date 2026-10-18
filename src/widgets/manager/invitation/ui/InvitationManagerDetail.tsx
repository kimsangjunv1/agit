"use client";
import { useInvitationManagerProvider } from "../model/InvitationManagerContext";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";

const InvitationManagerDetail = () => {
    const { patchInvitation, selectedInvitation, deleteInvitationModal } = useInvitationManagerProvider();
    return (
        <ManagerDetailPane>
            {selectedInvitation ? (
                <article>
                    <ManagerDetailPaneHeader
                        title={selectedInvitation.code}
                        description="회원가입에 사용하는 초대코드입니다."
                    />
                    <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                        <div className="flex items-center justify-between border-b border-[var(--color-gray-300)] pb-[1.6rem]">
                            <span className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Status</span>
                            <UI.Switch
                                states={selectedInvitation.is_active}
                                onChange={(is_active) =>
                                    patchInvitation({
                                        id: selectedInvitation.id,
                                        is_active,
                                        expire_at: selectedInvitation.expire_at,
                                    })
                                }
                            />
                        </div>
                        <ManagerDetailMetaGrid
                            items={[
                                { label: "Code", value: selectedInvitation.code },
                                {
                                    label: "Used",
                                    value: selectedInvitation.is_used ? "사용됨" : "미사용",
                                },
                                { label: "Used by", value: selectedInvitation.used_by ?? "—" },
                                {
                                    label: "Created",
                                    value: util.string.getCurrentDate(selectedInvitation.created_at, 4),
                                },
                                {
                                    label: "Expires",
                                    value: selectedInvitation.expire_at ? util.string.getCurrentDate(selectedInvitation.expire_at, 4) : "없음",
                                },
                            ]}
                        />
                        <UI.Button
                            className="self-start rounded-[0.8rem] border border-[var(--color-red-200)] px-[1.2rem] py-[0.8rem] text-[var(--color-red-600)]"
                            onClick={() => deleteInvitationModal(selectedInvitation)}
                        >
                            삭제
                        </UI.Button>
                    </div>
                </article>
            ) : (
                <ManagerEmptyState variant="no-item" />
            )}
        </ManagerDetailPane>
    );
};
export default InvitationManagerDetail;
