import { RICH_TEXT_IMAGE_CLASS } from "@/shared/lib/richText/styles";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImageNodeView } from "@/shared/ui/common/richText/extensions/ResizableImageNodeView";
import { normalizeImageAlign, normalizeImageWidth, type ImageAlign } from "@/shared/ui/common/richText/extensions/imageLayout";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        resizableImage: {
            setImageAlign: (align: ImageAlign) => ReturnType;
            setImageWidth: (width: string) => ReturnType;
        };
    }
}

export const ResizableImage = Image.configure({
    HTMLAttributes: { class: RICH_TEXT_IMAGE_CLASS },
}).extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            align: {
                default: "left",
                parseHTML: (element) => normalizeImageAlign(element.getAttribute("data-align") ?? element.closest("[data-align]")?.getAttribute("data-align")),
                renderHTML: (attributes) => ({
                    "data-align": normalizeImageAlign(attributes.align),
                }),
            },
            imageWidth: {
                default: "100%",
                parseHTML: (element) => normalizeImageWidth(element.getAttribute("data-image-width") ?? element.style.width),
                renderHTML: (attributes) => ({
                    "data-image-width": normalizeImageWidth(attributes.imageWidth),
                    style: `width: ${normalizeImageWidth(attributes.imageWidth)}`,
                }),
            },
        };
    },
    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlign:
                (align) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, {
                        align: normalizeImageAlign(align),
                    }),
            setImageWidth:
                (width) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, {
                        imageWidth: normalizeImageWidth(width),
                    }),
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNodeView);
    },
});
