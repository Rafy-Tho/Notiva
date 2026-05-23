import {
  Bold,
  Italic,
  Underline as UIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Code,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "../lib/utils";

const Btn = ({ on, active, children, label }) => (
  <button
    type="button"
    aria-label={label}
    onClick={(e) => {
      e.preventDefault();
      on();
    }}
    className={cn(
      "h-7 w-7 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
      active && "bg-muted text-foreground",
    )}
  >
    {children}
  </button>
);
export function EditorToolbar({ editor }) {
  if (!editor) return null;

  const promptLink = () => {
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background/80 backdrop-blur px-3 py-1.5">
      <Btn label="Undo" on={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Redo" on={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px bg-border" />
      <Btn
        label="H1"
        active={editor.isActive("heading", { level: 1 })}
        on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="H2"
        active={editor.isActive("heading", { level: 2 })}
        on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="H3"
        active={editor.isActive("heading", { level: 3 })}
        on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px bg-border" />
      <Btn
        label="Bold"
        active={editor.isActive("bold")}
        on={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Italic"
        active={editor.isActive("italic")}
        on={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Underline"
        active={editor.isActive("underline")}
        on={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Strike"
        active={editor.isActive("strike")}
        on={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px bg-border" />
      <Btn
        label="Bullet list"
        active={editor.isActive("bulletList")}
        on={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Ordered list"
        active={editor.isActive("orderedList")}
        on={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Task list"
        active={editor.isActive("taskList")}
        on={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListChecks className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px bg-border" />
      <Btn
        label="Code block"
        active={editor.isActive("codeBlock")}
        on={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Quote"
        active={editor.isActive("blockquote")}
        on={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Link" active={editor.isActive("link")} on={promptLink}>
        <LinkIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Image" on={insertImage}>
        <ImageIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Table"
        on={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon className="h-3.5 w-3.5" />
      </Btn>
    </div>
  );
}
