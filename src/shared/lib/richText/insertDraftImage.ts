import type { Editor } from "@tiptap/core";

import { usePostDraftImageStore } from "@/shared/stores/usePostDraftImageStore";

export const findDraftImageByPreviewUrl = (previewUrl: string) => usePostDraftImageStore.getState().images.find((image) => image.previewUrl === previewUrl);

export const insertDraftImageAtPosition = (editor: Editor, position: number, previewUrl: string) => {
    const image = findDraftImageByPreviewUrl(previewUrl);

    if (!image) {
        return false;
    }

    return editor
        .chain()
        .focus()
        .insertContentAt(position, {
            type: "image",
            attrs: {
                src: previewUrl,
                alt: image.name,
            },
        })
        .updateAttributes("image", { align: "left", imageWidth: "100%" })
        .run();
};
