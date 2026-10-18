type PostPermissionContext = {
    userId?: string;
    userRole?: string;
    postOwnerId?: string | null;
};

export type PostNavVisibility = {
    showShare: boolean;
    showLike: boolean;
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

export const getPostNavVisibility = ({ canManage, isView, hasToc }: { canManage: boolean; isView: boolean; hasToc: boolean }): PostNavVisibility => ({
    showShare: isView,
    showLike: isView,
    showComments: isView,
    showToc: isView && hasToc,
    showReading: isView,
    showEdit: canManage,
    showDelete: canManage,
});

export const hasVisiblePostNavActions = (visibility: PostNavVisibility) => Object.values(visibility).some(Boolean);
