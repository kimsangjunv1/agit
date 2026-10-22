import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const EMPTY_BODY_PLACEHOLDER = "내용을 작성해주세요";

export const EmptyBodyPlaceholder = Extension.create({
    name: "emptyBodyPlaceholder",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("emptyBodyPlaceholder"),
                props: {
                    decorations: ({ doc }) => {
                        if (!this.editor.isEditable || !this.editor.isEmpty) {
                            return null;
                        }

                        const decorations: Decoration[] = [];

                        doc.descendants((node, pos) => {
                            if (node.isLeaf || node.childCount > 0) {
                                return;
                            }

                            decorations.push(
                                Decoration.node(pos, pos + node.nodeSize, {
                                    class: "is-editor-empty",
                                    "data-placeholder": EMPTY_BODY_PLACEHOLDER,
                                }),
                            );
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});
