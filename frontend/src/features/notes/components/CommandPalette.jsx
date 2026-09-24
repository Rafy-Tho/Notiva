import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Archive,
  BookOpen,
  ExternalLink,
  FileText,
  Hash,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotebooks } from "@/features/notebooks/hooks/useNotebooks";
import { useCreateNote, useNotes } from "../hooks/useNotes";
import { useTags } from "@/features/tags/hooks/useTags";
import { useDebounce } from "@/hooks/useDebounce";
import { useUIStore } from "@/store/useUIStore";
import { toast } from "sonner";
import { htmlToText } from "@/lib/sanitize";

const RECENT_KEY = "noteflow_recent_searches";
const MAX_RECENTS = 8;

function highlight({ text, q }) {
  if (!q || !text) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-foreground rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function snippet({ html, q }) {
  const text = htmlToText(html);
  if (!q) return text.slice(0, 200);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, 200);
  const start = Math.max(0, i - 60);
  return (start > 0 ? "… " : "") + text.slice(start, i + q.length + 140) + "…";
}

function RecentChip({ term, onRemove, onSelect }) {
  return (
    <CommandItem onSelect={onSelect} className="cursor-pointer">
      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="truncate">{term}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground"
        aria-label={`Remove recent search ${term}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </CommandItem>
  );
}

export function CommandPalette() {
  const cmdkOpen = useUIStore((s) => s.cmdkOpen);
  const setCmdk = useUIStore((s) => s.setCmdk);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState([]);
  const debouncedQ = useDebounce(q, 200);
  const params = debouncedQ ? { search: debouncedQ } : {};
  const { data, isFetching } = useNotes(params);
  const notes = data?.notes ?? [];
  const { data: notebooks = [] } = useNotebooks();
  const { data: tags = [] } = useTags();
  const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();

  const trimmed = q.trim();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    setRecents(stored);
  }, []);

  const filteredNotes = useMemo(
    () => (q ? notes.slice(0, 8) : notes.slice(0, 5)),
    [q, notes],
  );

  const filteredNotebooks = useMemo(() => {
    if (!q) return notebooks;
    const needle = q.trim().toLowerCase();
    return notebooks.filter((nb) => nb.name.toLowerCase().includes(needle));
  }, [q, notebooks]);

  const filteredTags = useMemo(() => {
    if (!q) return tags;
    const needle = q.trim().toLowerCase();
    return tags.filter((t) => t.name.toLowerCase().includes(needle));
  }, [q, tags]);

  const go = (path, term) => {
    if (term) {
      const next = [term, ...recents.filter((x) => x !== term)].slice(
        0,
        MAX_RECENTS,
      );
      setRecents(next);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }
    setCmdk(false);
    setQ("");
    navigate(path);
  };

  const newNote = async () => {
    try {
      const note = await createNote();
      go(`notes/${note.id}`, note.title);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const newNoteRef = useRef(newNote);
  useEffect(() => {
    newNoteRef.current = newNote;
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest("input, textarea, [contenteditable='true']")
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        setCmdk(!cmdkOpen);
      } else if ((e.metaKey || e.ctrlKey) && key === "n") {
        e.preventDefault();
        newNoteRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cmdkOpen, setCmdk]);

  const handleOpenChange = (open) => {
    if (!open) {
      setQ("");
      setCmdk(false);
    } else {
      setCmdk(true);
    }
  };

  const removeRecent = (term) => {
    const next = recents.filter((x) => x !== term);
    setRecents(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const clearRecents = () => {
    setRecents([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const showMore = Boolean(trimmed && notes.length > filteredNotes.length);
  const moreCount = notes.length - filteredNotes.length;

  return (
    <Dialog open={cmdkOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden">
        <Command shouldFilter={false}>
          <CommandInput
            value={q}
            onValueChange={setQ}
            placeholder="Search notes, notebooks, tags…"
            className="w-full"
            disabled={isCreating}
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No results.</CommandEmpty>

            {isFetching && <CommandLoading>Searching…</CommandLoading>}

            {!q && recents.length > 0 && (
              <CommandGroup heading="Recent searches">
                {recents.map((term) => (
                  <RecentChip
                    key={term}
                    term={term}
                    onSelect={() => setQ(term)}
                    onRemove={() => removeRecent(term)}
                  />
                ))}
                <CommandItem
                  onSelect={clearRecents}
                  className="cursor-pointer text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear recent searches
                </CommandItem>
              </CommandGroup>
            )}

            {trimmed && (
              <CommandGroup heading="Search">
                <CommandItem
                  onSelect={() =>
                    go(`/search?q=${encodeURIComponent(trimmed)}`)
                  }
                  className="cursor-pointer"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search for <span className="font-medium ml-1">"{q}"</span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Actions">
              <CommandItem onSelect={newNote} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" /> New note{" "}
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                  ⌘N
                </span>
              </CommandItem>
              <CommandItem onSelect={() => go("/favorites")}>
                <Star className="h-4 w-4 mr-2" /> Open Favorites
              </CommandItem>
              <CommandItem onSelect={() => go("/archive")}>
                <Archive className="h-4 w-4 mr-2" /> Open Archive
              </CommandItem>
              <CommandItem onSelect={() => go("/trash")}>
                <Trash2 className="h-4 w-4 mr-2" /> Open Trash
              </CommandItem>
              <CommandItem onSelect={() => go("/settings")}>
                <Settings className="h-4 w-4 mr-2" /> Open Settings
              </CommandItem>
            </CommandGroup>

            {filteredNotes.length > 0 && (
              <CommandGroup heading={q ? "Notes matching" : "Recent notes"}>
                {filteredNotes.map((n) => {
                  const title = n.title || "Untitled";
                  const preview = q
                    ? snippet({ html: n.content || "", q })
                    : n.contentPreview || "";
                  return (
                    <CommandItem
                      key={n.id}
                      onSelect={() => go(`/notes/${n.id}`, q)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {highlight({ text: title, q })}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {preview}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {showMore && (
              <CommandGroup>
                <CommandItem
                  onSelect={() =>
                    go(`/search?q=${encodeURIComponent(trimmed)}`)
                  }
                  className="cursor-pointer text-muted-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {moreCount}+ more results — search all
                </CommandItem>
              </CommandGroup>
            )}

            {filteredNotebooks.length > 0 && (
              <CommandGroup
                heading={
                  q && filteredNotebooks.length < notebooks.length
                    ? `Notebooks (${filteredNotebooks.length})`
                    : "Notebooks"
                }
              >
                {filteredNotebooks.map((nb) => (
                  <CommandItem
                    key={nb.id}
                    onSelect={() => go(`/notebooks/${nb.id}`)}
                  >
                    <BookOpen
                      className="h-4 w-4 mr-2"
                      style={{ color: `hsl(${nb.color})` }}
                    />{" "}
                    {nb.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredTags.length > 0 && (
              <CommandGroup
                heading={
                  q && filteredTags.length < tags.length
                    ? `Tags (${filteredTags.length})`
                    : "Tags"
                }
              >
                {filteredTags.map((t) => (
                  <CommandItem key={t.id} onSelect={() => go(`/tags/${t.id}`)}>
                    <Hash
                      className="h-4 w-4 mr-2"
                      style={{ color: `hsl(${t.color})` }}
                    />{" "}
                    {t.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}