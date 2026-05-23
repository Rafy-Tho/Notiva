import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import {
  AlertCircle,
  Archive,
  BookOpen,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Pin,
  RotateCcw,
  Smile,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useNotebooks } from "../hooks/useNotebooks";
import {
  useNote,
  usePurge,
  useRemove,
  useRestore,
  useToggleArchive,
  useToggleFavorite,
  useTogglePin,
  useUpdateNote,
} from "../hooks/useNotes";
import { useTags } from "../hooks/useTags";
import { readingTime, sanitizeHtml, wordCount } from "../lib/sanitize";
import { cn } from "../lib/utils";
import { useCreateNoteContext } from "../hooks/useCreateNoteContext";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { NoteEditor } from "../editor/NoteEditor";
import { useAutosave } from "../hooks/useAutoSave";
export function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState(null);
  const [cover, setCover] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [selectNotebook, setSelectNotebook] = useState("__none__");
  const [selectTags, setSelectTags] = useState([]);
  const path = useCreateNoteContext();

  const { data: note, isLoading: noteLoading } = useNote(id);
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: notebooks, isLoading: notebooksLoading } = useNotebooks();
  const { mutateAsync: updateNote } = useUpdateNote(id);
  const { mutateAsync: togglePin } = useTogglePin(id);
  const { mutateAsync: toggleFav } = useToggleFavorite(id);
  const { mutateAsync: toggleArchive } = useToggleArchive(id);
  const { mutateAsync: remove } = useRemove(id);
  const { mutateAsync: restore } = useRestore(id);
  const { mutateAsync: purge } = usePurge(id);

  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content]);

  const autosaveValue = useMemo(
    () => ({
      title,
      content: sanitizedContent,
    }),
    [title, sanitizedContent],
  );

  const handleSave = useCallback(
    async (v) => {
      if (!id) return;

      await updateNote({
        title: v.title.trim() || "Untitled",
        content: v.content,
      });
    },
    [id, updateNote],
  );

  const { status, lastSavedAt, flush } = useAutosave(autosaveValue, handleSave);

  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);
  useEffect(() => {
    if (note) {
      // eslint-disable-next-line
      setTitle(note.title);
      setContent(note.content);
      setIcon(note.cover.emoji);
      setCover(note.cover.color);
      setIsPinned(note.isPinned);
      setIsFav(note.isFavorite);
      setSelectNotebook(note.notebookId);
      setSelectTags(note.tagIds);
    }
  }, [note?.id]); // eslint-disable-line

  if (!id) return null;

  if (noteLoading || tagsLoading || notebooksLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const hadndleIcon = async (emoji) => {
    try {
      setIcon(emoji);
      await updateNote({ cover: { emoji, color: cover } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCover = async (color) => {
    try {
      setCover(color);
      await updateNote({ cover: { color, emoji: icon } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleNotebook = async (notebookId) => {
    try {
      setSelectNotebook(notebookId);
      await updateNote({ notebookId });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleTags = async (tagIds) => {
    try {
      setSelectTags(tagIds);
      await updateNote({ tagIds });
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleTogglePin = async () => {
    try {
      setIsPinned(!isPinned);
      await togglePin();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleToggleFav = async () => {
    try {
      setIsFav(!isFav);
      await toggleFav();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleToggleArchive = async () => {
    try {
      await toggleArchive();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleTrash = async () => {
    try {
      await remove();
      navigate(path.basePath);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      navigate(path.basePath);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePurge = async () => {
    try {
      await purge();
      navigate(path.basePath);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const wc = wordCount(content);

  return (
    <div className="flex flex-col h-full">
      {note?.deletedAt && (
        <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              This note is in Trash. Restore it to keep editing.
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-[11px]"
                onClick={handleRestore}
              >
                <RotateCcw className="h-3 w-3" /> Restore
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-[11px] text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete forever
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete note permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{note.title || "Untitled"}"
                      and all of its version history. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurge}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      {/* Cover */}
      {cover && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-4">
          <div
            className="h-32 w-full rounded-lg border border-border bg-cover bg-center"
            style={{
              backgroundColor: cover ? `hsl(${cover})` : undefined,
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 px-4 sm:px-6 md:px-10 lg:px-12 pt-6 max-w-3xl mx-auto w-full">
        <SaveBadge status={status} lastSavedAt={lastSavedAt} />
        <div className="flex items-center gap-1 flex-wrap">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40 gap-1.5"
              >
                {icon ? (
                  <span className="text-sm leading-none">{icon}</span>
                ) : (
                  <Smile className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">Icon</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto border-border">
              <EmojiPicker
                theme={EmojiTheme.AUTO}
                onEmojiClick={(d) => hadndleIcon(d.emoji)}
                width={320}
                height={360}
              />
              {icon && (
                <div className="border-t border-border p-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-7 text-[11px]"
                    onClick={() => setIcon("")}
                  >
                    Remove icon
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {/* Cover picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40 gap-1.5"
              >
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Cover</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3 space-y-3">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                  Color
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[
                    "245 80% 66%",
                    "200 80% 60%",
                    "38 92% 60%",
                    "142 65% 50%",
                    "0 70% 60%",
                    "280 70% 65%",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCover(c)}
                      className={cn(
                        "h-7 rounded-md border-2",
                        cover === c
                          ? "border-foreground"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: `hsl(${c})` }}
                      aria-label={`color ${c}`}
                    />
                  ))}
                </div>
              </div>

              {cover && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full h-7 text-[11px]"
                  onClick={() => setCover(null)}
                >
                  Remove cover
                </Button>
              )}
            </PopoverContent>
          </Popover>
          {/* Notebook */}
          <Select
            value={selectNotebook ?? "__none__"}
            onValueChange={(v) => handleNotebook(v)}
          >
            <SelectTrigger className="h-7 gap-1.5 px-2 text-[11px] border-border bg-transparent hover:bg-muted/40 w-auto min-w-0">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="No notebook" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="__none__">No notebook</SelectItem>
              {notebooks?.map((nb) => (
                <SelectItem key={nb.id} value={nb.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: `hsl(${nb.color})` }}
                    />
                    {nb.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/*  Tags */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40"
              >
                <TagIcon className="h-3 w-3 text-muted-foreground" />
                {selectTags.length === 0 ? (
                  <span className="text-muted-foreground">No tags</span>
                ) : (
                  <span>
                    {selectTags.length} tag
                    {selectTags.length === 1 ? "" : "s"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-2">
              <div className="flex items-center justify-between px-1 pb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Tags
                </span>
                {selectTags.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectTags([]);
                      handleTags([]);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              {tags?.length === 0 ? (
                <div className="px-2 py-3 text-[11px] text-muted-foreground">
                  No tags yet. Create one from the sidebar.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {tags?.map((t) => {
                    const selected = selectTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (selected) {
                            setSelectTags((prev) =>
                              prev.filter((id) => id !== t.id),
                            );
                            handleTags(selectTags.filter((id) => id !== t.id));
                          } else {
                            setSelectTags((prev) => [...prev, t.id]);
                            handleTags([...selectTags, t.id]);
                          }
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: `hsl(${t.color})` }}
                          />
                          <span className="truncate">{t.name}</span>
                        </span>
                        {selected && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePin}
            className="h-7 w-7"
            aria-label="Pin"
          >
            <Pin
              className={`h-3.5 w-3.5 ${isPinned ? "fill-primary text-primary" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFav}
            className="h-7 w-7"
            aria-label="Favorite"
          >
            <Star
              className={`h-3.5 w-3.5 ${isFav ? "fill-warning text-warning" : ""}`}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleArchive}>
                <Archive className="h-3.5 w-3.5 mr-2" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleTrash}
                className="text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-2 pb-0 max-w-3xl mx-auto w-full">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
        />
        <div className="mt-1 text-[11px] text-muted-foreground">
          {wc} words · {readingTime(wc)}
        </div>
        {selectTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectTags.map((tid) => {
              const t = tags.find((x) => x.id === tid);
              if (!t) return null;
              return (
                <Badge
                  key={t.id}
                  variant="secondary"
                  className="gap-1 pl-1.5 pr-1 py-0.5 text-[10px] font-normal"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `hsl(${t.color})` }}
                  />
                  {t.name}
                  <button
                    onClick={() => {
                      setSelectTags((prev) => prev.filter((id) => id !== t.id));
                      handleTags(selectTags.filter((id) => id !== t.id));
                    }}
                    className="ml-0.5 rounded-sm hover:bg-background/60 p-0.5"
                    aria-label={`Remove ${t.name}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-2 pb-0 max-w-3xl mx-auto w-full">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <NoteEditor content={content} onChange={setContent} onCmdS={flush} />
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ status, lastSavedAt }) {
  if (status === "saving")
    return (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "error")
    return (
      <span className="text-[11px] text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> Save failed
      </span>
    );
  if (status === "saved" || lastSavedAt)
    return (
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-success" /> Saved{" "}
        {lastSavedAt ? `· ${timeAgo(lastSavedAt)}` : ""}
      </span>
    );
  return <span className="text-[11px] text-muted-foreground">Draft</span>;
}

function timeAgo(d) {
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.round(sec / 60)}m ago`;
}
