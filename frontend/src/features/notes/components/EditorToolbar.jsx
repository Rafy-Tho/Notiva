import { forwardRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
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
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Strikethrough,
  Table as TableIcon,
  Table2,
  TableCellsMerge,
  TableCellsSplit,
  Underline as UIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

const Btn = forwardRef(
  ({ on, active, children, label, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        on?.();
        onClick?.(e);
      }}
      className={cn(
        "h-7 w-7 shrink-0 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
        active && "bg-muted text-foreground",
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Btn.displayName = "Btn";

export function EditorToolbar({ editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  if (!editor) return null;

  const inTable = editor.isActive("table");
  const linkActive = editor.isActive("link");

  const blocks = [
    {
      label: "Paragraph",
      Icon: Pilcrow,
      isActive: () =>
        editor.isActive("paragraph") && !editor.isActive("codeBlock"),
      run: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "Heading 1",
      Icon: Heading1,
      isActive: () => editor.isActive("heading", { level: 1 }),
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      Icon: Heading2,
      isActive: () => editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      Icon: Heading3,
      isActive: () => editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Blockquote",
      Icon: Quote,
      isActive: () => editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code block",
      Icon: Code,
      isActive: () => editor.isActive("codeBlock"),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];
  const activeBlock = blocks.find((b) => b.isActive()) ?? blocks[0];

  const alignments = [
    {
      label: "Align left",
      Icon: AlignLeft,
      value: "left",
      shortcut: "⌘⇧L",
    },
    {
      label: "Align center",
      Icon: AlignCenter,
      value: "center",
      shortcut: "⌘⇧E",
    },
    {
      label: "Align right",
      Icon: AlignRight,
      value: "right",
      shortcut: "⌘⇧R",
    },
    {
      label: "Justify",
      Icon: AlignJustify,
      value: "justify",
      shortcut: "⌘⇧J",
    },
  ];
  const currentAlign =
    alignments.find((a) =>
      editor.isActive({ textAlign: a.value }),
    ) ?? alignments[0];
  const AlignIcon = currentAlign.Icon;

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

  const openImage = (open) => {
    setImageOpen(open);
    if (open) setImgUrl("");
  };

  const applyImage = () => {
    const src = imgUrl.trim();
    if (src) {
      const normalized = /^(https?:\/\/|data:|blob:)/i.test(src)
        ? src
        : `https://${src}`;
      editor.chain().focus().setImage({ src: normalized }).run();
    }
    setImgUrl("");
    setImageOpen(false);
  };

  const tableAction = (action) => {
    editor.chain().focus()[action]().run();
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting options"
      className="sticky top-0 z-10 flex items-center gap-0.5 border-b border-border bg-background/80 backdrop-blur px-3 py-1.5 overflow-x-auto overflow-y-hidden"
    >
      <Btn label="Undo (⌘Z)" on={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Redo (⌘⇧Z)" on={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Block type"
            className="flex h-7 shrink-0 items-center gap-1.5 rounded px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span className="max-w-28 truncate">{activeBlock.label}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
            Block type
          </DropdownMenuLabel>
          {blocks.map((b) => (
            <DropdownMenuItem key={b.label} onSelect={b.run}>
              <b.Icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {b.label}
              {b.isActive() && <Check className="h-3.5 w-3.5 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <Btn
        label="Bold (⌘B)"
        active={editor.isActive("bold")}
        on={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Italic (⌘I)"
        active={editor.isActive("italic")}
        on={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Underline (⌘U)"
        active={editor.isActive("underline")}
        on={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Strikethrough (⌘⇧X)"
        active={editor.isActive("strike")}
        on={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Inline code (⌘E)"
        active={editor.isActive("code")}
        on={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Popover open={linkOpen} onOpenChange={openLink}>
        <PopoverTrigger asChild>
          <Btn label="Link (⌘K)" active={linkActive}>
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
        label="Bullet list (⌘⇧8)"
        active={editor.isActive("bulletList")}
        on={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Ordered list (⌘⇧7)"
        active={editor.isActive("orderedList")}
        on={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Task list (⌘⇧9)"
        active={editor.isActive("taskList")}
        on={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListChecks className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <Btn
        label="Blockquote (⌘⇧B)"
        active={editor.isActive("blockquote")}
        on={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Code block"
        active={editor.isActive("codeBlock")}
        on={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        label="Horizontal rule"
        on={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3.5 w-3.5" />
      </Btn>
      <div className="mx-1 h-4 w-px shrink-0 bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Btn label={`Text alignment - ${currentAlign.label}`}>
            <AlignIcon className="h-3.5 w-3.5" />
          </Btn>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
            Text alignment
          </DropdownMenuLabel>
          {alignments.map((a) => (
            <DropdownMenuItem
              key={a.value}
              onSelect={() =>
                editor.chain().focus().setTextAlign(a.value).run()
              }
            >
              <a.Icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              {a.label}
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {a.shortcut}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            disabled={currentAlign.value === "left"}
            onSelect={() => editor.chain().focus().unsetTextAlign().run()}
          >
            <AlignLeft className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            Unset alignment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open={imageOpen} onOpenChange={openImage}>
        <PopoverTrigger asChild>
          <Btn label="Insert image">
            <ImageIcon className="h-3.5 w-3.5" />
          </Btn>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <div className="space-y-2">
            <div className="px-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Image URL
              </span>
            </div>
            <div className="flex gap-1.5">
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyImage();
                  }
                }}
                placeholder="https://example.com/image.png"
                className="h-8 text-xs"
                autoFocus
              />
              <Button
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={applyImage}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="px-1 text-[11px] text-muted-foreground">
              Or paste an image directly into the editor.
            </p>
          </div>
        </PopoverContent>
      </Popover>
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
          <DropdownMenuContent
            align="start"
            className="w-56 overflow-y-auto"
            style={{ maxHeight: "min(60vh, 22rem)" }}
          >
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
            <DropdownMenuItem onSelect={() => tableAction("mergeCells")}>
              <TableCellsMerge className="h-3.5 w-3.5 mr-2" /> Merge cells
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("splitCell")}>
              <TableCellsSplit className="h-3.5 w-3.5 mr-2" /> Split cell
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("toggleHeaderRow")}>
              <Rows3 className="h-3.5 w-3.5 mr-2" /> Toggle header row
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => tableAction("toggleHeaderColumn")}>
              <Columns3 className="h-3.5 w-3.5 mr-2" /> Toggle header column
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
              <Table2 className="h-3.5 w-3.5 mr-2" /> Delete table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}