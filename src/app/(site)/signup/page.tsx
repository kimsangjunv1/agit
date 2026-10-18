import type { Metadata } from "next";

import { NOINDEX_METADATA } from "@/shared/lib/seo/metadata";
import Main from "@/widgets/layout/Main";
import SignupView from "@/views/signup/SignupView";

export const metadata: Metadata = NOINDEX_METADATA;

const Page = async () => {
    return (
        <Main
            id="signup"
            className={{ inner: "flex flex-col gap-[2.4rem]", container: "" }}
        >
            <SignupView />
        </Main>
    );
};

export default Page;
