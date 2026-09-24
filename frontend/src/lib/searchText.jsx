import { htmlToText } from "./sanitize";

export const RECENT_KEY = "noteflow_recent_searches";
export const MAX_RECENTS = 8;
const SNIPPET_LENGTH = 200;
const SNIPPET_CONTEXT = 60;
const SNIPPET_TRAILING = 140;

export function highlight({ text, q }) {
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

export function snippet({ html, q }) {
  const text = htmlToText(html);
  if (!q) return text.slice(0, SNIPPET_LENGTH);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, SNIPPET_LENGTH);
  const start = Math.max(0, i - SNIPPET_CONTEXT);
  return (
    (start > 0 ? "… " : "") +
    text.slice(start, i + q.length + SNIPPET_TRAILING) +
    "…"
  );
}

export function loadRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecentSearch(term, recents) {
  const next = [term, ...recents.filter((x) => x !== term)].slice(
    0,
    MAX_RECENTS,
  );
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function removeRecentSearch(term, recents) {
  const next = recents.filter((x) => x !== term);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}