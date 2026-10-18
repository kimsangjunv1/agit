"use client";
import { useImageManagerProvider } from "../model/ImageManagerContext";
import ImageDetail from "@/widgets/manager/images/ui/ImageDetail";
import ManagerDetailPane from "@/widgets/manager/shared/ui/ManagerDetailPane";
import ManagerEmptyState from "@/widgets/manager/shared/ui/ManagerEmptyState";

const ImageManagerDetail = () => {
    const { selectedImage } = useImageManagerProvider();
    return <ManagerDetailPane>{selectedImage ? <ImageDetail item={selectedImage} /> : <ManagerEmptyState variant="no-item" />}</ManagerDetailPane>;
};
export default ImageManagerDetail;
