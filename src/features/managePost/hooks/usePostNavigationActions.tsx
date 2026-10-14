"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { useGetPostDetailQuery } from "@/entities/post/api/post.query";
import { savePostDraftFetch } from "@/entities/post/api/post.api";
import type { SectionContent } from "@/entities/post/model/post.type";
import {
    useDeletePostWithFeedback,
    useLikeIncrementWithFeedback,
    usePatchPostWithFeedback,
    useSetPostWithFeedback,
} from "@/features/managePost/hooks/usePostMutations";
import { preparePostPayloadForSave } from "@/features/managePost/lib/preparePostSave";
import type { PostNavAction } from "@/features/managePost/lib/postNavigationActions";
import {
    canManagePost,
    getPostNavVisibility,
    hasVisiblePostNavActions,
} from "@/features/managePost/lib/postPermissions";
import PostTocModalContent from "@/features/managePost/ui/PostTocModalContent";
import { buildPostToc } from "@/widgets/post/lib/postToc";
import { util } from "@/shared/lib/util";
import { useCreatePostStore } from "@/shared/stores/useCreatePostStore";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useToastStore } from "@/shared/stores/useToastStore";

type UsePostNavigationActionsParams = {
    postIdx: number;
    isView: boolean;
    isCreate: boolean;
    isEdit: boolean;
    pushToUrl: (url: string) => void;
};

export const usePostNavigationActions = ({
    postIdx,
    isView,
    isCreate,
    isEdit,
    pushToUrl,
}: UsePostNavigationActionsParams) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { setToast } = useToastStore();
    const { setModal } = useModalStore();
    const { title, summary, thumbnail, category_idx, post_idx, draft_id, setDraftId } = useCreatePostStore();
    const [isDraftPending, setIsDraftPending] = useState(false);

    const { data: postDetailData } = useGetPostDetailQuery(postIdx, undefined, {
        enabled: !!postIdx && isView,
    });

    const { mutateAsync: patchPostFetchAsync, isPending: isPatchPending } = usePatchPostWithFeedback();
    const { mutateAsync: setPostFetchAsync, isPending: isSetPending } = useSetPostWithFeedback();
    const { mutate: likeIncrementFetch } = useLikeIncrementWithFeedback();
    const { mutateAsync: deletePostFetchAsync, isPending: isDeletePending } = useDeletePostWithFeedback();

    const canManage = useMemo(
        () =>
            canManagePost({
                userId: session?.user?.id,
                userRole: session?.user?.role,
                postOwnerId: postDetailData?.result?.user_id,
            }),
        [postDetailData?.result?.user_id, session?.user?.id, session?.user?.role],
    );

    const tocItems = useMemo(
        () => buildPostToc(postDetailData?.result?.contents ?? []),
        [postDetailData?.result?.contents],
    );
    const hasToc = tocItems.length > 0;

    const navVisibility = useMemo(
        () => getPostNavVisibility({ canManage, isView, hasToc }),
        [canManage, hasToc, isView],
    );

    const hasNavActions = hasVisiblePostNavActions(navVisibility);

    const savePost = async (contents: SectionContent[][]) => {
        if (!title) {
            setToast({ msg: "제목을 입력해주세요", time: 2 });
            return;
        }

        if (!summary) {
            setToast({ msg: "요약을 입력해주세요", time: 2 });
            return;
        }

        if (!thumbnail) {
            setToast({ msg: "썸네일을 선택해주세요", time: 2 });
            return;
        }

        if (!category_idx) {
            setToast({ msg: "카테고리를 선택해주세요", time: 2 });
            return;
        }

        try {
            const payload = await preparePostPayloadForSave({
                title,
                summary,
                thumbnail,
                category_idx,
                contents,
            });

            if (isCreate) {
                await setPostFetchAsync({ ...payload, draftId: draft_id });
            } else if (isEdit) {
                await patchPostFetchAsync({ data: payload, idx: post_idx });
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.";
            setToast({ msg: message, time: 2 });
        }
    };

    const saveDraft = async (contents: SectionContent[][]) => {
        if (isDraftPending) return;

        setIsDraftPending(true);
        try {
            const payload = await preparePostPayloadForSave({
                title,
                summary,
                thumbnail,
                category_idx,
                contents,
            });
            const response = await savePostDraftFetch({ ...payload, id: draft_id ?? undefined });
            setDraftId(response.result.id);
            setToast({ msg: "임시저장했어요", type: "success" });
        } catch (error) {
            setToast({
                msg: error instanceof Error ? error.message : "임시저장에 실패했어요",
                type: "fail",
            });
        } finally {
            setIsDraftPending(false);
        }
    };

    const openDeletePostModal = () => {
        const postTitle = postDetailData?.result?.title;

        setModal({
            type: "CHECK",
            title: "게시물을 삭제할까요?",
            content: (
                <article className="flex flex-col gap-[1.2rem]">
                    <p className="text-[var(--color-gray-600)]">삭제 대상: {postTitle}</p>
                    <p className="text-[1.2rem] text-[var(--color-gray-500)]">
                        연결된 댓글과 조회 기록도 함께 삭제됩니다.
                    </p>
                </article>
            ),
            cancel: { text: "취소" },
            confirm: {
                text: "삭제하기",
                onClick: async () => {
                    await deletePostFetchAsync({ idx: postIdx });
                    router.refresh();
                    pushToUrl("/");
                },
            },
            isOpen: true,
        });
    };

    const scrollToComments = () => {
        document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const scrollToTocSection = (id: string) => {
        setModal({ isOpen: false });
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const openTocModal = () => {
        const items = buildPostToc(postDetailData?.result?.contents ?? []);

        if (items.length === 0) {
            setToast({ msg: "목차가 없어요", time: 2 });
            return;
        }

        setModal({
            type: "INFO",
            title: "목차",
            content: (
                <PostTocModalContent
                    items={items}
                    onNavigate={scrollToTocSection}
                />
            ),
            cancel: { text: "닫기" },
            isOpen: true,
        });
    };

    const handleNavAction = (action: PostNavAction) => {
        if (action === "share") {
            util.dom.setCopyOnClipboard(window.location.href);
            setToast({ msg: "링크를 복사했어요", time: 2 });
            return;
        }

        if (action === "like") {
            if (!session?.user?.id) {
                setToast({ msg: "로그인이 필요합니다", time: 2 });
                return;
            }

            likeIncrementFetch({ postId: postIdx, userId: session.user.id });
            return;
        }

        if (action === "comments") {
            scrollToComments();
            return;
        }

        if (action === "toc") {
            openTocModal();
            return;
        }

        if (action === "edit") {
            pushToUrl(`/post/${post_idx}/modify`);
            return;
        }

        if (action === "delete") {
            openDeletePostModal();
        }
    };

    return {
        postTitle: postDetailData?.result?.title,
        tocItems,
        alreadyLiked: postDetailData?.result?.alreadyLiked,
        likeCount: postDetailData?.result?.likes ?? 0,
        navVisibility,
        hasNavActions,
        isPatchPending,
        isSetPending,
        isDeletePending,
        isSavePending: isPatchPending || isSetPending,
        savePost,
        saveDraft,
        isDraftPending,
        handleNavAction,
    };
};
