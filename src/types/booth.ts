import type {
  BoothKeyword,
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "./database";

export interface BoothWithDetails extends BoothRow {
  readonly keywords: readonly BoothKeywordRow[];
  readonly participants: readonly BoothParticipantRow[];
}

/** Client-friendly shape used by BoothCard / BoothListClient */
export interface BoothCardData {
  readonly id: string;
  readonly name: string;
  readonly thumbnailImageKey: string;
  readonly hoverImageKey: string | null;
  readonly ageType: "general" | "adult";
  readonly keywords: readonly BoothKeyword[];
  readonly owner: { readonly name: string; readonly snsUrl: string | null };
  readonly participants: readonly {
    readonly name: string;
    readonly snsUrl: string | null;
  }[];
}

/** Transform DB rows into the client-friendly shape */
export function toBoothCardData(booth: BoothWithDetails): BoothCardData {
  const sorted = [...booth.participants].sort(
    (a, b) => a.role_order - b.role_order,
  );
  const owner = sorted[0];
  const rest = sorted.slice(1);

  return {
    id: booth.id,
    name: booth.name,
    thumbnailImageKey: booth.thumbnail_image_key,
    hoverImageKey: booth.hover_image_key,
    ageType: booth.age_type,
    keywords: booth.keywords.map((k) => k.keyword),
    owner: owner
      ? { name: owner.name, snsUrl: owner.sns_url }
      : { name: "", snsUrl: null },
    participants: rest.map((p) => ({ name: p.name, snsUrl: p.sns_url })),
  };
}
