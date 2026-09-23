# UI Design System — NoteFlow

Current visual design extracted from the actual frontend source (`frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/components/ui/*`, and the feature components). This document describes **only** the visual/UI design as it exists today.

---

## Overall style

- Modern SaaS productivity app with a **Linear-inspired, dense dark UI** (explicit comment in `index.css`).
- Dark mode is the **default** (`<html class="dark">` in `index.html`); light mode exists as a secondary theme.
- Minimal, clean, border-based ("hairline") surfaces rather than heavy raised cards.
- Dense information density: small type, compact controls, tight spacing.
- One accent gradient (indigo → violet) reserved for primary/brand actions.
- Stack: React 19 + Vite + Tailwind CSS 3 + shadcn/ui (Radix primitives) + lucide-react icons.

---

## Color palette

All values are HSL as defined in `index.css`. The app ships two themes: dark (default) and light.

### Semantic tokens

| Token | Light | Dark |
|---|---|---|
| `background` | `0 0% 100%` | `240 10% 5%` |
| `foreground` | `240 10% 6%` | `240 5% 96%` |
| `card` | `0 0% 100%` | `240 10% 7%` |
| `card-foreground` | `240 10% 6%` | `240 5% 96%` |
| `popover` | `0 0% 100%` | `240 10% 8%` |
| `popover-foreground` | `240 10% 6%` | `240 5% 96%` |
| `primary` | `245 75% 60%` | `245 80% 66%` |
| `primary-foreground` | `0 0% 100%` | `240 10% 5%` |
| `primary-glow` | `252 90% 72%` | `260 90% 72%` |
| `secondary` | `240 5% 96%` | `240 6% 12%` |
| `secondary-foreground` | `240 10% 10%` | `240 5% 96%` |
| `muted` | `240 5% 96%` | `240 6% 11%` |
| `muted-foreground` | `240 4% 46%` | `240 5% 60%` |
| `accent` | `245 75% 60%` | `245 80% 66%` |
| `accent-foreground` | `0 0% 100%` | `0 0% 100%` |
| `destructive` | `0 72% 51%` | `0 70% 55%` |
| `destructive-foreground` | `0 0% 100%` | `0 0% 100%` |
| `success` | `142 71% 45%` | `142 65% 50%` |
| `warning` | `38 92% 50%` | `38 92% 55%` |
| `border` | `240 6% 90%` | `240 6% 14%` |
| `input` | `240 6% 90%` | `240 6% 14%` |
| `ring` | `245 75% 60%` | `245 80% 66%` |
| `radius` | `0.5rem` | `0.5rem` |

### Sidebar tokens

| Token | Light | Dark |
|---|---|---|
| `sidebar-background` | `240 6% 97%` | `240 10% 4%` |
| `sidebar-foreground` | `240 6% 26%` | `240 5% 80%` |
| `sidebar-primary` | `245 75% 60%` | `245 80% 66%` |
| `sidebar-primary-foreground` | `0 0% 100%` | `0 0% 100%` |
| `sidebar-accent` | `240 5% 92%` | `240 6% 10%` |
| `sidebar-accent-foreground` | `240 10% 10%` | `240 5% 96%` |
| `sidebar-border` | `240 6% 88%` | `240 6% 12%` |
| `sidebar-ring` | `245 75% 60%` | `245 80% 66%` |

### Gradients

- `gradient-primary` (light): `linear-gradient(135deg, hsl(245 75% 60%), hsl(265 80% 65%))`
- `gradient-primary` (dark): `linear-gradient(135deg, hsl(245 80% 66%), hsl(265 85% 70%))`

### Content accent color presets

Used for notebooks and tags (stored as bare HSL strings, e.g. `style={{ color: hsl(...) }}`). Six presets in `NameColorForm.jsx`:

```
245 80% 66%  (indigo, default)
200 80% 60%  (sky)
38 92% 60%   (amber)
142 65% 50%  (green)
0 70% 60%    (red)
280 70% 65%  (purple)
```

### Syntax highlight tokens (editor code blocks)

Comment/quote `240 5% 50%`, keyword `280 70% 70%`, string/attr `142 60% 60%`, number/literal `38 90% 65%`, title/name `200 80% 70%`, built-in `245 80% 75%`, tag/attribute `0 70% 70%`.

---

## Typography

- **Primary (sans):** `Inter` (weights 400, 500, 600, 700), loaded via Google Fonts import in `index.css`. Fallback: `ui-sans-serif, system-ui, sans-serif`.
- **Mono:** `JetBrains Mono` (weights 400, 500) for code, `code`, `pre`, `.font-mono`, and keyboard hints. Fallback: `ui-monospace, monospace`.
- **Serif (editor font pref):** `Iowan Old Style, Georgia, serif` (`.font-serif-pref`).
- `body` also sets `font-feature-settings: "cv02","cv03","cv04","cv11"` and `antialiased`.
- Editor font preference (`sans` / `serif` / `mono`) toggles a class on `<html>` via `useTheme`; the `.font-mono`/`.font-serif-pref` classes override the body font.

### Sizes & weights (as used in code)

| Use | Class / value | Weight |
|---|---|---|
| Page title (Settings) | `text-3xl` | `font-semibold`, `tracking-tight` |
| Page title (Search) | `text-2xl` | `font-semibold`, `tracking-tight` |
| Note title (editor) | `text-3xl` | `font-semibold`, `tracking-tight` |
| Dialog / sheet / alert title | `text-lg` | `font-semibold` (`tracking-tight` on dialog) |
| Card list title (NoteCard) | `text-sm` | `font-medium` |
| Body / defaults | `text-sm` (md:14px) | `font-normal` |
| Editor paragraph body | `text-[15px] leading-7` | normal |
| Editor H1 / H2 / H3 | `text-3xl / text-2xl / text-xl` | `font-semibold`, `tracking-tight` |
| Micro-labels / meta | `text-[10px]`, `text-[11px]`, `text-xs` | `font-medium`–`font-semibold`; section headers `uppercase tracking-wider` |
| Dialog description, secondary text | `text-sm text-muted-foreground` | normal |
| Mono kbd hints | `text-[10px] font-mono` | normal |
| Logo wordmark | `font-semibold tracking-tight` | — |

---

## Spacing

- **App shell:** full-viewport `flex h-dvh`; header `h-12` (48px); sidebar `w-60` (240px) desktop / `w-72` mobile sheet; note list column `w-72`.
- **Header:** `px-2 sm:px-3`, internal `gap-1`.
- **Sidebar:** logo strip `h-12 px-3`; action buttons `px-3 pt-3` with `gap-1.5`; nav `px-2 py-3 text-sm`; user footer `p-2`.
- **Editor:** content column `max-w-3xl mx-auto`, horizontal padding `px-4 sm:px-6 md:px-10 lg:px-12`; top padding `pt-6` for meta row / `pt-2` for title and editor.
- **Settings / Search pages:** `max-w-3xl` (settings) / `max-w-4xl` (search), `px-5 py-8 md:px-10 md:py-12` (settings) and `px-5 py-6 md:px-10 md:py-10` (search), `space-y-10` (settings sections).
- **Common gaps:** `gap-1` (tight icon rows), `gap-1.5` (button/label clusters, badges), `gap-2`, `gap-3` (form fields), `space-y-1.5` (label→input), `space-y-3` (form groups), `space-y-5` (auth card).
- **Dialogs:** `p-6 gap-4`; footer buttons `space-x-2`.
- **List rows:** NoteCard `px-3 py-3`; nav items `px-2 py-1.5`; dropdown items `px-2 py-1.5`.
- **Responsive padding rule of thumb:** `4 → 6 → 10 → 12` (px scale) as viewport grows.

---

## Border radius

Base token `--radius: 0.5rem` (8px). Tailwind derives:
- `lg` = `var(--radius)` = **8px**
- `md` = `calc(var(--radius) - 2px)` = **6px**
- `sm` = `calc(var(--radius) - 4px)` = **4px**

| Element | Radius |
|---|---|
| Buttons | `rounded-md` (6px); `rounded-md` on sm/lg/icon too |
| Inputs | `rounded-md` (6px) |
| Selects | `rounded-md` (6px) |
| Panels / cards (`.panel`) | `rounded-lg` (8px) |
| Logos, empty-state icon tile | `rounded-md` (8px); empty-state CTA tile `rounded-2xl` (16px) |
| Dialogs / sheets / alerts | `sm:rounded-lg` (8px desktop); full-bleed on mobile |
| Dropdowns / context menus / select content | `rounded-md` (6px) |
| Avatars | `rounded-full` |
| Images / code blocks | `rounded-md` (6px) |
| Swatches (color picker) | `rounded-md` (6px) |
| Tag badges | `rounded-md` (6px) |

---

## Shadows

| Use | Shadow |
|---|---|
| Brand / primary CTAs | `shadow-glow`: `0 0 0 1px hsl(245 75% 60% / 0.18), 0 8px 24px -8px hsl(245 75% 60% / 0.45)` (dark: `/ 0.25` + `0 12px 32px -10px / 0.55`) |
| Panels / surfaces | `shadow-panel`: `0 1px 0 hsl(240 6% 90% / 0.6)` (light) / `inset 0 -1px 0 hsl(240 6% 14% / 0.6)` (dark) — a hairline highlight, not a drop shadow |
| Dialogs, sheets, toasts | `shadow-lg` |
| Dropdowns / select / popover / context menu | `shadow-md` |
| Cards | None beyond borders + optional `shadow-panel` (no drop shadow on cards) |

---

## Buttons

Standard shadcn-style, defined in `components/ui/button/button.jsx`.

**Base:** `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors`, icons sized `size-4`.

**Variants:**
- `default` — `bg-primary text-primary-foreground hover:bg-primary/90`
- `destructive` — `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- `outline` — `border border-input bg-background hover:bg-accent hover:text-accent-foreground`
- `secondary` — `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- `ghost` — `hover:bg-accent hover:text-accent-foreground`
- `link` — `text-primary underline-offset-4 hover:underline`

**Sizes:**
- `default` — `h-10 px-4 py-2`
- `sm` — `h-9 rounded-md px-3`
- `lg` — `h-11 rounded-md px-8`
- `icon` — `h-10 w-10`

**Custom conventions observed in the app:**
- Primary CTA "overdrive": `bg-gradient-primary text-primary-foreground` (+ optional `shadow-glow`) — used for New note, Sign in / Create account, empty-state CTA, sidebar New note (adds `hover:opacity-90`).
- Compact toolbar variant: `h-7 w-7` (editor toolbar) and `h-7 px-2 text-[11px]` (note meta row, bordered ghost: `border border-border bg-transparent hover:bg-muted/40`).
- Ghost icon buttons in header: `h-8 w-8 text-muted-foreground hover:text-foreground`.

**Focus:** `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (ring-offset-background). **Disabled:** `opacity-50 pointer-events-none`.

---

## Inputs / forms

Standard shadcn `Input` (`components/ui/input.jsx`).

- **Base:** `h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm`, `placeholder:text-muted-foreground`.
- **Focus:** `focus-visible:ring-2 ring-ring ring-offset-2` (outline removed). **Disabled:** `opacity-50 cursor-not-allowed`.
- **Compact variants:** list search `h-8 px-7 text-xs`; date filters `h-9`; dialog name field `py-2 text-sm` (re-implemented inline in `NameColorForm`).
- **Labels:** `text-sm font-medium leading-none` (`Label`); Settings `Field` labels are `text-xs font-medium text-muted-foreground uppercase tracking-wide`.
- **Checkboxes:** native `<input type="checkbox">` (no themed component) — auth pages / search use default browser checkbox with `gap-2 text-xs text-muted-foreground`.
- **Select:** `SelectTrigger` mirrors input styling (`h-10 rounded-md border-input ... [&>span]:line-clamp-1`, chevron `h-4 w-4 opacity-50`); compact variant `h-7 px-2 text-[11px]`.
- **Error state (forms):** `Not found` — there is no dedicated error input style (no `aria-invalid`/red-border treatment). Validation errors surface via `toast.error` and inline text; destructive coloring is applied where text uses `text-destructive`.
- **Search highlight:** matched text rendered with `<mark class="bg-primary/30 text-foreground rounded px-0.5">`.

---

## Cards

- **`.panel`** (utility class): `bg-card border border-border rounded-lg` — used for auth card, settings sections (`p-5 md:p-6`), search filter panel, search result rows.
- **NoteCard (list row):** `block px-3 py-3 border-b border-border hover:bg-muted/40 transition-colors select-none`; active row `bg-muted/60`. Contents: title `text-sm font-medium truncate`, preview `text-xs muted line-clamp-2`, meta `text-[10px] muted` (relative time · word count). Pinned/favorite indicators: `Pin` `text-primary fill-primary h-3 w-3`, `Star` `text-warning fill-warning`.
- **Search result rows:** `panel w-full text-left p-3 hover:border-primary/60 hover:bg-accent/30 transition-colors`.
- **Banner cards (note detail):** draft-restore banner `rounded-md border border-primary/30 bg-primary/5 px-3 py-2`; trash banner `border border-border bg-muted/40`.
- **Settings rows (export / account):** `rounded-lg border border-border bg-muted/30 p-4`; destructive variant `border-destructive/40 bg-destructive/5` with `text-destructive` heading.
- **Skeleton:** `animate-pulse rounded-md bg-muted`.

---

## Navigation

- **App shell:** `Sidebar` (left) + `main` (`flex-1 min-w-0`) with `AppHeader` on top, then routed content.
- **Sidebar (desktop):** `hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out`; collapses to `w-0 border-r-0`.
  - Logo strip `h-12 items-center justify-between px-3 border-b border-border`.
  - Action buttons: gradient "New note" (full-width) + outline Search with `⌘K` kbd hint.
  - Nav (`flex-1 overflow-y-auto px-2 py-3`): `NavItem` = `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors`; active = `bg-sidebar-accent text-foreground`; icons `h-3.5 w-3.5`; counts `text-[10px] muted tabular-nums`.
  - `SectionHeader`: `text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mt-2 mb-1` with a `+` action button (`h-3.5 w-3.5 muted hover:foreground`).
  - `UserSection`: `border-t border-border p-2`; link `rounded-md px-2 py-1.5` with small avatar (gradient fallback) + name/email + settings gear.
- **Header:** `h-12 shrink-0 flex items-center gap-1 px-2 sm:px-3 border-b border-border bg-background/80 backdrop-blur`. Contains sidebar toggle (ghost icon), brand, and right cluster: Search (`ghost sm`, label `hidden sm:inline text-xs`), New note, user Avatar (`h-8 w-8`).
- **Note list column (NotesPage):** `w-full md:w-72 border-r border-border transition-[width] duration-200 ease-out`; header `h-12 px-3 border-b` with title `text-sm font-semibold` + count `text-[10px] muted`; search/filter block `px-3 py-2 space-y-2 border-b`.
- **Editor toolbar:** `sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background/80 backdrop-blur px-3 py-1.5`; group separators `mx-1 h-4 w-px bg-border`; active tool `bg-muted text-foreground`.
- **Command palette (⌘K):** `DialogContent p-0 max-w-xl`; input row `h-12` with search icon; groups with `text-xs font-medium muted` headings; items `px-2 py-3 rounded-sm` with icons `h-4 w-4`.
- **Context menus / dropdowns:** Radix menus on notebook/tag rows — "Rename / recolor", "Delete notebook/tag" (`text-destructive`).

---

## Icons

- **Library:** `lucide-react`.
- **Sizes used:** `h-3 w-3` (kbd/shortcuts, tiny indicators), `h-3.5 w-3.5` (nav items, editor toolbar, meta buttons, context menus), `h-4 w-4` (buttons, menus, empty states), `h-5/h-6` (larger empty-state and CTA icons), `h-8` sidebar icons (`Not found` — not observed; standard range is 3–6).
- **Style:** default lucide stroke (2px), inline-styled color: inherited or accent via `hsl()` (notebooks/tags), or `text-muted-foreground` / `text-primary` / `text-warning` fills for pinned/starred states.
- Icons inside buttons are automatically sized `size-4` and `shrink-0`.

---

## Layout

- **Shell:** `flex h-dvh w-full overflow-hidden bg-background text-foreground` — three zones: sidebar | note list + editor | command palette (overlay).
- **Container:** Tailwind `container` config = `center, padding 2rem, 2xl: 1400px` (declared but pages use `max-w-3xl`/`max-w-4xl` mx-auto instead of `container`).
- **Content columns:** editor + detail pages `max-w-3xl mx-auto`; search `max-w-4xl mx-auto`; auth card `max-w-sm` centered.
- **Alignment:** header/footer rows use `flex items-center justify-between`; auth/empty states use `grid place-items-center`; footers `justify-end`.
- **Page spacing:** settings `space-y-10` between sections; search results `space-y-2`.
- **Grids:** `grid gap-4 sm:grid-cols-2` (settings fields), `grid-cols-3 gap-3` (theme/font pickers), `gap-2 sm:grid-cols-2 md:grid-cols-5` (search filters).
- **Z-stacks:** overlays/modals `z-50`; sticky toolbar `z-10`.
- **Scrollbars:** custom webkit — track transparent, thumb `hsl(var(--border))` rounded 8px with 2px transparent border clip; hover thumb `hsl(var(--muted-foreground) / 0.4)`.

---

## Responsive UI

- **Breakpoint:** `768px` (`useIsMobile`, `md:`). Mobile = `< 768px`.
- **Sidebar:** desktop persistent collapsible (`w-60` ↔ `w-0`); mobile slides in as a Sheet (`w-72 h-full p-0 bg-sidebar`) with `bg-black/80` overlay.
- **Note list:** mobile = full-width (editor hidden unless a note is selected, `hidden md:flex`); desktop = `md:w-72` resizable/toggleable via `transition-[width]`. On mobile a "Notes" back button appears in the editor strip.
- **Header:** brand renders on mobile always, on desktop only when sidebar collapsed; button text labels (`Search`, `New`) hidden below `sm`.
- **Editor padding:** `px-4 sm:px-6 md:px-10 lg:px-12`.
- **Dialogs/footers:** headers/footers stack centered on mobile (`text-center sm:text-left`, `flex-col-reverse sm:flex-row`), `sm:rounded-lg`.
- **Settings:** grids collapse (`grid gap-4 sm:grid-cols-2`, `sm:col-span-3`).

---

## Dark / light theme

- **Default:** dark (`class="dark"` on `<html>` in `index.html`).
- **TLD (theme/light/dark):** `useTheme` reads `useUIStore.theme` (`light` | `dark` | `system`) and toggles `document.documentElement.classList('dark')`; `system` listens to `prefers-color-scheme`.
- **Editor font pref:** `sans` | `serif` | `mono` applied as class on `<html>`.
- Theme switcher UI: Settings → Appearance, three `ThemeCard` preview cards (Light/Dark/System split preview).
- All colors are HSL tokens, so both themes come from the same semantic map — new UI should never hard-code raw hex; use tokens.

---

## Animations

- **Base spring/cubic:** default Tailwind ease; `--transition-fast: 120ms cubic-bezier(0.4, 0, 0.2, 1)` token declared (note: not used as a class elsewhere — prefer standard `transition-colors`).
- **Common:** `transition-colors` on buttons, nav rows, cards, toolbars.
- **Width transitions:** sidebar & note list use `transition-[width] duration-200 ease-out`.
- **Overlays (tailwindcss-animate):**
  - Dialogs/alert-dialogs: fade + zoom `95%` + slide from top, `duration-200`.
  - Sheets: slide in/out, close `duration-300`, open `duration-500`.
  - Dropdown/select/popover/context menu: `fade-in`, `zoom-in-95`, directional `slide-in-from-*` `*2` offsets.
  - Command palette: dialog animations.
- **Custom keyframes:** `fade-in` (`opacity 0→1, translateY(4px)→0`, 200ms ease-out), `accordion-down/up` (0.2s ease-out), `shimmer` (skeleton gradient sweep, 1.5s infinite).
- **Loading:** `Loader2` icons `animate-spin`; skeletons `animate-pulse`.

---

## UI consistency rules

Derived from the existing codebase. Follow these when creating new UI:

1. **Use design tokens only** — every color via `hsl(var(--…))` / Tailwind token classes (`bg-background`, `text-muted-foreground`, `border-border`…). Never hard-code raw colors.
2. **Dark is default** — always define both `:root` (light) and `.dark` token sets; verify in both themes.
3. **Typography** — Inter for UI, JetBrains Mono for code. Headings: `font-semibold tracking-tight`. Meta/secondary text: `text-muted-foreground` in `text-xs`–`text-[11px]`. Micro-labels: `text-[10px] uppercase tracking-wider font-semibold text-muted-foreground`.
4. **Dense spacing** — keep controls compact (`h-7`–`h-10`); header 48px, nav rows `px-2 py-1.5`, small gaps (`gap-1`–`gap-1.5`).
5. **Buttons** — use `buttonVariants`; primary CTA emphasis via `bg-gradient-primary text-primary-foreground` (+`shadow-glow` only for hero/brand actions); `ghost` for contextual icon actions; `outline` for secondary tools; `destructive`/`text-destructive` for destructive actions.
6. **Forms** — `Input`/`SelectTrigger` base styling; focus always `ring-2 ring-ring ring-offset-2`; labels `text-sm font-medium`, uppercase-tracking label pattern for settings fields.
7. **Focus visibility** — every interactive element needs `focus-visible:ring-2 ring-ring ring-offset-2`; disabled = `opacity-50` + `pointer-events-none`.
8. **Surfaces** — cards/panels are flat: `bg-card border border-border rounded-lg` (+ optional `shadow-panel`); avoid drop shadows on surfaces.
9. **Radius** — 8px (lg) panels, 6px (md) controls, 4px (sm) menu items, full avatars.
10. **Icons** — `lucide-react`; default stroke; use `-muted-foreground` for idle accents, `-primary` for selected/active; `h-3.5` nav, `h-4` buttons.
11. **Hairline separators** — use `border-border` hairlines (`border-b`, `border-r`, `border-t`) rather than shadows to separate rows/columns.
12. **Transitions** — use `transition-colors` for hover/focus color changes; `transition-[width] duration-200 ease-out` for collapsible panels; overlay animations via `tailwindcss-animate` data-state utilities.
13. **Empty states** — centered, `text-center`, small muted icon tile (rounded bg-muted) + `font-medium` title + `text-xs muted` hint, max-w-sm.
14. **Responsiveness** — below `md` (768px): side panels become sheets or full-width columns; hide secondary labels; keep primary actions reachable.