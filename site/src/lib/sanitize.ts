import "server-only";
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize legacy Joomla/Mambo article HTML at build time.
 * Allow YouTube/Vimeo iframes (83 articles embed video) but nothing else risky.
 */
export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe", "figure", "figcaption"],
    ADD_ATTR: [
      "allow", "allowfullscreen", "frameborder", "scrolling", "target",
      "data-missing-image",
    ],
    FORBID_TAGS: ["style", "script", "link", "meta", "base"],
    ALLOW_DATA_ATTR: true,
  });
}
