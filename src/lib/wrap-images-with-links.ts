/**
 * 게시물 HTML에서 <img> 태그를 원본 이미지 링크(<a>)로 감싸는 유틸리티.
 * 이미 <a> 안에 있는 이미지는 건너뛴다.
 */
export function wrapImagesWithLinks(html: string): string {
  return html.replace(
    /(<a\s[^>]*>[\s\S]*?<\/a>)|(<img\s[^>]*?>)/gi,
    (match, anchorBlock: string | undefined) => {
      if (anchorBlock) return match;

      const srcMatch = match.match(/src=["']([^"']+)["']/);
      if (!srcMatch) return match;

      return `<a href="${srcMatch[1]}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    },
  );
}
