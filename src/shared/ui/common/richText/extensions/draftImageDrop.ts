import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

import { getDraftImageDragPreviewUrl } from "@/shared/lib/richText/draftImageDrag";
import { insertDraftImageAtPosition } from "@/shared/lib/richText/insertDraftImage";

export const DraftImageDrop = Extension.create({
    name: "draftImageDrop",

    addProseMirrorPlugins() {
        const extensionEditor = this.editor;

        return [
            new Plugin({
                props: {
                    handleDrop(view, event) {
                        const previewUrl = getDraftImageDragPreviewUrl(event.dataTransfer);

                        if (!previewUrl) {
                            return false;
                        }

                        event.preventDefault();

                        if (!extensionEditor || extensionEditor.isDestroyed) {
                            return true;
                        }

                        const coords = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY,
                        });

                        if (!coords) {
                            return true;
                        }

                        insertDraftImageAtPosition(extensionEditor, coords.pos, previewUrl);

                        return true;
                    },
                },
            }),
        ];
    },
});
