import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "figure",
  "figcaption",
  "details",
  "summary",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
]);

const ALLOWED_ATTRIBUTES = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class", "style", "id"],
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

// 이미지 정렬(margin:auto, float, display:block) 및 텍스트 정렬/강조 스타일 허용.
const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "text-align": [/^(left|center|right|justify)$/],
    "font-weight": [/^(bold|normal|[1-9]00)$/],
    "font-style": [/^(italic|normal)$/],
    "text-decoration": [/^(underline|line-through|none)$/],
    display: [/^(block|inline|inline-block|flex|none)$/],
    float: [/^(left|right|none)$/],
    margin: [/^[\d\sa-z.%-]+$/i],
    "margin-left": [/^(auto|0|[\d.]+(px|em|rem|%))$/i],
    "margin-right": [/^(auto|0|[\d.]+(px|em|rem|%))$/i],
    "margin-top": [/^(auto|0|[\d.]+(px|em|rem|%))$/i],
    "margin-bottom": [/^(auto|0|[\d.]+(px|em|rem|%))$/i],
    width: [/^(auto|[\d.]+(px|em|rem|%))$/i],
    "max-width": [/^(none|[\d.]+(px|em|rem|%))$/i],
  },
};

export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
  });
}
