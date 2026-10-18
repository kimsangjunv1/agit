import Main from "@/widgets/layout/Main";
import PostModifyView from "@/views/post/[id]/modify/PostModifyView";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    return (
        <Main
            id="post-modify"
            className={{ inner: "flex flex-col gap-[2.4rem]", container: "" }}
        >
            <PostModifyView id={id} />
        </Main>
    );
};

export default Page;
