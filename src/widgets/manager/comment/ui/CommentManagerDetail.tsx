"use client";
import { useCommentManagerProvider } from "../model/CommentManagerContext";
import { util } from "@/shared/lib/util";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";

const CommentManagerDetail = () => {
    const { pushToUrl, selectedComment, deleteCommentModal } = useCommentManagerProvider();
    return (
        <ManagerDetailPane>
            {selectedComment ? (
                <article>
                    <ManagerDetailPaneHeader
                        title={selectedComment.author}
                        description={selectedComment.posts?.title}
                    />
                    <div className="flex flex-col gap-[2.4rem] p-[2.4rem]">
                        <p className="whitespace-pre-wrap break-words border-y border-[var(--color-gray-300)] py-[2.4rem] text-[1.6rem] leading-[1.8] text-[var(--color-gray-800)]">
                            {selectedComment.msg}
                        </p>
                        <ManagerDetailMetaGrid
                            items={[
                                { label: "Author", value: selectedComment.author },
                                {
                                    label: "Role",
                                    value: selectedComment.is_admin ? "관리자" : "일반",
                                },
                                {
                                    label: "Post",
                                    value: selectedComment.posts?.title ?? selectedComment.post_id,
                                },
                                {
                                    label: "Created",
                                    value: util.string.getCurrentDate(selectedComment.created_at, 4),
                                },
                            ]}
                        />
                        <div className="flex gap-[0.8rem]">
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-gray-300)] px-[1.2rem] py-[0.8rem]"
                                onClick={() => pushToUrl(`/post/${selectedComment.post_id}`)}
                            >
                                게시물 이동
                            </UI.Button>
                            <UI.Button
                                className="rounded-[0.8rem] border border-[var(--color-red-200)] px-[1.2rem] py-[0.8rem] text-[var(--color-red-600)]"
                                onClick={() => deleteCommentModal(selectedComment)}
                            >
                                삭제
                            </UI.Button>
                        </div>
                    </div>
                </article>
            ) : (
                <ManagerEmptyState variant="no-item" />
            )}
        </ManagerDetailPane>
    );
};
export default CommentManagerDetail;
