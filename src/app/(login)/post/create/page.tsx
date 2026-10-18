import Main from "@/widgets/layout/Main";
import PostCreateView from "@/views/post/create/PostCreateView";

const Page = async () => {
    return (
        <Main
            id="post-create"
            className={{ inner: "flex flex-col gap-[2.4rem]", container: "" }}
        >
            <PostCreateView />
        </Main>
    );
};

export default Page;
