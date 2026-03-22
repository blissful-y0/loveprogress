"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/hooks/useUser";

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [user, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-muted">권한을 확인하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8">
      {children}
    </div>
  );
}
