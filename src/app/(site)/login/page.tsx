import type { Metadata } from "next";

import { NOINDEX_METADATA } from "@/shared/lib/seo/metadata";
import Main from "@/widgets/layout/Main";
import LoginView from "@/views/login/LoginView";

export const metadata: Metadata = NOINDEX_METADATA;

const Page = async () => {
    return (
        <Main
            id="login"
            className={{ inner: "flex flex-col gap-[2.4rem]", container: "" }}
        >
            <LoginView />
        </Main>
    );
};

export default Page;
