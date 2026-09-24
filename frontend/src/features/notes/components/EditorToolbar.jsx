import { useState } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Btn = ({ on, active, children, label }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(e) => {
      e.preventDefault();
      on?.();
    }}
    className={cn(
      "h-7 w-7 shrink-0 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
      active && "bg-muted text-foreground",
    )}
  >
    {children}
  </button>
);

export function EditorToolbar({ editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  if (!editor) return null;

  const inTable = editor.isActive("table");
  const linkActive = editor.isActive("link");

  const openLink = (open) => {
    setLinkOpen(open);
    if (open) {
      setUrl(editor.getAttributes("link").href || "");
    }
  };

  const applyLink = () => {
    const href = url.trim();
    if (href) {
      const normalized =
        /^(https?:\/\/|mailto:|tel:|#)/i.test(href) || href.startsWith("/")
          ? href
          : `https://${href}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalized })
        .run();
    } else if (linkActive) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setUrl("");
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setUrl("");
    setLinkOpen(false);
  };

  const tableAction = (action) => {
    editor.chain().focus()[action]().run();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-0.5 border-b border-border bg-background/80 backdrop-blur px-3 py-1.5 overflow-x-auto overflow-y-hidden">
      <Btn label="Undo" on={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Redo" on={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <Btn
        label="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
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
        label="Strikethrough"
        active={editor.isActive("strike")}
        on={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>
      <Popover open={linkOpen} onOpenChange={openLink}>
        <PopoverTrigger asChild>
          <Btn label="Link" active={linkActive}>
            {linkActive ? (
              <Unlink className="h-3.5 w-3.5" />
            ) : (
              <LinkIcon className="h-3.5 w-3.5" />
            )}
          </Btn>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Link
              </span>
              {linkActive && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                >
                  <Unlink className="h-3 w-3" /> Remove
                </button>
              )}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://example.com"
                className="h-8 text-xs"
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={applyLink}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
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
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <Btn
        label="Code block"
        active={editor.isActive("codeBlock")}
        on={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Blockquote"
        active={editor.isActive("blockquote")}
        on={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      {!inTable ? (
        <Btn
          label="Insert table"
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
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Btn label="Table options" active>
              <TableIcon className="h-3.5 w-3.5" />
            </Btn>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onSelect={() => tableAction("addRowBefore")}>
              <ChevronUp className="h-3.5 w-3.5 mr-2" /> Insert row above
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("addRowAfter")}>
              <ChevronDown className="h-3.5 w-3.5 mr-2" /> Insert row below
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("addColumnBefore")}>
              <ChevronLeft className="h-3.5 w-3.5 mr-2" /> Insert column left
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("addColumnAfter")}>
              <ChevronRight className="h-3.5 w-3.5 mr-2" /> Insert column right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => tableAction("deleteRow")}>
              <Rows3 className="h-3.5 w-3.5 mr-2" /> Delete row
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("deleteColumn")}>
              <Columns3 className="h-3.5 w-3.5 mr-2" /> Delete column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => tableAction("deleteTable")}
              className="text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}