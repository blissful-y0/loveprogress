"use client";

import { useEffect, useMemo, useState } from "react";

/** 부스 담당 계정 후보 (부스어·관리자) */
export interface BoothAccountOption {
  id: string;
  nickname: string;
  booth_name: string | null;
  role: string;
}

export const NO_ACCOUNT = "none";

const normalize = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** 부스명과 booth_name이 비슷하거나 닉네임이 대표자와 같은 계정을 위로 */
function accountScore(account: BoothAccountOption, boothName: string, ownerName: string): number {
  const booth = normalize(boothName);
  const accountBooth = normalize(account.booth_name);
  let score = 0;
  if (booth && accountBooth) {
    if (booth === accountBooth) score += 3;
    else if (booth.includes(accountBooth) || accountBooth.includes(booth)) score += 2;
  }
  if (ownerName.trim() && account.nickname === ownerName.trim()) score += 2;
  return score;
}

export function sortAccountsFor(
  accounts: readonly BoothAccountOption[],
  boothName: string,
  ownerName: string,
): BoothAccountOption[] {
  return [...accounts].sort(
    (a, b) =>
      accountScore(b, boothName, ownerName) - accountScore(a, boothName, ownerName) ||
      a.nickname.localeCompare(b.nickname, "ko"),
  );
}

/** 관리자용: 담당 계정 후보 목록. enabled가 false면 요청하지 않음 */
export function useBoothAccounts(enabled: boolean) {
  const [accounts, setAccounts] = useState<BoothAccountOption[]>([]);

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/admin/users?role=booth_member,admin&limit=100")
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data: { users?: BoothAccountOption[] }) => setAccounts(data.users ?? []))
      .catch(() => setAccounts([]));
  }, [enabled]);

  const nicknameById = useMemo(() => new Map(accounts.map((a) => [a.id, a.nickname])), [accounts]);

  return { accounts, nicknameById };
}
