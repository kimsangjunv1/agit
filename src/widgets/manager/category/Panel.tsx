"use client";
import { CategoryManagerPageProvider } from "./model/CategoryManagerContext";
import * as Layer from "@/widgets/manager/category/ui";
export default function Panel() {
    return (
        <CategoryManagerPageProvider>
            <Layer.CategoryManagerList />
            <Layer.CategoryManagerDetail />
            <Layer.Modal />
        </CategoryManagerPageProvider>
    );
}
