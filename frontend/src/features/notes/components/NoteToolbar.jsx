import {
  Archive,
  BookOpen,
  Check,
  MoreHorizontal,
  Pin,
  Star,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveBadge } from "../components/SaveBadge";

export function NoteToolbar({
  status,
  lastSavedAt,
  isDirty,
  actionPending,
  saveNow,
  selectNotebook,
  handleNotebook,
  notebooks,
  selectTags,
  handleTags,
  tags,
  toggleTag,
  isPinned,
  handleTogglePin,
  isFavorite,
  handleToggleFav,
  handleToggleArchive,
  handleTrash,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 px-4 sm:px-6 md:px-10 lg:px-12 pt-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <SaveBadge
          status={actionPending ? "updating" : status}
          lastSavedAt={lastSavedAt}
          isDirty={isDirty}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-[11px]"
          onClick={saveNow}
          disabled={actionPending || status === "saving"}
        >
          <Check className="h-3 w-3" /> Save
        </Button>
        {status === "conflict" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[11px]"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        <Select
          value={selectNotebook ?? "__none__"}
          disabled={actionPending}
          onValueChange={(v) => handleNotebook(v)}
        >
          <SelectTrigger className="h-7 gap-1.5 px-2 text-[11px] border-border bg-transparent hover:bg-muted/40 w-auto min-w-0 shrink-0">
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
              disabled={actionPending}
              className="h-7 gap-1.5 px-2 text-[11px] border border-border bg-transparent hover:bg-muted/40 shrink-0"
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
                  onClick={() => handleTags([])}
                  disabled={actionPending}
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
                      disabled={actionPending}
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
          onClick={handleTogglePin}
          disabled={actionPending}
          className="h-7 w-7 shrink-0"
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
          disabled={actionPending}
          className="h-7 w-7 shrink-0"
          aria-label="Favorite"
        >
          <Star
            className={`h-3.5 w-3.5 ${isFavorite ? "fill-warning text-warning" : ""}`}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleToggleArchive}
              disabled={actionPending}
            >
              <Archive className="h-3.5 w-3.5 mr-2" /> Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleTrash}
              disabled={actionPending}
              className="text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Move to Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}