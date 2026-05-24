import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Dialog, DialogContent } from "../ui/dialog";
import { htmlToText } from "../../lib/sanitize";
import {
  Archive,
  BookOpen,
  FileText,
  Hash,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotebooks } from "../../hooks/useNotebooks";
import { useCreateNote, useNotes } from "../../hooks/useNotes";
import { useTags } from "../../hooks/useTags";
import { useUIStore } from "../../store/useUIStore";
import { toast } from "sonner";

const RECENT_KEY = "noteflow_recent_searches";

export function CommandPalette() {
  const cmdkOpen = useUIStore((s) => s.cmdkOpen);
  const setCmdk = useUIStore((s) => s.setCmdk);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: notes = [] } = useNotes();
  const { data: notebooks = [] } = useNotebooks();
  const { data: tags = [] } = useTags();
  const { mutateAsync: createNote } = useCreateNote();

  const filteredNotes = q
    ? notes.filter((n) =>
        (n.title + " " + htmlToText(n.content))
          .toLowerCase()
          .includes(q.toLowerCase() && n.deletedAt === null),
      )
    : notes.slice(0, 5).filter((n) => n.deletedAt === null);

  const go = (path, term) => {
    if (term) {
      const recents = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const next = [term, ...recents.filter((x) => x !== term)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }
    setCmdk(false);
    setQ("");
    navigate(path);
  };

  useEffect(() => {
    if (!cmdkOpen) setQ("");
  }, [cmdkOpen]);

  const newNote = async () => {
    try {
      const note = await createNote();
      go(`notes/${note.id}`, note.title);
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <Dialog open={cmdkOpen} onOpenChange={setCmdk}>
      <DialogContent className="p-0 max-w-xl overflow-hidden">
        <Command shouldFilter={false}>
          <CommandInput
            value={q}
            onValueChange={setQ}
            placeholder="Search notes, notebooks, tags…"
            className="w-full"
          />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No results.</CommandEmpty>

            {/* ✅ Add this block */}
            {q.trim() && (
              <CommandGroup heading="Search">
                <CommandItem
                  onSelect={() => {
                    if (q.trim()) {
                      go(`/search?q=${q}`);
                    }
                  }}
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
                {filteredNotes.slice(0, 8).map((n) => (
                  <CommandItem
                    key={n.id}
                    onSelect={() => go(`/notes/${n.id}`, q)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="truncate">{n.title || "Untitled"}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[180px]">
                      {htmlToText(n.content).slice(0, 60)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {notebooks.length > 0 && (
              <CommandGroup heading="Notebooks">
                {notebooks.map((nb) => (
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

            {tags.length > 0 && (
              <CommandGroup heading="Tags">
                {tags.map((t) => (
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
