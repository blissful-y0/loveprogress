import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import { HTML_CONTENT_MARKER } from "@/lib/constants";

async function getAboutContent(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_pages")
      .select("content")
      .eq("slug", "about")
      .single<{ content: string }>();
    return data?.content ?? "";
  } catch {
    return "";
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();
  const isHtml = content.startsWith(HTML_CONTENT_MARKER);
  const sanitizedHtml = isHtml
    ? sanitizeHtml(content.slice(HTML_CONTENT_MARKER.length), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img", "figure", "figcaption", "details", "summary",
          "h1", "h2", "h3", "h4", "h5", "h6",
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          "*": ["class", "id"],
          a: ["href", "name", "target", "rel"],
          img: ["src", "alt", "width", "height"],
        },
      })
    : null;

  if (!content) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 text-center text-[#909090] text-sm">
        페이지 준비 중입니다.
      </div>
    );
  }

  if (sanitizedHtml !== null) {
    return (
      <div
        className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10 overflow-x-auto [&_img]:max-w-full [&_table]:w-full [&_a]:text-[#34aa8f] [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-10 text-[#505050] text-sm md:text-base leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
  );
}
