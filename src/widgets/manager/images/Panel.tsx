"use client";
import { ImageManagerPageProvider } from "./model/ImageManagerContext";
import * as Layer from "@/widgets/manager/images/ui";
export default function Panel() {
    return (
        <ImageManagerPageProvider>
            <Layer.ImageManagerList />
            <Layer.ImageManagerDetail />
        </ImageManagerPageProvider>
    );
}
