import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { EditorToolbar } from "./EditorToolbar";
import { Bold, Italic, Underline as UIcon } from "lucide-react";

const lowlight = createLowlight(common);

export function NoteEditor({
  content,
  onChange,
  onCmdS,
  placeholder = "Start writing… (markdown shortcuts supported)",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image,
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: { class: "tiptap" },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (!images.length) return false;
        event.preventDefault();
        images.forEach((file) => {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is larger than 5MB`);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src, alt: file.name });
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          };
          reader.readAsDataURL(file);
        });
        return true;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((i) => i.type.startsWith("image/"));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          const { schema } = view.state;
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              schema.nodes.image.create({ src }),
            ),
          );
        };
        reader.readAsDataURL(file);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  // Keep external content in sync (e.g. version restore)
  const lastSetRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== lastSetRef.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>", { emitUpdate: false });
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

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-5 sm:py-6 max-w-3xl mx-auto w-full">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
