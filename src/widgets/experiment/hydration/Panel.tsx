"use client";
import { HydrationPageProvider } from "./model/HydrationContext";
import * as Layer from "@/widgets/experiment/hydration/ui";
export default function Panel() {
    return (
        <HydrationPageProvider>
            <Layer.HydrationExample />
        </HydrationPageProvider>
    );
}
