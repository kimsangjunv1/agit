"use client";
import { useGetCommentManagerListQuery } from "@/entities/comment/api/comment.query";
import type { CommentManagerItem } from "@/entities/comment/model/comment.type";
import useNavigate from "@/shared/hooks/useNavigate";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useDeleteCommentWithToast } from "@/widgets/manager/comment/model/useCommentMutations";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

const useCommentManager = () => {
    const { pushToUrl } = useNavigate();
    const { setModal } = useModalStore();
    const { data, isLoading, isError, error, refetch } = useGetCommentManagerListQuery();
    const { mutateAsync: deleteComment } = useDeleteCommentWithToast();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const list = data?.result ?? [];
    const selectedComment = list.find((item) => String(item.idx) === selectedItem);
    const deleteCommentModal = (item: CommentManagerItem) =>
        setModal({
            type: "CHECK",
            title: "댓글을 삭제할까요?",
            content: (
                <p className="text-[var(--color-gray-600)]">
                    {item.author}: {item.msg}
                </p>
            ),
            cancel: { text: "취소" },
            confirm: {
                text: "삭제하기",
                onClick: () => deleteComment({ idx: item.idx }),
            },
            isOpen: true,
        });
    return {
        pushToUrl,
        setModal,
        data,
        isLoading,
        isError,
        error,
        refetch,
        deleteComment,
        selectedItem,
        setSelectedItem,
        list,
        selectedComment,
        deleteCommentModal,
    };
};
export default useCommentManager;
