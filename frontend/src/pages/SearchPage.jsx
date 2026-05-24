import {
  BookOpen,
  Clock,
  Hash,
  Pin,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNotebooks } from "../hooks/useNotebooks";
import { useNotes } from "../hooks/useNotes";
import { useTags } from "../hooks/useTags";
import { htmlToText } from "../lib/sanitize";
import { cn } from "../lib/utils";

const RECENT_KEY = "noteflow_recent_searches";

function highlight(text, q) {
  if (!q) return text;
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

function snippet(html, q) {
  const text = htmlToText(html);
  if (!q) return text.slice(0, 200);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, 200);
  const start = Math.max(0, i - 60);
  return (start > 0 ? "… " : "") + text.slice(start, i + q.length + 140) + "…";
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(params.get("q") || "");
  const [notebookId, setNotebookId] = useState(params.get("notebook") || "");
  const [tagId, setTagId] = useState(params.get("tag") || "");
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [pinned, setPinned] = useState(params.get("pinned") === "1");
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    try {
      setRecents(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      setRecents([]);
    }
  }, []);

  // Sync params for shareable URLs
  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (notebookId) next.set("notebook", notebookId);
    if (tagId) next.set("tag", tagId);
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (pinned) next.set("pinned", "1");
    setParams(next, { replace: true });
  }, [q, notebookId, tagId, from, to, pinned, setParams]);

  const saveRecent = (term) => {
    if (!term.trim()) return;
    const next = [term, ...recents.filter((x) => x !== term)].slice(0, 8);
    setRecents(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const { data: notes = [] } = useNotes();
  const { data: notebooks = [] } = useNotebooks();
  const { data: tags = [] } = useTags();

  const results = useMemo(() => {
    let r = notes.slice();
    if (notebookId)
      r = r.filter((n) => n.notebookId === notebookId && !n.deletedAt);
    if (tagId) r = r.filter((n) => n.tagIds.includes(tagId) && !n.deletedAt);
    if (pinned) r = r.filter((n) => n.isPinned && !n.deletedAt);
    if (from) r = r.filter((n) => n.updatedAt >= from && !n.deletedAt);
    if (to)
      r = r.filter((n) => n.updatedAt <= to + "T23:59:59" && !n.deletedAt);
    if (q) {
      const needle = q.toLowerCase();
      r = r.filter(
        (n) =>
          (n.title + " " + htmlToText(n.content))
            .toLowerCase()
            .includes(needle) && !n.deletedAt,
      );
    }
    return r.filter((n) => !n.deletedAt);
  }, [notes, notebookId, tagId, pinned, from, to, q]);

  const clear = () => {
    setQ("");
    setNotebookId("");
    setTagId("");
    setFrom("");
    setTo("");
    setPinned(false);
  };
  const hasFilters = !!(notebookId || tagId || from || to || pinned);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-5 py-6 md:px-10 md:py-10 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground">
            Find notes by content, notebook, tag or date.
          </p>
        </header>

        <div className="panel p-3 md:p-4 space-y-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => saveRecent(q)}
              placeholder="Search every note…"
              className="pl-9"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">All notebooks</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  {nb.name}
                </option>
              ))}
            </select>
            <select
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9"
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9"
            />
            <label className="flex items-center gap-2 px-2 h-9 rounded-md border border-input bg-background text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Pinned only
            </label>
          </div>

          {hasFilters && (
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={clear}>
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            </div>
          )}
        </div>

        {!q && recents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Recent searches
            </div>
            <div className="flex flex-wrap gap-2">
              {recents.map((r) => (
                <Badge
                  key={r}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setQ(r)}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </div>
          {results.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              {q || hasFilters
                ? "No matches. Try a different query or clear filters."
                : "Type to search your notes."}
            </div>
          ) : (
            <ul className="space-y-2">
              {results.map((n) => {
                const nb = notebooks.find((b) => b.id === n.notebookId);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        saveRecent(q);
                        navigate(`/notes/${n.id}`);
                      }}
                      className={cn(
                        "panel w-full text-left p-3 hover:border-primary/60 hover:bg-accent/30 transition-colors",
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {n.isPinned && (
                          <Pin className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <div className="font-medium truncate">
                          {highlight(n.title || "Untitled", q)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {highlight(snippet(n.content, q), q)}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {nb && (
                          <span className="inline-flex items-center gap-1">
                            <BookOpen
                              className="h-3 w-3"
                              style={{ color: `hsl(${nb.color})` }}
                            />
                            {nb.name}
                          </span>
                        )}
                        {n.tagIds.map((tid) => {
                          const t = tags.find((x) => x.id === tid);
                          if (!t) return null;
                          return (
                            <span
                              key={tid}
                              className="inline-flex items-center gap-0.5"
                            >
                              <Hash className="h-3 w-3" /> {t.name}
                            </span>
                          );
                        })}
                        <span className="ml-auto">
                          {new Date(n.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
