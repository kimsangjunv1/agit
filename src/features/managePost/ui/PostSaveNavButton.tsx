"use client";

import UI from "@/shared/ui/common/UIComponent";
import IconComponent from "@/shared/ui/common/IconComponent";
import { MaterialIcon } from "@/shared/ui/common/MaterialIcon";

type PostSaveNavButtonProps = {
    isCreate: boolean;
    isPending: boolean;
    onSave: () => void;
};

const PostSaveNavButton = ({ isCreate, isPending, onSave }: PostSaveNavButtonProps) => (
    // <UI.Button
    //     type="button"
    //     disabled={isPending}
    //     onClick={onSave}
    //     className="bg-white hover:bg-[var(--color-blue-500)] transition-colors p-[1.2rem] rounded-full shadow-[var(--shadow-normal)] flex gap-[0.8rem] items-center disabled:opacity-60"
    // >
    //     <p className="text-black mr-[1.6rem] text-[1.6rem] font-semibold tablet:block mobile:hidden">{isCreate ? "작성하기" : "수정완료"}</p>

    //     <IconComponent
    //         type="outlined-arrow-below"
    //         alt="나가기"
    //         width={32}
    //         height={32}
    //         className="rotate-90"
    //     />
    // </UI.Button>
    <UI.Button
        type="button"
        disabled={isPending}
        onClick={onSave}
        className="transition-colors flex flex-col items-end z-1"
    >
        <p className="bg-[var(--color-surface-floating)] text-[#00ff61] p-[2rem] text-[2.4rem] font-semibold tablet:block mobile:hidden">{isPending ? "로딩중..." : isCreate ? "작성하기" : "수정하기"}</p>
        <MaterialIcon
            name="check"
            size={24}
            className="bg-[var(--color-surface-floating)] text-[#00ff61] p-[2rem]"
        />
    </UI.Button>
);

export default PostSaveNavButton;
