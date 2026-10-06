"use client";

import { useCallback, useEffect, useState } from "react";

/** 로그인 사용자의 부스 즐겨찾기(booth_likes). /booths와 /booth-promo가 같이 사용 */
export function useBoothLikes() {
  const [userLikes, setUserLikes] = useState<ReadonlySet<string>>(new Set());

  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch("/api/booths/likes");
      if (!res.ok) return;
      const data = await res.json();
      setUserLikes(new Set(data.userLikes ?? []));
    } catch {
      // Silently fail - likes are not critical
    }
  }, []);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = useCallback(async (boothId: string) => {
    try {
      const res = await fetch("/api/booths/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boothId }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          alert("로그인 후 이용 가능합니다.");
        } else {
          alert(data.error ?? "좋아요 처리에 실패했습니다.");
        }
        return;
      }
      const data = await res.json();
      setUserLikes((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(boothId);
        else next.delete(boothId);
        return next;
      });
    } catch {
      alert("좋아요 처리에 실패했습니다.");
    }
  }, []);

  return { userLikes, toggleLike };
}
