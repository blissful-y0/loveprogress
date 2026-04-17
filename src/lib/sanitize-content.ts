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
// 모든 길이값은 비음수만 허용해 오프스크린 overlay를 통한 클릭 하이재킹 방지.
const LEN_UNIT = "(auto|0|[0-9]+(\\.[0-9]+)?(px|em|rem|%))";
const LEN_SHORTHAND = new RegExp(`^${LEN_UNIT}(\\s+${LEN_UNIT}){0,3}$`, "i");
const LEN_SINGLE = new RegExp(`^${LEN_UNIT}$`, "i");

const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "text-align": [/^(left|center|right|justify)$/],
    "font-weight": [/^(bold|normal|[1-9]00)$/],
    "font-style": [/^(italic|normal)$/],
    "text-decoration": [/^(underline|line-through|none)$/],
    display: [/^(block|inline|inline-block|flex|none)$/],
    float: [/^(left|right|none)$/],
    margin: [LEN_SHORTHAND],
    "margin-left": [LEN_SINGLE],
    "margin-right": [LEN_SINGLE],
    "margin-top": [LEN_SINGLE],
    "margin-bottom": [LEN_SINGLE],
    width: [LEN_SINGLE],
    "max-width": [/^(none)$/, LEN_SINGLE],
  },
};

export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
  });
}
