import Image from "next/image";

import type { PostImageInventoryItem } from "@/entities/post-image/lib/postImageInventory";
import { formatBytes } from "@/entities/post-image/lib/postImageInventory";
import ManagerListItemCard from "@/widgets/manager/shared/ui/ManagerListItemCard";

type ImageListItemProps = {
    item: PostImageInventoryItem;
    isSelected: boolean;
    onClick: () => void;
};

const ImageListItem = ({ item, isSelected, onClick }: ImageListItemProps) => {
    const fileName = item.path.split("/").pop() ?? item.path;

    return (
        <ManagerListItemCard
            isSelected={isSelected}
            onClick={onClick}
        >
            <div className="flex items-center gap-[1.2rem]">
                <div className="relative size-[4.8rem] shrink-0 overflow-hidden rounded-[0.8rem] bg-[var(--color-gray-100)]">
                    <Image
                        unoptimized
                        src={item.url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-[0.8rem]">
                        <p className="truncate text-[1.2rem] font-semibold text-[var(--color-gray-900)]">{fileName}</p>
                        <span
                            className={`shrink-0 rounded-full px-[0.8rem] py-[0.4rem] text-[1.2rem] font-semibold ${
                                item.isUsed ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]" : "bg-[var(--color-gray-200)] text-[var(--color-gray-600)]"
                            }`}
                        >
                            {item.isUsed ? "사용중" : "미사용"}
                        </span>
                    </div>
                    <p className="mt-[0.4rem] text-[1.2rem] text-[var(--color-gray-500)]">{formatBytes(item.sizeBytes)}</p>
                </div>
            </div>
        </ManagerListItemCard>
    );
};

export default ImageListItem;
