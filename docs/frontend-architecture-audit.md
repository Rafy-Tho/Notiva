# Frontend Architecture Audit — NoteFlow

> Status: Audit report (read-only analysis). Prepared 2026-09-24.
> Scope: `frontend/src`. No code was modified as part of this audit.

---

## 1. Executive Summary

The NoteFlow frontend is **already feature-based and structurally sound**: `features/{auth,notes,notebooks,tags}` each own their pages, components, hooks, and (for notes) lib logic. Server state is handled by TanStack Query with a sophisticated no-refetch optimistic-update layer (`useNotes.js` + `noteListCache.js` + `noteCounts.js`), shared UI is isolated in `components/ui` (clean shadcn primitives) and `components/common`.

The architecture does **not** need to be reorganized to match the reference structure in `task.md`. The real problems are:

1. **Inverted/wrong-way dependencies.** Global/layout code imports from features: `components/layout/Sidebar.jsx → features/notes/components/SidebarInner`, `AppLayout → CommandPalette`, `AppHeader → useNotes`, and `store/useNoteCountsStore.js → features/notes/lib/noteCounts`.
2. **One genuine circular import:** `lib/fetchWithAuth.js ↔ store/authStore.js`.
3. **Feature-to-feature coupling cycles:** notes ↔ notebooks, notes ↔ tags, auth ↔ notes via shared components and hooks.
4. **Over-bloated page/state ownership:** `NoteDetailPage.jsx` (692 lines) mixes data fetching, autosave state machine, navigation guards, and a large toolbar surface.
5. **Significant duplication** (safe to extract, explicitly justified): the note-creation flow, search `highlight/snippet`, recents-localStorage logic, save-status rendering in two widgets rendered at once, optimistic-update boilerplate across 7 notes mutations, and the byte-identical `sidebars/NameColorForm.jsx` in notebooks and tags.
6. **Auth server-state in a Zustand store while all other server state is in React Query** — an inconsistency, not a blocker.

All 44 tests pass and lint is clean; the audit recommends **targeted refactors only**, preserving behavior.

---

## 2. Current Architecture Overview

```
frontend/src/
├── main.jsx                    # root, wraps <ErrorBoundary><App/>
├── index.css
├── app/
│   ├── App.jsx                 # Bootstrap (session restore) + Providers + RouterProvider
│   ├── providers.jsx           # QueryClient (defined inline) + Sonner + DevTools
│   ├── routes.jsx              # dead barrel: re-exports router from ./routes/index
│   └── routes/index.jsx        # createBrowserRouter, lazy pages, guards
├── components/
│   ├── ui/                     # 15 shadcn-style primitives (button/, badge/, dialog.jsx, ...)
│   ├── common/                 # ErrorBoundary, ErrorOverlay, Loading, Logo (all generic)
│   └── layout/                 # AppLayout, AppHeader, Sidebar  <- imports from features
├── config/
│   └── api.js                  # baseURL, timeout, retry config, getApiUrl(), isRetryableStatus()
├── features/
│   ├── auth/    pages/(5) components/(UserSection, PublicRoute, PrivateRoute) hooks/(useMe.js)
│   ├── notes/   pages/(4) components/(14) hooks/(useNotes, useNoteActions) lib/(noteListCache, noteCounts + tests)
│   ├── notebooks/ components/(6) hooks/(useNotebooks) sidebars/(NameColorForm)
│   └── tags/     components/(6) hooks/(useTags) sidebars/(NameColorForm)
├── hooks/                      # useTheme, useDebounce, useAutosave, useCreateNoteContext, use-mobile.jsx
├── lib/                        # fetchWithAuth(+test), validation, formHooks, utils, sanitize, offlineQueue
└── store/                      # authStore, useUIStore, useNoteCountsStore
```

There are **no top-level `pages/`, `layouts/`, `utils/`, `constants/`, or `services/` folders** — pages live inside each feature, layouts live in `components/layout`, `cn` lives in `lib/utils.js`. This is a legitimate deviation from the reference structure (features own their pages; layout is a thin shell), not a defect. The `@` alias maps to `src/` (vite.config + jsconfig.json).

---

## 3. Architecture Strengths

- **Feature folders with real ownership.** `features/notes` owns its pages, components, hooks, and caching lib, and is covered by tests (`noteListCache.test.js`, `noteCounts.test.js`, `useAutosave.test.js`, `fetchWithAuth.test.js`).
- **Clean separation of server state.** TanStack Query holds notes/notebooks/tags server data; optimistic updates are centralized in hooks with snapshot/rollback via `noteListCache.js` and `noteCounts.js` (pure reducers with tests).
- **Shared UI is genuinely shared.** `components/ui` is 100% presentational shadcn primitives with zero feature/store imports; `components/common` (ErrorBoundary, ErrorOverlay, Loading, Logo) is generic and feature-agnostic.
- **Proper API-client layering.** Generic HTTP config lives in `config/api.js`; the credentialed fetch wrapper in `lib/fetchWithAuth.js`; features consume via hooks. No component calls `fetch` directly.
- **Good security habits.** No tokens in localStorage (see §14). Cookie-based `credentials:"include"`. DOMPurify sanitization on save (`lib/sanitize.js`). No secrets in client code.
- **Routing is lazy-loaded** with per-route Suspense and route-level errorElement.
- **`lib/fetchWithAuth.js` is high quality:** real AbortController bridging, per-attempt timeout, keepalive handling, 401-session-clear, retryable-status logic (tested).

---

## 4. Architecture Problems

**P1. Circular dependency: `lib/fetchWithAuth.js ↔ store/authStore.js`**
- `lib/fetchWithAuth.js:1` imports `useAuthStore`; `store/authStore.js:3` imports `fetchWithAuth` (and `authStore.js:5` uses it).
- ESM tolerates it only because `fetchWithAuth` touches the store at call time (`useAuthStore.getState().setUser`) — a latent cycle that makes static analysis, bundling, and test isolation fragile.

**P2. Global layers depend on feature code (inverted dependency)**
- `components/layout/Sidebar.jsx:5` → `@/features/notes/components/SidebarInner` (100% of sidebar content lives inside the notes feature).
- `components/layout/AppLayout.jsx:6` → `@/features/notes/components/CommandPalette`.
- `components/layout/AppHeader.jsx:5` → `@/features/notes/hooks/useNotes`, plus `:3` → `@/hooks/useCreateNoteContext` — the whole "New note" mutation flow (create → navigate → toast) lives in the shared header.
- `store/useNoteCountsStore.js:3` → `@/features/notes/lib/noteCounts` — the global store imports feature internals.

**P3. Feature ↔ feature coupling cycles**
- notes ↔ notebooks/tags: `SidebarInner.jsx` imports 6 things from notebooks/tags/auth; `NotebooksSection.jsx`/`TagsSection.jsx` import `Section` from notes; `NotebookRow`/`TagRow` import `NavItem` from notes.
- auth ↔ notes: `auth/pages/SettingsPage.jsx:47` imports `useNotes` (for the ZIP export); `notes/components/SidebarInner.jsx:7` imports `auth/components/UserSection`.
- None are ESM import cycles that crash, but they are conceptual feature cycles — moving the shared primitives (`Section`, `NavItem`) to a neutral layer removes 6 edges.

**P4. `NoteDetailPage.jsx` (692 lines) — page does too much.**
Two components in one file (`NoteDetailPage` + `NoteDetailEditor` at :119). It simultaneously: fetches data, wires the autosave state machine (`:155-188`), manages `serverUpdatedAtRef`, installs `beforeunload`/`useBlocker` guards, handles keyboard shortcuts, computes `wordCount` (`:227`), and renders the entire metadata toolbar (notebook select, tag popover, pin/fav, archive dropdown) plus two overlapping save-status widgets (`SaveBadge` :393 and `NoteStatusBar` :640).

**P5. Duplication (each item is an actual copy, not cosmetic):**

| Duplicated thing | Locations |
|---|---|
| Note-creation flow (create → navigate → toast) | `EmptyEditor.jsx:11-19`, `ActionButtons.jsx:14-22` |
| `highlight()` / `snippet()` | `SearchPage.jsx:25-47`, `CommandPalette.jsx:37-59` (byte-identical) |
| Recent-searches localStorage (same key `"noteflow_recent_searches"`, dedupe, cap 8) | `SearchPage.jsx:23-65,95-100`, `CommandPalette.jsx:34-128,178-187` |
| Save-status → label/icon state machine | `SaveBadge.jsx:11-61`, `NoteStatusBar.jsx:77-131` (both rendered at once) |
| Query-param building | `NotesPage.jsx:32-42`, `SearchPage.jsx:68-80`, `useNotes.js:42-52` and `:77-88` |
| Optimistic-update boilerplate (cancel→snapshot→setData→restore) | 7 mutations in `useNotes.js` (~230 lines) |
| `NameColorForm.jsx` | notebooks and tags copies are byte-identical (same SHA-256) |
| Color palette (`COLORS`) | 4 copies (both NameColorForms + both Create dialogs) |
| Search date filtering | `DateFilter.jsx` (presets) vs `SearchPage.jsx` (free from/to) — two concepts |
| Error/empty UI for list vs detail | `NotesPage.jsx:58-69`, `NoteDetailPage.jsx:96-106` |
| Word-count computation | `NoteDetailPage.jsx:227`, `NoteStatusBar.jsx:23`, `useNotes.js:171` |
| Base-path derivation with inconsistent archive/trash handling | `NoteList.jsx:82-94`, `useCreateNoteContext.js:8-28` |
| Global keydown handlers with inconsistent input-target guards | `NoteEditor.jsx:79-89`, `CommandPalette.jsx:148-167`, `NoteDetailPage.jsx:209-221` |

**P6. Auth server state lives in a Zustand store while everything else is in React Query.**
`authStore` holds `user`, `isLoading`, `error`, `isAuthenticated` (client + server state mixed) and performs API calls directly. `useMe.js` provides React Query mutations for the same domain but they don't write back to `authStore.user` — two sources for user data. Combined with P1/P2, `authStore` sits at the root of most coupling.

**P7. Minor:** `app/routes.jsx` is a pointless barrel (`export { router } from "./routes/index"`); `app/providers.jsx` defines `queryClient` inline (not in `lib/`) and ships `ReactQueryDevtools` in the production bundle; notes `pages/Index.jsx` is a 4-line redirect named deceptively like a barrel index; `hooks/use-mobile.jsx` is a hook in a `.jsx` file; `ActionButtons.jsx:3` uses the absolute `@/features/notes/hooks/useNotes` while sibling notes components use relative `../hooks/useNotes`.

---

## 5. Feature Boundary Analysis

- **Correctly placed:** notes pages/components/hooks/lib; notebooks & tags components/hooks; auth pages/components/hooks. `NoteEditor`, `NoteList`, auth pages etc. are **already inside their features** — good.
- **Leaking outward:** `features/notes/components/{Section,NavItem,SidebarInner,CommandPalette}` are consumed by `components/layout`, `features/notebooks`, and `features/tags`. `Section.jsx` (14 lines) and `NavItem.jsx` (28 lines) are generic primitives that happen to live in the notes feature — notebooks/tags import them as shared UI, which misrepresents ownership and creates the cycles in P3. These belong in shared UI, not the notes feature.
- **`SidebarInner.jsx`** is a cross-feature composition hub (holds state + dialogs for notebooks, tags, auth) living inside the notes feature; it is the sidebar, not a notes component. It belongs at the `components/layout` level (content that `Sidebar.jsx` renders).
- **`hooks/useCreateNoteContext.js`** (global) is notes-feature logic (derives notebook/tag/favorite defaults from note routes) used by `ActionButtons`, `EmptyEditor`, `NoteDetailPage`, and — because the layout header embeds the create flow — `AppHeader`. Once the header create flow moves into a notes-owned component (§17), this hook belongs in `features/notes/hooks/`.
- **`store/useNoteCountsStore.js`** holds counts that are notes-domain data; the counts store imports notes lib. It is global today only because sidebar sections + header read it.

**Judgment:** the notebook/tag/notes folders are correctly feature-made, but the cross-feature imports mean features are not independently removable. Fix by relocating the 2 shared primitives (`Section`, `NavItem`) and the sidebar hub, not by copying files.

---

## 6. Shared Component Analysis

`components/ui` — **GOOD**. All 15 primitives are pure shadcn-style presentational components; the only deviations (`avatar.jsx` image-retry loop, plain-`<hr>` separator) are generic UX, documented as intentional in `progress.md`.

`components/common` — **GOOD**. ErrorBoundary/ErrorOverlay/Loading are generic. `Logo.jsx` hardcodes the brand name — acceptable idiom, not business logic.

`components/layout` — **PROBLEM**. `AppHeader` (create-note business flow), `AppLayout` (`CommandPalette`), `Sidebar` (`SidebarInner`) all depend on the notes feature. This is the one place shared "components" contain feature business logic.

`Section` / `NavItem` (currently under `features/notes/components`) are actually shared app-shell primitives used by notebooks and tags — **incorrectly classified as notes-feature**.

`NameColorForm` (byte-identical in notebooks & tags `sidebars/`) is a shared form currently duplicated per feature. A shared component is justified here because the file is exactly identical, not just "similar".

---

## 7. Pages & Layout Analysis

- `features/notes/pages/Index.jsx` — trivial redirect, fine.
- `features/notes/pages/NotesPage.jsx` (179 lines) — good page: composes feature components, owns list/focus-mode state and pagination. Smell: re-derives query params duplicating `useNotes` (P5).
- `features/notes/pages/SearchPage.jsx` (338 lines) — proper page, but embeds `highlight`/`snippet`/recents helpers duplicating `CommandPalette` (P5) and uses a *different pagination* (`useNotes` single page) than the list (`useNotesInfinite`) for the same endpoint.
- `features/notes/pages/NoteDetailPage.jsx` (692 lines) — **the main offender.** Data orchestration, autosave, nav guards, keyboard shortcuts, and a large toolbar UI all in one file with a second component inside it (§4-P4).
- `features/auth/pages/SettingsPage.jsx` — large surface (profile, security, appearance, ZIP export, account deletion); reasonable as a page, but it reaches into `useNotes` (cross-feature, P3) and uses many bespoke local sections instead of shared components.
- Layout shells (`AppLayout` 25, `Sidebar` 36 lines) are thin; the substance (`SidebarInner`, `CommandPalette`, create flow) lives inside the notes feature — inverted (P2).

**Recommendation:** split `NoteDetailPage` into: page (fetch + compose), `useNoteEditing` hook (autosave + guards + saveMetadata ordering), and presentational slices (`NoteToolbar`, `DraftBanner`, `TrashBanner`). Keep everything in `features/notes`.

---

## 8. API & Service Analysis

The expected chain is `lib/api.js → feature service → hook → component`. Actual: `config/api.js` (URL + retry settings) → `lib/fetchWithAuth.js` (credentialed fetch) → **feature hooks** (inline API calls) → components/pages. The service layer is skipped — hooks embed fetch logic. **Reasonable:** services would be thin URI wrappers here; adding a `services/` layer to every feature would be over-engineering. Keep the hook-direct pattern; the real duplication is within hooks:

- `useNotes.js` duplicates a private `throwResponseError` + URLSearchParams mapping in 2 queries (P5).
- `useNotebooks.js` and `useTags.js` share ~95% structure (optimistic CRUD); `useMe.js`/`useNotebooks`/`useTags` each re-implement the "error extraction" pattern.
- `authStore` + `useMe.js` both reach `/me`-family endpoints — two parallel API paths for one domain (P6).

---

## 9. Hook Analysis

- **Global (`hooks/`):** `useDebounce` (generic, reused), `useTheme` (reads `useUIStore` — acceptable coupling), `useAutosave` (generic save-surface hook; genuinely reusable and tested), `use-mobile.jsx` (generic, mis-named extension).
- **Feature-specific in global:** `useCreateNoteContext.js` — notes route-context logic used only by notes create flows (§5).
- **In-feature:** `useNotes` / `useNoteActions` (correct), `useMe`, `useNotebooks`, `useTags` (correct).
- **Duplicated:** the create-note flow exists inline in `EmptyEditor` + `ActionButtons` rather than one composed hook; optimistic-update boilerplate x7 in `useNotes.js`; `useNoteActions.js` repeats the identical try/catch + `toast.error` envelope 7 times (acceptable, but a single wrapper would cut it down).
- `useAutosave` (384 lines) is complex but cohesive and tested — **do not split** its state machine.

---

## 10. State Management Analysis

Layering is mostly correct (UI/local vs server/cache):

| State | Where | Verdict |
|---|---|---|
| Editor draft, form fields | local `useState` via `useForm`/`useAutoSave` | GOOD |
| UI prefs + shell (theme, font, sidebar, cmdk, noteList, focusMode) | `store/useUIStore.js` (persisted subset) | GOOD |
| Notes/notebooks/tags server data | TanStack Query cache | GOOD |
| Optimistic list/count sync | Query cache + pure `noteCounts` reducers | GOOD |
| Auth session (user) | Zustand `authStore` | NEEDS IMPROVEMENT (inconsistent with rest of app) |
| Aggregate counts | Zustand `useNoteCountsStore` | NEEDS IMPROVEMENT (server-derived; imports feature lib) |

- **Server state duplication:** `authStore.user` and the `/me` mutations in `useMe.js` don't share cache; `useNoteCountsStore` is server data held outside React Query, mutated from inside `useNotes` optimistic handlers via `.getState()`. Reasonable pragmatic choice (nav-level counts synced by deltas) — **keep**, but extract `noteCounts` out of the store (P2).
- No `persist` on sensitive data (only theme/font persisted).

---

## 11. Routing Analysis

`app/routes/index.jsx` (189 lines) — **GOOD overall.**
- Layout hierarchy: `PublicRoute` (auth pages) and `PrivateRoute>AppLayout` (app) with `errorElement: ErrorOverlay` at both levels; redirects preserved; note detail nested under all six list routes via a shared `NoteDetailPageWrapper` re-keyed by `id`.
- All pages lazy-loaded with Suspense fallbacks — good for code splitting.
- The 6 route variants of `NotesPage` (index/notes/favorites/archive/trash + `NotebookRoute`/`TagRoute`) pass `filter` props built in two wrapper components — clean composition; any refactor of `NotesPage` touches six routes (high blast radius; refactor with care).
- **Minor:** `app/routes.jsx` is a dead one-line barrel; guards live inside `features/auth` (fine); the `useBlocker` concern lives in the page (correct).

---

## 12. Dependency Analysis

Actual dependency direction vs target:

```
app/routes → features (auth guards, note pages)                ✓ app → features
layout → features (Sidebar→SidebarInner, AppHeader→useNotes)   ✗ INVERTED (should be features→layout)
features/notes → features/{notebooks,tags,auth}                 ✗ feature→feature cycles
features/{notebooks,tags} → features/notes (Section, NavItem)   ✗ feature→feature
store → features/notes/lib/noteCounts                           ✗ store→feature
lib/fetchWithAuth ↔ store/authStore                             ✗ CIRCULAR
components/ui, components/common → lib/utils only               ✓ clean
features → components/ui + lib + config                         ✓ correct
```

Legitimate exceptions: `features/notes → components/layout` does **not** exist (good). `useUIStore` from layout/features is fine (infrastructure store). The inversion and cycles are the actionable items.

---

## 13. Circular Dependencies

1. **`lib/fetchWithAuth.js:1` ⇄ `store/authStore.js:3`** — a true import cycle (documented in §4-P1). Exact chain: `fetchWithAuth` requires `authStore` → `authStore` requires `fetchWithAuth`. No crash today because usage is deferred to call time, but it is the highest-priority structural fix.
2. **Indirect feature cycles (not ESM cycles, but conceptual):**
   - notes → tags → notes: `SidebarInner` → `TagsSection` → `Section` (notes)
   - notes → notebooks → notes: `SidebarInner` → `NotebooksSection` → `Section` (notes); `NotebookRow` → `NavItem` (notes)
   - auth → notes → auth: `SettingsPage` → `useNotes`; `SidebarInner` → `UserSection` (auth)
3. No barrel-file-related cycles found (the only barrel is `app/routes.jsx`, which is linear).

---

## 14. Security Architecture Analysis

- **Authentication:** server-managed httpOnly cookie (`noteflow_session`); `fetchWithAuth` uses `credentials: "include"`. **No tokens in localStorage/sessionStorage.** `restoreSession` unconditionally verifies the cookie on boot — correct.
- **Sensitive data in storage:** only UI prefs (theme/font) are persisted. Note drafts (`note_draft_*`), the offline queue (`api_offline_queue`, note content), and recents are localStorage — note **content is stored client-side**; acceptable for drafts, but flag the offline queue as containing note bodies.
- **Protected routes are client-side UX only** (`PrivateRoute`/`PublicRoute` redirect) — the backend enforces authorization. The code correctly doesn't claim otherwise.
- **XSS:** note HTML is sanitized with DOMPurify before save (`lib/sanitize.js:4`); TipTap renders the editor content; `htmlToText` is used only for previews/counts.
- **API config:** no secrets in `config/api.js` (build-time env via `VITE_BASE_API` only).
- Minor: `fetchWithAuth` fires `setUser(null)` on any 401 — correct session-clear semantics; keepalive flushes deliberately bypass abort (documented). No unsafe `dangerouslySetInnerHTML` found.

---

## 15. File-by-File Findings

| File | Problem | Why it's a problem | Current responsibility | Recommended responsibility | Suggested location | Priority |
|---|---|---|---|---|---|---|
| `lib/fetchWithAuth.js` (`:1`) | imports `authStore` (cycle with `store/authStore.js:3`) | circular dep lib↔store; static-analysis hazard | generic credentialed fetch wrapper | decouple: emit session-clear via callback/event, not store import | `lib/fetchWithAuth.js` | HIGH |
| `store/authStore.js` | mixes API calls + client state; cycles with fetchWithAuth; user server-state outside Query | two sources of user truth (authStore vs useMe); root of coupling | global auth store doing HTTP | split: `authStore` = client session state only; move HTTP into hooks/services | `features/auth/` + `store/authStore.js` | HIGH |
| `components/layout/AppHeader.jsx` (`:3,5`) | full create-note business flow in shared header | layout → feature; header depends on notes | header + note creation UX | header stays generic; extract create-note into a notes component mounted by the header | `features/notes/components/NewNoteButton.jsx` | HIGH |
| `components/layout/Sidebar.jsx` (`:5`) | renders `SidebarInner` from notes feature | inverted dependency | responsive shell | move sidebar content to `components/layout/SidebarInner.jsx` | `components/layout/SidebarInner.jsx` | HIGH |
| `components/layout/AppLayout.jsx` (`:6`) | imports `CommandPalette` from notes | layout → feature | app shell | move CommandPalette to shared common/ (it is a global ⌘K overlay) | `components/common/CommandPalette.jsx` | MEDIUM |
| `store/useNoteCountsStore.js` (`:3`) | imports `features/notes/lib/noteCounts` | store → feature | global counts store | keep store; move `noteCounts.js` to `lib/noteCounts.js` (pure, generic) | `lib/noteCounts.js` | MEDIUM |
| `features/notes/pages/NoteDetailPage.jsx` (692 lines) | page + autosave state machine + guards + toolbar in one file, 2nd component inside | too many responsibilities; hard to test/reuse | everything for a note's detail/edit | page = fetch+compose; `useNoteEditing` hook; `NoteToolbar`, `NoteHeaderMeta`, `DraftBanner`, `TrashBanner` components | `features/notes/` | HIGH |
| `features/notes/components/Section.jsx` | shared shell primitive used by notebooks & tags but owned by notes | feature→feature imports | tiny layout primitive | move to shared UI | `components/ui/section.jsx` or common | MEDIUM |
| `features/notes/components/NavItem.jsx` | shared shell primitive used by notebooks/tags but owned by notes | feature→feature imports | nav link primitive | move to shared UI | `components/ui/nav-item.jsx` or common | MEDIUM |
| `features/notes/components/SidebarInner.jsx` | cross-feature hub (notebooks/tags/auth dialogs + state) inside notes | mis-ownership; 6 cross-feature imports | sidebar composition | move to layout level | `components/layout/SidebarInner.jsx` | MEDIUM |
| `features/notes/components/CommandPalette.jsx` (349) | global ⌘K overlay inside notes; duplicates SearchPage helpers | wrong layer; duplication | app-wide command palette | move to common/; extract `highlight`/`snippet`/recents to `lib/searchText.js` | `components/common/CommandPalette.jsx` + `lib/searchText.js` | MEDIUM |
| `features/notes/pages/SearchPage.jsx` (`:25-47`) | duplicates `highlight`/`snippet`/recents of CommandPalette | copy-paste drift risk | search page | extract shared helpers | `lib/searchText.js` | LOW |
| `features/notes/hooks/useNotes.js` | 7 mutations repeat optimistic boilerplate; 2 queries duplicate URLSearchParams mapping | ~230 lines copy-paste | notes API hooks | one optimistic-mutation helper; one notes query fn | `features/notes/hooks/useNotes.js` | LOW |
| `features/notebooks/sidebars/NameColorForm.jsx` & `features/tags/sidebars/NameColorForm.jsx` | byte-identical duplicates | textbook shared-component candidate | feature forms | single shared component; single `COLORS` palette | `components/ui/name-color-form.jsx` (or common) | MEDIUM |
| notebooks/tags Create/Edit/Delete dialogs & forms | near-identical dialog/form pairs; COLOR duplicated (4×) | duplication | create/edit/delete UX | unify shared bits (NameColorForm, dialog-footer pattern); keep per-feature semantics | `components/common/` for shared skeleton | LOW |
| `features/notebooks/components/DeleteNotebookDialog.jsx` | `mode` radio (move-to-uncategorized vs delete) is **not sent to the API** — `mutateAsync(notebook.id)` only | silent client-only option | delete confirmation | either send `mode` to backend (needs API/spec change) or remove the radio; confirm with product | same file | MEDIUM |
| `features/notes/components/SaveBadge.jsx` & `NoteStatusBar.jsx` | identical save-status state machine; page renders both simultaneously | duplicate render/state; double derivation | save-state UI | keep both only if intentionally redundant (product decision) | `features/notes/components/` | LOW |
| `features/notes/components/EmptyEditor.jsx` (`:11-19`) & `ActionButtons.jsx` (`:14-22`) | duplicate create-note flow | copy-paste | create CTA | extract `useCreateNoteWithNavigation` hook | `features/notes/hooks/` | LOW |
| `features/notes/components/NoteList.jsx` (`:82-94`) | `getBasePath` duplicates `useCreateNoteContext` with different archive/trash handling | divergent behavior | scrollable list | reuse one helper | `features/notes/hooks/` | LOW |
| `hooks/useCreateNoteContext.js` | notes-feature logic in global hooks | wrong layer | note route context | move to notes feature (once AppHeader flow is extracted) | `features/notes/hooks/useCreateNoteContext.js` | MEDIUM |
| `hooks/use-mobile.jsx` | hook in `.jsx` file | naming/extension inconsistency | responsive hook | rename to `use-mobile.js` | `hooks/use-mobile.js` | LOW |
| `app/routes.jsx` | dead one-line barrel | needless indirection | router re-export | delete; import router from `./routes/index` directly | `app/` | LOW |
| `app/providers.jsx` | `queryClient` inline; DevTools always mounted | config not centralized; devtools in prod bundle | app providers | move `queryClient` to `lib/queryClient.js`; gate DevTools behind `import.meta.env.DEV` | `lib/queryClient.js` | LOW |
| `features/notes/pages/Index.jsx` | 4-line redirect named like a barrel index | confusing name | `/` → `/notes` | rename to `HomePage.jsx` | `features/notes/pages/` | LOW |
| `features/notes/components/ActionButtons.jsx:3` | absolute `@/features/notes/hooks/useNotes` while siblings use relative | inconsistency | sidebar buttons | use relative `../hooks/useNotes` | same | LOW |
| `lib/validation.js` | all feature schemas in one shared file | clusters feature validation outside features | validation | acceptable as-is; optionally split schemas per feature later — do not force | `lib/validation.js` (keep) | LOW |

---

## 16. Recommended Target Structure

Not a rewrite — only moves justified above:

```
frontend/src/
├── main.jsx
├── app/
│   ├── App.jsx
│   ├── providers.jsx            # move queryClient → lib/queryClient.js
│   └── routes/index.jsx         # delete dead routes.jsx barrel
├── components/
│   ├── ui/                      # (+ section.jsx, nav-item.jsx, name-color-form.jsx moved here)
│   ├── common/                  # (+ CommandPalette.jsx moved here from notes)
│   └── layout/
│       ├── AppLayout.jsx        # unchanged shell
│       ├── AppHeader.jsx        # minus the create-note flow → NewNoteButton
│       ├── Sidebar.jsx          # responsive shell
│       └── SidebarInner.jsx     # ← moved from features/notes (sidebar hub owns feature dialogs)
├── config/api.js
├── features/
│   ├── auth/    pages/ components/ hooks/
│   ├── notes/   pages/ components/ hooks/        # NoteDetailPage split; lib/ stays; useCreateNoteContext moves in
│   ├── notebooks/ components/ hooks/
│   └── tags/     components/ hooks/
├── hooks/                       # useDebounce, useAutosave (keep), use-mobile.js, useTheme
├── lib/                         # fetchWithAuth, queryClient, sanitize, validation, formHooks, utils, offlineQueue, noteCounts, searchText
└── store/                       # authStore (slimmed), useUIStore, useNoteCountsStore
```

Deliberately **not** added (would be over-engineering / unneeded): `layouts/` and `pages/` top-level folders (layouts live in `components/layout`, pages live in features — the project's chosen, valid convention), `constants/` (values are few and local), `utils/` (only `cn` exists; keep in `lib/utils.js`), feature `services/`/`validation/` subfolders (per task.md rule 3).

---

## 17. Refactoring Plan

### Phase 1 — Architecture problems (highest risk, do first, small)
1. **Break the `fetchWithAuth ⇄ authStore` cycle.** Option A (recommended): `fetchWithAuth` stops importing the store — accept an `onUnauthorized` callback wired once (e.g. in `providers.jsx`/`lib/queryClient.js`). Option B: extract session clearing into a `session.js` module both import. Affected: `lib/fetchWithAuth.js`, `store/authStore.js`, `providers.jsx`. Risk: behavioral change in the 401 path — keep `fetchWithAuth.test.js` updated; verify boot 401 still clears user.
2. **Move `noteCounts.js`** from `features/notes/lib/` → `lib/noteCounts.js`; repoint `useNoteCountsStore.js` and `features/notes/hooks/useNotes.js`. Pure move; run `noteCounts.test.js`.
3. **Move `Section.jsx` and `NavItem.jsx`** into shared UI; update imports in notes/notebooks/tags. Pure move; lint/build verify.

### Phase 2 — Responsibility boundaries
4. **Move `CommandPalette.jsx`** to `components/common/`; extract shared `highlight`/`snippet`/recents into `lib/searchText.js`; refactor `SearchPage.jsx` to use it. Keep the recents storage key identical.
5. **Move `SidebarInner.jsx`** to `components/layout/`. It already imports `Logo` from common; keep its dialog state. Update `layout/Sidebar.jsx`.
6. **Extract the create-note flow** from `AppHeader.jsx` into `features/notes/components/NewNoteButton.jsx` (uses `useCreateNote`, `useCreateNoteContext`, navigate, toast); `AppHeader` renders `<NewNoteButton />`. Verify ⌘N still works via CommandPalette.
7. **Split `NoteDetailPage.jsx`:** add `features/notes/hooks/useNoteEditing.js` (wrap `useAutoSave` + `useBlocker` + `beforeunload` + `serverUpdatedAtRef` + `saveMetadata` ordering) and components `NoteToolbar`, `NoteHeaderMeta`, `DraftBanner`, `TrashBanner`, `UnsavedDialog`. Page shrinks to ~150 lines of composition. Risk: the most delicate behavior (flush-before-mutation, 409 handling, save-and-leave) — keep the existing `useAutosave`/`useNoteActions` contracts identical; largest change.

### Phase 3 — Folder/file movement (mechanical)
8. `hooks/useCreateNoteContext.js` → `features/notes/hooks/` (after Phase 2 item 6).
9. `hooks/use-mobile.jsx` → `hooks/use-mobile.js`; `ActionButtons.jsx` import consistency.
10. Delete `app/routes.jsx`; point imports at `app/routes/index.jsx`.
11. `NameColorForm.jsx` × 2 → single shared component; consolidate `COLORS` palette. Update 4 dialogs + 2 forms.

### Phase 4 — Dependency cleanup
12. Re-verify dependency graph after Phases 1–3 with an import scan (`@/features` inside `components/` and `store/`). Expected remaining: `components/layout → NewNoteButton`/`CommandPalette` wiring (acceptable, layout is the composition root).
13. `authStore` split (optional, HOT): move `/me`-family HTTP mutators into `features/auth` hooks/services using `useMe.js`; authStore keeps session selectors + `setUser`. Keep `login`/`logout`/`restoreSession` in the store (session lifecycle). Risk: touching auth — do last, guard with existing auth flows.

### Phase 5 — Performance (only meaningful items)
14. Gate `ReactQueryDevtools` behind `import.meta.env.DEV` (drops devtools from the prod bundle).
15. Resolve the double retry layering: `providers.jsx` sets `retry: 3` and `fetchWithAuth` also retries — combined worst-case ~4× requests on a flaky 5xx. Decide one owner (recommend Query-level `retry: 0` for notes queries that use fetch-level retry); do not change both at once.
16. Single source for `wordCount` (computed in `useNotes` optimistic path, `NoteDetailPage`, `NoteStatusBar`) — compute once in the `useNoteEditing` hook.

### Phase 6 — Cleanup
17. Remove the dead `onSaved={() => {}}` prop in `EditNotebookDialog`; remove the dead `mode` in `DeleteNotebookDialog` (or wire it — needs product/API decision; do not ship silently).
18. Unify the two error-state UIs (`NotesPage`/`NoteDetailPage`) on a shared `ErrorState` component (reuse `ErrorOverlay` styling).
19. Run `npm run lint`, `npm run test` (44), `npm run build` after each phase; update `docs/` + `progress.md` per repo rules.

Preserve behavior throughout: no API contract changes, no route changes, no schema changes.

---

## 18. Final Checklist (Actual vs Target)

| Area | Current Structure | Target Principle | Status | Reason |
|---|---|---|---|---|
| Features | `features/{auth,notes,notebooks,tags}` with pages/components/hooks (+lib) | Feature-based | **GOOD** | Correct feature ownership already in place |
| Shared UI | `components/ui` + `components/common`; `layout` imports features; `Section`/`NavItem` misplaced | Truly reusable | **NEEDS IMPROVEMENT** | Move `Section`/`NavItem` up; extract `SidebarInner`/`CommandPalette`/`NewNoteButton` |
| Pages | Pages inside features; `NoteDetailPage` 692 lines | Composition | **NEEDS IMPROVEMENT** | Split `NoteDetailPage` into page + hook + toolbar/banner components |
| API | `config/api.js` → `lib/fetchWithAuth` → hooks; no services layer | Proper separation | **GOOD** | Reasonable to skip services (thin wrappers); fix fetchWithAuth↔authStore cycle |
| Hooks | Global `hooks/` mostly generic; `useCreateNoteContext` misplaced | Shared vs feature | **NEEDS IMPROVEMENT** | Move notes-specific hook into the feature |
| State | Query for server data; Zustand for UI; auth user + counts in Zustand (server-derived) | Correct ownership | **NEEDS IMPROVEMENT** | Extract `noteCounts` to lib; consider slimming authStore |
| Routing | `app/routes/index.jsx`, lazy, guarded, errorElement | App infrastructure | **GOOD** | Dead `routes.jsx` barrel is trivial cleanup |
| Validation | `lib/validation.js` with Zod schemas + `useForm` | Feature ownership | **GOOD** | Co-located schemas are small; no need to split (do not force `validation/` folders) |

Statuses: GOOD / NEEDS IMPROVEMENT / PROBLEM / NOT APPLICABLE. No numeric scores, no overall rating.

---

## 19. Implementation Status (2026-09-24)

All six phases of the §17 plan were executed as a behavior-preserving refactor (no API, route, or schema changes). Final locations:

- **1.1 Circular dependency broken:** `lib/fetchWithAuth.js` no longer imports the auth store. New module-level `setOnUnauthorizedHandler(cb)`; the handler is registered once in `app/providers.jsx` as `() => useAuthStore.getState().setUser(null)`. A 401 still clears the session and is never retried. Covered by a new test in `fetchWithAuth.test.js`.
- **1.2** `features/notes/lib/noteCounts.js` (+ test) moved to `lib/noteCounts.js`; importers repointed (`store/useNoteCountsStore.js`, `features/notes/hooks/useNotes.js`).
- **1.3** `Section.jsx` + `NavItem.jsx` moved to `components/common/`; importers updated (NavSections, NotebooksSection, TagsSection, NotebookRow, TagRow).
- **2.4** `CommandPalette.jsx` moved to `components/common/` (accepted composition-root exception importing feature hooks); shared `highlight`/`snippet`/recents helpers extracted to `lib/searchText.jsx` (JSX-containing helpers require the `.jsx` extension under Vite) and adopted by `SearchPage.jsx`; also fixed the pre-existing exhaustive-deps warning in CommandPalette.
- **2.5** `SidebarInner.jsx` → `components/layout/`.
- **2.6** New-note flow extracted from `AppHeader.jsx` into `features/notes/components/NewNoteButton.jsx`; the header renders `<NewNoteButton />`.
- **2.7** `NoteDetailPage.jsx` split into a fetch+compose page plus `features/notes/hooks/useNoteEditing.js` and components `NoteToolbar`, `DraftBanner`, `TrashBanner`, `UnsavedDialog`. The `useAutosave`/`useNoteActions` contracts are unchanged.
- **3.8** `hooks/useCreateNoteContext.js` → `features/notes/hooks/` (4 importers updated).
- **3.9** `hooks/use-mobile.jsx` → `hooks/use-mobile.js` (import was extensionless; no importer change needed).
- **3.10** Deleted `app/routes.jsx` barrel; `App.jsx` now imports `./routes/index`.
- **3.11** Two byte-identical `sidebars/NameColorForm.jsx` consolidated into one `components/common/NameColorForm.jsx`; the duplicated `COLORS` palette (4 copies) consolidated into `lib/colors.js` (fast-refresh rule requires the constant to live outside the component file). 4 dialogs + 2 forms updated; the `sidebars/` folders were removed.
- **4.12** Re-scan after Phases 1–3: `components/` feature imports are now only the layout composition roots (`SidebarInner`, `AppHeader → NewNoteButton`) and the documented `CommandPalette` exception; `store/` has zero feature imports.
- **4.13 (minimal)** `/me` DELETE moved out of `authStore` into `useDeleteUser` (`features/auth/hooks/useMe.js`); `SettingsPage` uses the mutation then `setUser(null)`. `login`/`logout`/`restoreSession`/verification actions stay in the store (session lifecycle). Removed the `delete` store action.
- **5.14** `ReactQueryDevtools` gated behind `import.meta.env.DEV` (dropped from the prod bundle).
- **5.15** Double retry resolved: `retry: 0` at the query layer; `fetchWithAuth` remains the single retry owner (retryable statuses + network/timeout errors, 401 never retried).
- **5.16** `wordCount` now computed once in `useNoteEditing` and passed to `NoteStatusBar` as a `words` prop (status bar still computes `chars` itself).
- **6.17** Removed the dead `onSaved={() => {}}` prop in `EditNotebookDialog`. The `DeleteNotebookDialog` `mode` radio was **kept as-is** (needs a product/API decision — not removed silently, per plan).
- **6.18** Shared `components/common/ErrorState.jsx` unifies the `NotesPage` and `NoteDetailPage` error states.

**Verification:** `npm run lint` (0 errors, 0 warnings), `npm run test` (45 tests, 4 files), `npm run build` all pass. Docs updated: `docs/03-architecture.md`, `docs/16-error-handling.md`, `docs/frontend-architecture-audit.md`, `specs/notes/organize.md`, `specs/notes/edit.md`, `progress.md`.

**Deliberately left for a follow-up (no hidden behavior change):**
- `hooks/useNotes.js` still has 7 mutations repeating optimistic boilerplate and 2 queries duplicating `URLSearchParams` mapping (LOW – §16-257).
- `NoteList.jsx` `getBasePath` still diverges slightly from `useCreateNoteContext` (LOW – P5-263).
- `DeleteNotebookDialog` `mode` radio (needs product/API decision – §16-260).
- `SaveBadge`/`NoteStatusBar` save-state duplication (product decision – §16-261).
- `queryClient` still lives inline in `providers.jsx` (not extracted to `lib/queryClient.js` — cosmetic, plan §17).
- `SettingsPage.jsx` still reaches into `useNotes` for the ZIP export (cross-feature; acceptable for the feature page).