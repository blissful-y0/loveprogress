import type { BoothWithDetails } from "@/types/booth";
import type {
  BoothAgeType,
  BoothKeywordRow,
  BoothParticipantRow,
  BoothRow,
} from "@/types/database";

/** Accepts any Supabase client variant (SSR or service-role) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = { from: (table: string) => any };

/** Columns to select from booths table (excludes password_last4) */
const BOOTH_PUBLIC_COLUMNS =
  "id, name, thumbnail_image_key, hover_image_key, age_type, created_at, updated_at";

/** Admin-only columns: public columns + password_last4 */
const BOOTH_ADMIN_COLUMNS = `${BOOTH_PUBLIC_COLUMNS}, password_last4`;

interface FetchBoothsOptions {
  readonly ageType?: BoothAgeType;
  readonly ascending?: boolean;
  /** Include password_last4 in results. Admin use only. */
  readonly includePasswordLast4?: boolean;
}

/**
 * Fetch booths with keywords and participants.
 * Pass includePasswordLast4: true for admin routes that need the full row.
 * Accepts any Supabase client (session-scoped or service-role).
 */
export async function fetchBoothsWithDetails(
  supabase: AnySupabaseClient,
  options?: FetchBoothsOptions,
): Promise<{ data: BoothWithDetails[] | null; error: string | null }> {
  const ascending = options?.ascending ?? false;
  const columns = options?.includePasswordLast4 ? BOOTH_ADMIN_COLUMNS : BOOTH_PUBLIC_COLUMNS;

  let boothQuery = supabase
    .from("booths")
    .select(columns)
    .order("created_at", { ascending });

  if (options?.ageType) {
    boothQuery = boothQuery.eq("age_type", options.ageType);
  }

  const { data: booths, error: boothError } = (await boothQuery) as {
    data: BoothRow[] | null;
    error: unknown;
  };

  if (boothError) {
    return { data: null, error: "부스 목록을 불러올 수 없습니다." };
  }

  if (!booths || booths.length === 0) {
    return { data: [], error: null };
  }

  const boothIds = booths.map((b) => b.id);

  // Fetch keywords and participants in parallel
  const [keywordsResult, participantsResult] = (await Promise.all([
    supabase
      .from("booth_keywords")
      .select("*")
      .in("booth_id", boothIds),
    supabase
      .from("booth_participants")
      .select("*")
      .in("booth_id", boothIds)
      .order("role_order", { ascending: true }),
  ])) as [
    { data: BoothKeywordRow[] | null; error: unknown },
    { data: BoothParticipantRow[] | null; error: unknown },
  ];

  if (keywordsResult.error || participantsResult.error) {
    return { data: null, error: "부스 상세 정보를 불러올 수 없습니다." };
  }

  const keywordsByBooth = new Map<string, BoothKeywordRow[]>();
  for (const kw of keywordsResult.data ?? []) {
    const list = keywordsByBooth.get(kw.booth_id) ?? [];
    list.push(kw);
    keywordsByBooth.set(kw.booth_id, list);
  }

  const participantsByBooth = new Map<string, BoothParticipantRow[]>();
  for (const p of participantsResult.data ?? []) {
    const list = participantsByBooth.get(p.booth_id) ?? [];
    list.push(p);
    participantsByBooth.set(p.booth_id, list);
  }

  const result: BoothWithDetails[] = booths.map((booth) => ({
    ...booth,
    keywords: keywordsByBooth.get(booth.id) ?? [],
    participants: participantsByBooth.get(booth.id) ?? [],
  }));

  return { data: result, error: null };
}
