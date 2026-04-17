// 부스 키워드/연령 색상 팔레트 (기획서 3차 피드백 기준)

export const BOOTH_AGE_COLORS = {
  general: "#105ec8",
  adult: "#f20e34",
} as const;

const BOOTH_KEYWORD_HEX: Record<string, string> = {
  "그림회지": "#f7c234",
  "글회지":   "#17ca89",
  "팬시굿즈": "#f966ce",
  "수공예품": "#9152ef",
  "무료나눔": "#909090",
};

export function getBoothKeywordColor(keyword: string): string {
  return BOOTH_KEYWORD_HEX[keyword] ?? "#505050";
}

// 카드 하단 정보 바에 쓰이는 텍스트 색상 (콤팩트 표기용)
export const BOOTH_KEYWORD_COLORS: Record<string, string> = {
  "그림회지": "text-[#f7c234]",
  "글회지":   "text-[#17ca89]",
  "팬시굿즈": "text-[#f966ce]",
  "수공예품":  "text-[#9152ef]",
  "무료나눔":  "text-[#909090]",
};

// 상단 필터 pill 활성/비활성 색상 (키워드 + 연령 필터 모두 포함)
export const BOOTH_KEYWORD_PILL_COLORS: Record<string, { active: string; inactive: string }> = {
  "그림회지": { active: "bg-[#f7c234] text-white ring-[#f7c234]", inactive: "text-[#f7c234] ring-[#f7c234]/40 bg-white hover:ring-[#f7c234]" },
  "글회지":   { active: "bg-[#17ca89] text-white ring-[#17ca89]", inactive: "text-[#17ca89] ring-[#17ca89]/40 bg-white hover:ring-[#17ca89]" },
  "팬시굿즈": { active: "bg-[#f966ce] text-white ring-[#f966ce]", inactive: "text-[#f966ce] ring-[#f966ce]/40 bg-white hover:ring-[#f966ce]" },
  "수공예품":  { active: "bg-[#9152ef] text-white ring-[#9152ef]", inactive: "text-[#9152ef] ring-[#9152ef]/40 bg-white hover:ring-[#9152ef]" },
  "무료나눔":  { active: "bg-[#909090] text-white ring-[#909090]", inactive: "text-[#909090] ring-[#909090]/40 bg-white hover:ring-[#909090]" },
  "general":  { active: "bg-[#105ec8] text-white ring-[#105ec8]", inactive: "text-[#105ec8] ring-[#105ec8]/40 bg-white hover:ring-[#105ec8]" },
  "adult":    { active: "bg-[#f20e34] text-white ring-[#f20e34]", inactive: "text-[#f20e34] ring-[#f20e34]/40 bg-white hover:ring-[#f20e34]" },
};
