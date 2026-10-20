"use client";

import Image from "next/image";

import type { PostImageInventoryItem } from "@/entities/post-image/lib/postImageInventory";
import { formatBytes } from "@/entities/post-image/lib/postImageInventory";
import { util } from "@/shared/lib/util";
import { useToastStore } from "@/shared/stores/useToastStore";
import UI from "@/shared/ui/common/UIComponent";
import ManagerDetailMetaGrid from "@/widgets/manager/shared/ui/ManagerDetailMetaGrid";
import ManagerDetailPaneHeader from "@/widgets/manager/shared/ui/ManagerDetailPaneHeader";

type ImageDetailProps = {
    item: PostImageInventoryItem;
};

const ImageDetail = ({ item }: ImageDetailProps) => {
    const { setToast } = useToastStore();
    const fileName = item.path.split("/").pop() ?? item.path;

    const copyUrl = async () => {
        await util.dom.setCopyOnClipboard(item.url);
        setToast({ msg: "이미지 URL을 복사했어요", time: 2 });
    };

    return (
        <article>
            <ManagerDetailPaneHeader
                title={fileName}
                description="업로드된 게시물 이미지의 상세정보입니다."
                action={
                    <UI.Button
                        type="button"
                        onClick={copyUrl}
                        className="rounded-[0.8rem] border border-[var(--color-gray-300)] bg-[var(--color-surface)] px-[1.2rem] py-[0.8rem] text-[1.2rem] font-semibold text-[var(--color-gray-700)]"
                    >
                        URL 복사
                    </UI.Button>
                }
            />

            <div className="flex flex-col gap-[3.2rem] p-[2.4rem]">
                <div className="relative min-h-[28rem] w-full overflow-hidden rounded-[0.8rem] border border-[var(--color-gray-300)] bg-[var(--color-gray-100)]">
                    <Image
                        src={item.url}
                        alt={fileName}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain"
                    />
                </div>

                <ManagerDetailMetaGrid
                    items={[
                        { label: "File name", value: fileName },
                        { label: "Storage path", value: item.path },
                        { label: "Size", value: formatBytes(item.sizeBytes) },
                        { label: "Status", value: item.isUsed ? "사용중" : "미사용" },
                        {
                            label: "Referenced by",
                            value: item.referencedBy.length > 0 ? item.referencedBy.join(", ") : "참조 게시물 없음",
                        },
                    ]}
                />
            </div>
        </article>
    );
};

export default ImageDetail;
