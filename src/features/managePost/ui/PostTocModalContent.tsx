"use client";

import type { PostTocItem } from "@/entities/post/lib/postToc";

type PostTocModalContentProps = {
    items: PostTocItem[];
    onNavigate: (id: string) => void;
};

const PostTocModalContent = ({ items, onNavigate }: PostTocModalContentProps) => (
    <ul className="flex max-h-[50svh] flex-col gap-[0.4rem] overflow-y-auto">
        {items.map((item) => {
            const isMain = item.level === 1;

            return (
                <li key={item.id}>
                    <button
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={`w-full text-left transition-colors ${
                            isMain
                                ? "rounded-[0.8rem] px-[1.2rem] py-[0.8rem] text-[1.6rem] font-bold leading-[1.4] text-[var(--color-gray-800)] hover:bg-[var(--color-gray-100)]"
                                : "truncate rounded-[0.8rem] px-[1.2rem] py-[0.8rem] pl-[2.4rem] text-[1.6rem] leading-[1.4] text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-900)]"
                        }`}
                    >
                        {item.label}
                    </button>
                </li>
            );
        })}
    </ul>
);

export default PostTocModalContent;
