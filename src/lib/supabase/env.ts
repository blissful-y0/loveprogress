const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !anonKey) {
  if (typeof window !== "undefined" || process.env.NODE_ENV !== "production") {
    throw new Error("Missing Supabase env vars");
  }
}

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;
