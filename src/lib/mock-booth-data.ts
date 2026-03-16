export type BoothAgeType = "general" | "adult";
export type BoothKeyword =
  | "그림회지"
  | "글회지"
  | "팬시굿즈"
  | "수공예품"
  | "무료나눔";

export interface BoothParticipant {
  readonly name: string;
  readonly snsUrl?: string;
}

export interface Booth {
  readonly id: string;
  readonly name: string;
  readonly thumbnailImageKey: string;
  readonly hoverImageKey?: string;
  readonly ageType: BoothAgeType;
  readonly keywords: readonly BoothKeyword[];
  readonly owner: BoothParticipant;
  readonly participants: readonly BoothParticipant[];
}

export const AGE_FILTERS = [
  { label: "#전체보기", value: "all" },
  { label: "#일반", value: "general" },
  { label: "#성인", value: "adult" },
] as const;

export const KEYWORD_FILTERS: readonly BoothKeyword[] = [
  "그림회지",
  "글회지",
  "팬시굿즈",
  "수공예품",
  "무료나눔",
] as const;

export const MOCK_BOOTHS: readonly Booth[] = [
  {
    id: "1",
    name: "파이낙사 온리전 주최부스",
    thumbnailImageKey: "/img/booth/booth-placeholder-1.svg",
    hoverImageKey: "/img/booth/booth-placeholder-1-hover.svg",
    ageType: "general",
    keywords: ["그림회지"],
    owner: { name: "교무부장", snsUrl: "https://x.com/phainaxa_event" },
    participants: [],
  },
  {
    id: "2",
    name: "달빛 아뜰리에",
    thumbnailImageKey: "/img/booth/booth-placeholder-2.svg",
    ageType: "general",
    keywords: ["그림회지", "팬시굿즈"],
    owner: { name: "달빛화가" },
    participants: [
      { name: "별빛조수", snsUrl: "https://x.com/example_star" },
      { name: "구름도우미" },
    ],
  },
  {
    id: "3",
    name: "심야문고",
    thumbnailImageKey: "/img/booth/booth-placeholder-3.svg",
    hoverImageKey: "/img/booth/booth-placeholder-3-hover.svg",
    ageType: "adult",
    keywords: ["글회지"],
    owner: { name: "야행성작가", snsUrl: "https://x.com/example_night" },
    participants: [
      { name: "편집장A" },
    ],
  },
  {
    id: "4",
    name: "반짝반짝 공방",
    thumbnailImageKey: "/img/booth/booth-placeholder-4.svg",
    ageType: "general",
    keywords: ["수공예품", "팬시굿즈"],
    owner: { name: "공예달인" },
    participants: [
      { name: "비즈장인", snsUrl: "https://x.com/example_beads" },
      { name: "실크공예" },
      { name: "레진아트", snsUrl: "https://x.com/example_resin" },
    ],
  },
  {
    id: "5",
    name: "나눔의 숲",
    thumbnailImageKey: "/img/booth/booth-placeholder-5.svg",
    ageType: "general",
    keywords: ["무료나눔", "그림회지"],
    owner: { name: "숲지기", snsUrl: "https://x.com/example_forest" },
    participants: [],
  },
  {
    id: "6",
    name: "밤하늘 갤러리",
    thumbnailImageKey: "/img/booth/booth-placeholder-6.svg",
    hoverImageKey: "/img/booth/booth-placeholder-6-hover.svg",
    ageType: "adult",
    keywords: ["그림회지", "글회지", "팬시굿즈"],
    owner: { name: "갤러리장" },
    participants: [
      { name: "큐레이터", snsUrl: "https://x.com/example_curator" },
      { name: "일러작가" },
    ],
  },
] as const;
