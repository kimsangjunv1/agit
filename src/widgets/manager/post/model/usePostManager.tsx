"use client";
import { useGetPostManagerListQuery } from "@/entities/post/api/post.query";
import type { PostManagerItem } from "@/entities/post/model/post.type";
import useNavigate from "@/shared/hooks/useNavigate";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useDeletePostManagerWithToast } from "@/widgets/manager/post/model/usePostManagerMutations";
import useManagerSelection from "@/widgets/manager/shared/model/useManagerSelection";

const usePostManager = () => {
    const { pushToUrl } = useNavigate();
    const { setModal } = useModalStore();
    const { data, isLoading, isError, error, refetch } = useGetPostManagerListQuery();
    const { mutateAsync: deletePost } = useDeletePostManagerWithToast();
    const { selectedItem, setSelectedItem } = useManagerSelection();
    const list = data?.result ?? [];
    const selectedPost = list.find((item) => String(item.idx) === selectedItem);
    const deletePostModal = (item: PostManagerItem) =>
        setModal({
            type: "CHECK",
            title: "게시물을 삭제할까요?",
            content: (
                <div className="flex flex-col gap-[1.2rem]">
                    <p className="text-[var(--color-gray-600)]">삭제 대상: {item.title}</p>
                    <p className="text-[1.2rem] text-[var(--color-gray-500)]">연결된 댓글과 조회 기록도 함께 삭제됩니다.</p>
                </div>
            ),
            cancel: { text: "취소" },
            confirm: {
                text: "삭제하기",
                onClick: () => deletePost({ idx: item.idx }),
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
        deletePost,
        selectedItem,
        setSelectedItem,
        list,
        selectedPost,
        deletePostModal,
    };
};
export default usePostManager;
