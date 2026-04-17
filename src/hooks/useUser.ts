"use client";

import { useCallback, useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

interface UserProfile {
  authUser: User;
  nickname: string;
  role: UserRole;
  boothName: string | null;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("nickname, role, booth_name")
      .eq("id", authUser.id)
      .single<{ nickname: string; role: string; booth_name: string | null }>();

    if (profile) {
      setUser({
        authUser,
        nickname: profile.nickname,
        role: profile.role as UserRole,
        boothName: profile.booth_name,
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signOut, refetch: fetchUser };
}
