import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import {
  AlertCircle,
  Archive,
  BookOpen,
  Check,
  CheckCircle2,
  History,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Pin,
  RefreshCw,
  RotateCcw,
  Smile,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { readingTime, wordCount } from "../lib/sanitize";
import { Badge } from "../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useTags } from "../hooks/useTags";
import { useNotebooks } from "../hooks/useNotebooks";
import { useNote } from "../hooks/useNotes";

export function NoteDetailPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [conflict, setConflict] = useState(false);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState("");
  const { data: note } = useNote(id);
  const { data: tags } = useTags();
  const { data: notebooks } = useNotebooks();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setBaseUpdatedAt(note.updatedAt);
      setConflict(false);
    }
  }, [note?.id]); // eslint-disable-line

  if (!id) return null;
  if (!note) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const togglePin = async () => {};
  const changeNotebook = async (value) => {};
  const toggleTag = async (tagId) => {};
  const clearTags = async () => {};
  const toggleFav = async () => {};
  const archive = async () => {};
  const trash = async () => {};
  const restore = async () => {};
  const deleteForever = async () => {};

  const wc = wordCount(content);

  const setCover = async (patch) => {};
  const onCoverFile = async (e) => {};
  const reloadFromServer = async () => {};

  return (
    <div className="flex flex-col h-full">
      {conflict && (
        <div className="px-4 sm:px-6 md:px-10 lg:px-12 pt-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between gap-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2">
            <div className="text-xs text-warning-foreground flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              This note was updated elsewhere. Reload to see the latest version
              (your unsaved changes will be lost).
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px]"
              onClick={reloadFromServer}
            >
              <RefreshCw className="h-3 w-3" /> Reload
            </Button>
          </div>
        </div>
      )}
      {note.isDeleted && (
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
                onClick={restore}
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
                      onClick={deleteForever}
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
      {(note.cover?.url || note.cover?.color) && (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-4">
          <div
            className="h-32 w-full rounded-lg border border-border bg-cover bg-center"
            style={{
              backgroundImage: note.cover?.url
                ? `url(${note.cover.url})`
                : undefined,
              backgroundColor: note.cover?.color
                ? `hsl(${note.cover.color})`
                : undefined,
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 px-4 sm:px-6 md:px-10 lg:px-12 pt-6 max-w-3xl mx-auto w-full">
        {/* <SaveBadge status={status} lastSavedAt={note.updatedAt} /> */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40 gap-1.5"
              >
                {note.cover?.emoji ? (
                  <span className="text-sm leading-none">
                    {note.cover.emoji}
                  </span>
                ) : (
                  <Smile className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">Icon</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-auto border-border">
              <EmojiPicker
                theme={EmojiTheme.AUTO}
                onEmojiClick={(d) => setCover({ emoji: d.emoji })}
                width={320}
                height={360}
              />
              {note.cover?.emoji && (
                <div className="border-t border-border p-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-7 text-[11px]"
                    onClick={() => setCover({ emoji: undefined })}
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
                      onClick={() => setCover({ color: c, url: undefined })}
                      className={cn(
                        "h-7 rounded-md border-2",
                        note.cover?.color === c
                          ? "border-foreground"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: `hsl(${c})` }}
                      aria-label={`color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                  Image
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverFile}
                  />
                  <span className="cursor-pointer inline-flex items-center justify-center w-full h-8 rounded-md border border-border bg-background hover:bg-accent text-xs">
                    Upload image
                  </span>
                </label>
              </div>
              {(note.cover?.url || note.cover?.color) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full h-7 text-[11px]"
                  onClick={() => setCover({ color: undefined, url: undefined })}
                >
                  Remove cover
                </Button>
              )}
            </PopoverContent>
          </Popover>
          <Select
            value={note.notebookId ?? "__none__"}
            onValueChange={changeNotebook}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40"
              >
                <TagIcon className="h-3 w-3 text-muted-foreground" />
                {note.tagIds.length === 0 ? (
                  <span className="text-muted-foreground">No tags</span>
                ) : (
                  <span>
                    {note.tagIds.length} tag
                    {note.tagIds.length === 1 ? "" : "s"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-2">
              <div className="flex items-center justify-between px-1 pb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Tags
                </span>
                {note.tagIds.length > 0 && (
                  <button
                    onClick={clearTags}
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
                    const selected = note.tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTag(t.id)}
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
            onClick={togglePin}
            className="h-7 w-7"
            aria-label="Pin"
          >
            <Pin
              className={`h-3.5 w-3.5 ${note.isPinned ? "fill-primary text-primary" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFav}
            className="h-7 w-7"
            aria-label="Favorite"
          >
            <Star
              className={`h-3.5 w-3.5 ${note.isFavorite ? "fill-warning text-warning" : ""}`}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <History className="h-3.5 w-3.5 mr-2" /> Version history
              </DropdownMenuItem>
              <DropdownMenuItem onClick={archive}>
                <Archive className="h-3.5 w-3.5 mr-2" /> Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={trash} className="text-destructive">
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
        {note.tagIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {note.tagIds.map((tid) => {
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
                    onClick={() => toggleTag(t.id)}
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

      {/* <div className="flex-1 min-h-0 overflow-y-auto">
        <NoteEditor content={content} onChange={setContent} onCmdS={() => {}} />
      </div> */}

      {/* <VersionHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        noteId={id}
        onRestored={() => {}}
      /> */}
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
