export const BOOTH_KEYWORD_COLORS: Record<string, string> = {
  "그림회지": "text-[#3b82f6] bg-[#eff6ff] ring-[#bfdbfe]",
  "글회지":   "text-[#a855f7] bg-[#faf5ff] ring-[#e9d5ff]",
  "팬시굿즈": "text-[#f59e0b] bg-[#fffbeb] ring-[#fde68a]",
  "수공예품":  "text-[#ec4899] bg-[#fdf2f8] ring-[#fbcfe8]",
  "무료나눔":  "text-[#06b6d4] bg-[#ecfeff] ring-[#a5f3fc]",
};

export const BOOTH_KEYWORD_PILL_COLORS: Record<string, { active: string; inactive: string }> = {
  "그림회지": { active: "bg-[#3b82f6] text-white shadow-sm", inactive: "text-[#3b82f6] ring-[#bfdbfe] bg-[#eff6ff] hover:ring-[#93c5fd]" },
  "글회지":   { active: "bg-[#a855f7] text-white shadow-sm", inactive: "text-[#a855f7] ring-[#e9d5ff] bg-[#faf5ff] hover:ring-[#d8b4fe]" },
  "팬시굿즈": { active: "bg-[#f59e0b] text-white shadow-sm", inactive: "text-[#d97706] ring-[#fde68a] bg-[#fffbeb] hover:ring-[#fcd34d]" },
  "수공예품":  { active: "bg-[#ec4899] text-white shadow-sm", inactive: "text-[#ec4899] ring-[#fbcfe8] bg-[#fdf2f8] hover:ring-[#f9a8d4]" },
  "무료나눔":  { active: "bg-[#06b6d4] text-white shadow-sm", inactive: "text-[#06b6d4] ring-[#a5f3fc] bg-[#ecfeff] hover:ring-[#67e8f9]" },
};
