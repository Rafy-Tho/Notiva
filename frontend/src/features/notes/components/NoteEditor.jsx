import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef } from "react";
import { EditorToolbar } from "./EditorToolbar";

const lowlight = createLowlight(common);

export function NoteEditor({
  content,
  onChange,
  onCmdS,
  editorRef,
  placeholder = "Start writing… (markdown shortcuts supported)",
  showToolbar = true,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],

    content,

    editorProps: {
      attributes: { class: "tiptap" },
    },

    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // Keep external content in sync (e.g. version restore)
  const lastSetRef = useRef(content);

  useEffect(() => {
    if (!editor) return;

    if (content !== lastSetRef.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>", {
        emitUpdate: false,
      });
      lastSetRef.current = content;
    }
  }, [content, editor]);

  // Cmd+S handler
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onCmdS?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCmdS]);

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
  }, [editor, editorRef]);

  return (
    <div className="flex flex-col">
      {showToolbar && <EditorToolbar editor={editor} />}

      <div className="max-w-3xl mx-auto w-full py-5 sm:py-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
