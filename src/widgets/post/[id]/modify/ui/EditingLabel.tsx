"use client";

import { usePostModifyProvider } from "../model/PostModifyContext";

const EditingLabel = () => {
    const { title } = usePostModifyProvider();

    return <h2 className="fixed bottom-[5.2rem] left-[5.2rem] z-20 truncate text-[1.4rem] leading-[1.5] opacity-[0.5]">{`${title || "글 편집"} | 수정중`}</h2>;
};

export default EditingLabel;
