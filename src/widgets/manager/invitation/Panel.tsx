"use client";
import { InvitationManagerPageProvider } from "./model/InvitationManagerContext";
import * as Layer from "@/widgets/manager/invitation/ui";
export default function Panel() {
    return (
        <InvitationManagerPageProvider>
            <Layer.InvitationManagerList />
            <Layer.InvitationManagerDetail />
            <Layer.Modal />
        </InvitationManagerPageProvider>
    );
}
