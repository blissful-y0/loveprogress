import Image from "@tiptap/extension-image";

// 정렬별 스타일: block + margin auto로 좌/중/우 정렬.
// Tiptap의 Image는 block node라 text-align이 작동하지 않으므로 margin 기반으로 정렬한다.
const ALIGN_STYLE: Record<string, string> = {
  left: "display:block",
  center: "display:block;margin-left:auto;margin-right:auto",
  right: "display:block;margin-left:auto",
};

type ImageAttrs = {
  href?: string | null;
  align?: "left" | "center" | "right" | null;
  style?: string | null;
  [key: string]: unknown;
};

function parseAlign(styleAttr: string | null): "left" | "center" | "right" {
  if (!styleAttr) return "left";
  const hasML = /margin-left:\s*auto/i.test(styleAttr);
  const hasMR = /margin-right:\s*auto/i.test(styleAttr);
  const marginShorthandAuto = /margin:\s*\S+\s+auto/i.test(styleAttr);
  if ((hasML && hasMR) || marginShorthandAuto) return "center";
  if (hasML && !hasMR) return "right";
  return "left";
}

export const LinkedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
        parseHTML: (element) => {
          const parent = (element as HTMLElement).parentElement;
          if (!parent || parent.tagName !== "A") return null;
          return parent.getAttribute("href");
        },
        // 렌더링은 renderHTML에서 anchor wrapper로 처리하므로 속성으로는 내보내지 않는다.
        renderHTML: () => ({}),
      },
      align: {
        default: "left",
        parseHTML: (element) => parseAlign((element as HTMLElement).getAttribute("style")),
        renderHTML: (attrs) => {
          const align = (attrs.align as string) ?? "left";
          return { style: ALIGN_STYLE[align] ?? ALIGN_STYLE.left };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = { ...(HTMLAttributes as ImageAttrs) };
    const href = typeof attrs.href === "string" ? attrs.href : null;
    delete attrs.href;
    const imgSpec = ["img", attrs] as const;
    if (href) {
      return [
        "a",
        { href, target: "_blank", rel: "noopener noreferrer" },
        imgSpec,
      ];
    }
    return imgSpec as unknown as [string, Record<string, unknown>];
  },
});
