import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  Pin,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotebooks } from "@/features/notebooks/hooks/useNotebooks";
import { useNotes } from "../hooks/useNotes";
import { useTags } from "@/features/tags/hooks/useTags";
import { useDebounce } from "@/hooks/useDebounce";
import {
  highlight,
  loadRecentSearches,
  saveRecentSearch,
  snippet,
} from "@/lib/searchText";
import { cn } from "@/lib/utils";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";
  const notebookId = searchParams.get("notebook") || "";
  const tagId = searchParams.get("tag") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const pinned = searchParams.get("pinned") === "1";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [recents, setRecents] = useState(loadRecentSearches);

  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value === false || value == null) {
        next.delete(key);
      } else if (value === true) {
        next.set(key, "1");
      } else {
        next.set(key, String(value));
      }
    }
    if (next.get("page") === "1") next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const debouncedQ = useDebounce(q, 1000);

  const apiParams = useMemo(() => {
    const p = {};
    if (debouncedQ) p.search = debouncedQ;
    if (notebookId) p.notebookId = notebookId;
    if (tagId) p.tagId = tagId;
    if (from || to) p.dateFilter = "custom";
    if (from) p.from = from;
    if (to) p.to = to;
    if (pinned) p.isPinned = true;
    if (page > 1) p.page = page;
    p.includeContent = true;
    return p;
  }, [debouncedQ, notebookId, tagId, from, to, pinned, page]);

  const saveRecent = (term) => {
    if (!term.trim()) return;
    setRecents(saveRecentSearch(term, recents));
  };

  const { data: notesResult = {} } = useNotes(apiParams);
  const notes = useMemo(() => notesResult.notes ?? [], [notesResult.notes]);
  const total = notesResult.total ?? 0;
  const totalPages = notesResult.totalPages ?? 1;
  const { data: notebooks = [] } = useNotebooks();
  const { data: tags = [] } = useTags();

  const clear = () => {
    update({ q: "", notebook: "", tag: "", from: "", to: "", pinned: false });
  };
  const hasFilters = !!(notebookId || tagId || from || to || pinned);

  const memoizedNotebooks = useMemo(() => {
    const map = new Map();
    notebooks.forEach((nb) => map.set(nb.id, nb));
    return map;
  }, [notebooks]);

  const memoizedTags = useMemo(() => {
    const map = new Map();
    tags.forEach((t) => map.set(t.id, t));
    return map;
  }, [tags]);

  const searchResults = useMemo(() => {
    return notes.map((n) => {
      const nb = memoizedNotebooks.get(n.notebookId);
      const tags = n.tagIds.map((tid) => memoizedTags.get(tid)).filter(Boolean);
      return {
        ...n,
        nb,
        tags,
      };
    });
  }, [notes, memoizedNotebooks, memoizedTags]);

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
              onChange={(e) => update({ q: e.target.value })}
              onBlur={() => saveRecent(q)}
              placeholder="Search every note…"
              className="pl-9"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
            <select
              value={notebookId}
              onChange={(e) => update({ notebook: e.target.value })}
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
              onChange={(e) => update({ tag: e.target.value })}
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
              onChange={(e) => update({ from: e.target.value })}
              className="h-9"
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => update({ to: e.target.value })}
              className="h-9"
            />
            <label className="flex items-center gap-2 px-2 h-9 rounded-md border border-input bg-background text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => update({ pinned: e.target.checked })}
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
                  onClick={() => update({ q: r })}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {total > 0 && (
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of{" "}
              {total} result{total === 1 ? "" : "s"}
            </div>
          )}
          {notes.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              {q || hasFilters
                ? "No matches. Try a different query or clear filters."
                : "Type to search your notes."}
            </div>
          ) : (
            <ul className="space-y-2">
              {searchResults.map((n) => (
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
                        {highlight({ text: n.title || "Untitled", q })}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {highlight({ text: snippet({ html: n.content, q }), q })}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {n.nb && (
                        <span className="inline-flex items-center gap-1">
                          <BookOpen
                            className="h-3 w-3"
                            style={{ color: `hsl(${n.nb.color})` }}
                          />
                          {n.nb.name}
                        </span>
                      )}
                      {n.tags.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center gap-0.5"
                        >
                          <Hash className="h-3 w-3" /> {t.name}
                        </span>
                      ))}
                      <span className="ml-auto">
                        {new Date(n.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => update({ page: Math.max(1, page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => update({ page: page + 1 })}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
