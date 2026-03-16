import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { supabaseAnonKey, supabaseUrl } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>,
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll is called from a Server Component where cookies
          // cannot be set. This can be safely ignored when the
          // middleware is in place to refresh the session.
        }
      },
    },
  });
}
