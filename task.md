# Task: Command Palette UX improvements (items 1-7)

Improve the search popup (CommandPalette) user experience.

Files to edit:
- `frontend/src/features/notes/components/CommandPalette.jsx`
- `frontend/src/components/ui/command.jsx`

Reused utilities:
- `htmlToText` from `@/lib/sanitize`
- SearchPage's `highlight` / `snippet` pattern (`frontend/src/features/notes/pages/SearchPage.jsx`)

## 1. Cmd+N creates a note (global shortcut)

- Extend the existing keydown `useEffect` (lines 57-66) to also listen for
  `(metaKey || ctrlKey) && key === "n"`.
- On match: `e.preventDefault()` then call the existing `newNote()`.
- Guard: ignore when event target is editable (`e.target.closest("input, textarea, [contenteditable]")`).
- Aligns with the Cmd+N keycap already rendered in the palette.

## 2. Reset state when closed without navigating

- On `Dialog` `onOpenChange` close (open === false), clear query + selection.
- Currently state is only reset inside `go()`. Escape / outside-click leaves stale query.
- `onOpenChange={(open) => { if (!open) { setQ(""); setCmdk(false); } else { setCmdk(true); } }}`

## 3. "N more results" affordance row

- After the `filteredNotes` group, if raw `notes.length > 8`, render a row
  `{notes.length - 8}+ more results - Search all` (CommandItem).
- With a query navigates to `/search?q=${encodeURIComponent(q.trim())}`,
  without a query to `/search`.

## 4. Highlight matched term in snippets

- Add local `highlight` + `snippet` helpers (ported/memoized from SearchPage,
  or factored into a shared module).
- Title and preview show query match as `<mark className="bg-primary/30 ...">`.
- When `q` exists use `snippet({ html: note.content || "", q })`; fall back to
  `contentPreview` when empty.

## 5. Loading affordance via CommandLoading

- Add `CommandLoading` export to `frontend/src/components/ui/command.jsx`
  (cmdk already exports it).
- In CommandPalette, show `<CommandLoading>Loading results...</CommandLoading>`
  while `isFetching` from `useNotes`. Expose `isFetching` via destructure.

## 6. Recents chips in empty state

- When `q` is empty, read `RECENT_KEY` from localStorage into local state and
  render up to 8 recent terms as `CommandItem` chips in a "Recent searches" group.
- Chip click: `setQ(term)` (keeps palette open, refines in-palette).
- Provide a small clear control to wipe stored recents.

## 7. Counts on Notebook/Tag headings

- If filtered count < total, append `(n)` to group heading, e.g. `Notebooks (3)`.
- Signals active filtering; no navigation change.

## Verification

- `npm run build` in `frontend/`.
- Manual: open palette, type to confirm highlight + loading row + counts;
  press Cmd+N; press Cmd+K; close via Esc -> reopen shows empty state with recents.

## Out of scope

- Keyboard-first nav rewrite, fuzzy search, tag ordering in suggestions.