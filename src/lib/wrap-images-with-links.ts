/**
 * 게시물 HTML에서 <img> 태그를 원본 이미지 링크(<a>)로 감싸는 유틸리티.
 * 이미 <a> 안에 있는 이미지는 건너뛴다.
 *
 * 주의: 반드시 sanitize-html 처리된 HTML에만 사용할 것.
 * sanitize-html이 속성값을 인코딩하고 위험한 scheme을 제거하는 것에 의존하되,
 * 방어적으로 http/https/상대경로만 허용한다.
 */

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function wrapImagesWithLinks(html: string): string {
  return html.replace(
    /(<a\s[^>]*>[\s\S]*?<\/a>)|(<img\s[^>]*?>)/gi,
    (match, anchorBlock: string | undefined) => {
      if (anchorBlock) return match;

      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (!srcMatch) return match;

      const src = srcMatch[1];

      if (!/^https?:\/\//i.test(src) && !src.startsWith("/")) {
        return match;
      }

      return `<a href="${escapeHtmlAttr(src)}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    },
  );
}
