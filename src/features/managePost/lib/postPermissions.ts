type PostPermissionContext = {
    userId?: string;
    userRole?: string;
    postOwnerId?: string | null;
};

export type PostNavVisibility = {
    showShare: boolean;
    showComments: boolean;
    showToc: boolean;
    showReading: boolean;
    showEdit: boolean;
    showDelete: boolean;
};

export const canManagePost = ({ userId, userRole, postOwnerId }: PostPermissionContext) => {
    if (userRole === "admin") return true;
    if (!userId || !postOwnerId) return false;

    return userId === postOwnerId;
};

export const canShowPostComments = (postType?: string) => postType !== "til" && postType !== "diary";

export const getPostNavVisibility = ({ canManage, isView, hasToc, postType }: { canManage: boolean; isView: boolean; hasToc: boolean; postType?: string }): PostNavVisibility => ({
    showShare: isView,
    showComments: isView && canShowPostComments(postType),
    showToc: isView && hasToc,
    showReading: isView,
    showEdit: canManage,
    showDelete: canManage,
});

export const hasVisiblePostNavActions = (visibility: PostNavVisibility) => Object.values(visibility).some(Boolean);
