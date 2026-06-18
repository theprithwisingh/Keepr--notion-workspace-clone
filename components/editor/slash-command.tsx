import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance, GetReferenceClientRect } from "tippy.js";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { 
    Heading1, 
    Heading2, 
    Heading3, 
    List, 
    ListOrdered, 
    CheckSquare, 
    Quote, 
    Code, 
    Minus,
    Image as ImageIcon,
    Video,
    Table as TableIcon
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// 1. Define the commands available in the slash menu
// ─────────────────────────────────────────────────────────────
const COMMANDS = [
    {
        title: "Heading 1",
        description: "Big section heading.",
        icon: <Heading1 className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        icon: <Heading2 className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        icon: <Heading3 className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
        },
    },
    {
        title: "Text",
        description: "Just start typing with plain text.",
        icon: <div className="font-serif w-4 h-4 flex items-center justify-center font-bold">T</div>,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setNode("paragraph").run();
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bulleted list.",
        icon: <List className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        icon: <ListOrdered className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "Task List",
        description: "Track tasks with a to-do list.",
        icon: <CheckSquare className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        icon: <Quote className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        icon: <Code className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
    },
    {
        title: "Divider",
        description: "Visually divide blocks.",
        icon: <Minus className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: "Table",
        description: "Insert a simple table.",
        icon: <TableIcon className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        title: "Image",
        description: "Embed an image from a URL.",
        icon: <ImageIcon className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            const url = window.prompt("Image URL:");
            if (url) {
                editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
            } else {
                editor.chain().focus().deleteRange(range).run();
            }
        },
    },
    {
        title: "Youtube",
        description: "Embed a Youtube video.",
        icon: <Video className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
            const url = window.prompt("Youtube URL:");
            if (url) {
                editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
            } else {
                editor.chain().focus().deleteRange(range).run();
            }
        },
    },
];

// ─────────────────────────────────────────────────────────────
// 2. Build the React Component that renders the popup menu
// ─────────────────────────────────────────────────────────────
const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }
            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }
            if (event.key === "Enter") {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    if (!props.items.length) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col w-72 max-h-80 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                Basic Blocks
            </div>
            <div className="p-1">
                {props.items.map((item: any, index: number) => (
                    <button
                        className={`flex items-center gap-3 w-full text-left px-2 py-2 rounded-md transition-colors ${
                            index === selectedIndex ? "bg-gray-100 text-gray-900" : "bg-transparent text-gray-700 hover:bg-gray-50"
                        }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded text-gray-500 shrink-0">
                            {item.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{item.title}</span>
                            <span className="text-xs text-gray-400">{item.description}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
});
CommandList.displayName = "CommandList";

// ─────────────────────────────────────────────────────────────
// 3. Register the Tiptap Extension using Suggestion
// ─────────────────────────────────────────────────────────────
export default Extension.create({
    name: "slashCommand",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }) => {
                    return COMMANDS.filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
                },
                render: () => {
                    let component: ReactRenderer<any>;
                    let popup: Instance[];

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(CommandList, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: "manual",
                                placement: "bottom-start",
                            });
                        },

                        onUpdate(props) {
                            component.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                            });
                        },

                        onKeyDown(props) {
                            if (props.event.key === "Escape") {
                                popup[0].hide();
                                return true;
                            }

                            return component.ref?.onKeyDown(props);
                        },

                        onExit() {
                            popup[0].destroy();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
