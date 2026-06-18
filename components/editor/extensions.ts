import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extension-placeholder";
import SlashCommand from "./slash-command";

export const getExtensions = () => [
    // The StarterKit includes Paragraph, Headings, Bold, Italic, BulletList, etc.
    StarterKit.configure({
        bulletList: {
            HTMLAttributes: {
                class: "list-disc list-outside leading-3 -mt-2",
            },
        },
        orderedList: {
            HTMLAttributes: {
                class: "list-decimal list-outside leading-3 -mt-2",
            },
        },
        listItem: {
            HTMLAttributes: {
                class: "leading-normal -mb-2",
            },
        },
        blockquote: {
            HTMLAttributes: {
                class: "border-l-4 border-gray-300 pl-4 py-1 italic text-gray-700",
            },
        },
        codeBlock: {
            HTMLAttributes: {
                class: "rounded-md bg-gray-100 p-4 font-mono text-sm text-gray-800",
            },
        },
        horizontalRule: {
            HTMLAttributes: {
                class: "my-8 border-t border-gray-200",
            },
        },
    }),

    // Checkbox / Task Lists
    TaskList.configure({
        HTMLAttributes: {
            class: "not-prose pl-2",
        },
    }),
    TaskItem.configure({
        HTMLAttributes: {
            class: "flex items-start my-1",
        },
        nested: true,
    }),

    // Tables
    Table.configure({
        resizable: true,
        HTMLAttributes: {
            class: "my-6 w-full text-left border-collapse",
        },
    }),
    TableRow,
    TableHeader.configure({
        HTMLAttributes: {
            class: "border border-gray-300 bg-gray-100 px-4 py-2 font-bold",
        },
    }),
    TableCell.configure({
        HTMLAttributes: {
            class: "border border-gray-300 px-4 py-2",
        },
    }),

    // Media
    Image.configure({
        HTMLAttributes: {
            class: "rounded-lg border border-gray-200 shadow-sm mx-auto my-6 max-w-full h-auto",
        },
    }),
    Youtube.configure({
        HTMLAttributes: {
            class: "w-full aspect-video rounded-lg shadow-sm my-6",
        },
        controls: true,
        nocookie: true,
    }),

    // Placeholder for empty lines
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === "heading") {
                return `Heading ${node.attrs.level}`;
            }
            return "Type '/' for commands or start writing...";
        },
        includeChildren: true,
    }),

    // Custom Slash Command Extension (we will build this next)
    SlashCommand,
];
