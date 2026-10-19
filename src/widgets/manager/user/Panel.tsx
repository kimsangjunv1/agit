"use client";
import { UserManagerPageProvider } from "./model/UserManagerContext";
import * as Layer from "@/widgets/manager/user/ui";
export default function Panel() {
    return (
        <UserManagerPageProvider>
            <Layer.UserManagerList />
            <Layer.UserManagerDetail />
        </UserManagerPageProvider>
    );
}
