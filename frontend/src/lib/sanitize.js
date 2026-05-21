import DOMPurify from "dompurify";

/** Sanitize Tiptap-produced HTML before saving. */
export const sanitizeHtml = (html) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "data-type", "data-checked"],
  });

/** Strip HTML to plain text for word counting / previews. */
export const htmlToText = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || "").replace(/\s+/g, " ").trim();
};

export const wordCount = (html) => {
  const text = htmlToText(html);
  if (!text) return 0;
  return text.split(/\s+/).length;
};

export const readingTime = (words) => {
  const min = Math.max(1, Math.round(words / 220));
  return `${min} min read`;
};
