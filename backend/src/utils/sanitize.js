import sanitize from "sanitize-html";

export const cleanHtml = (html = "") => {
  sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "u",
      "s",
      "input",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class", "data-type", "data-checked"],
      input: ["type", "checked", "disabled"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });
};

export const htmlToText = (html = "") =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const wordCount = (html = "") => {
  const t = htmlToText(html);
  return t ? t.split(/\s+/).length : 0;
};
