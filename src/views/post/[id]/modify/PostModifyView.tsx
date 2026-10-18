import { ComponentProps } from "react";

import { PostModifyPanel } from "@/widgets/post/[id]/modify";

type PostModifyViewProps = ComponentProps<typeof PostModifyPanel>;

export default function PostModifyView(props: PostModifyViewProps) {
    return <PostModifyPanel {...props} />;
}
