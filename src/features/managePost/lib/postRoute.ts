export const getPostRouteFlags = (currentPathName: string) => {
    const IS_ROUTE_POST = /\/post(\/|$)/.test(currentPathName);
    const IS_ROUTE_POST_EDIT = currentPathName.includes("post") && currentPathName.includes("modify");
    const IS_ROUTE_POST_CREATE = currentPathName.includes("post") && currentPathName.includes("create");
    const IS_ROUTE_POST_VIEW = IS_ROUTE_POST && !IS_ROUTE_POST_EDIT && !IS_ROUTE_POST_CREATE;

    return {
        IS_ROUTE_POST,
        IS_ROUTE_POST_EDIT,
        IS_ROUTE_POST_CREATE,
        IS_ROUTE_POST_VIEW,
    };
};
