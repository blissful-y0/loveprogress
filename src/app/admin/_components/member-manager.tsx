"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRole } from "@/types/database";

interface UserListItem {
  readonly id: string;
  readonly nickname: string;
  readonly email: string;
  readonly booth_name: string | null;
  readonly role: UserRole;
  readonly created_at: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  member: "일반회원",
  booth_member: "부스회원",
  admin: "관리자",
};

const ROLE_BADGE_VARIANT: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  booth_member: "secondary",
  member: "outline",
};

export default function MemberManager() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>(
    {},
  );
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const fetchUsers = useCallback(async (targetPage: number = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?page=${targetPage}&limit=20`);
      if (!res.ok) throw new Error("회원 목록 로드 실패");
      const json = await res.json();
      setUsers(json.users ?? []);
      setTotal(json.total ?? 0);
      setPage(json.page ?? 1);
      setTotalPages(json.totalPages ?? 1);
    } catch {
      setError("회원 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setPendingRoles({ ...pendingRoles, [userId]: role });
  };

  const handleApplyRole = async (userId: string) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    setSavingIds((prev) => new Set([...prev, userId]));
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/change-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "역할 변경 실패");
      }

      const { [userId]: _, ...rest } = pendingRoles;
      setPendingRoles(rest);
      await fetchUsers(page);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "역할 변경에 실패했습니다.",
      );
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleResetPassword = async (userId: string, nickname: string) => {
    if (
      !confirm(`${nickname}님의 비밀번호를 초기화하시겠습니까?`)
    ) {
      return;
    }

    setSavingIds((prev) => new Set([...prev, userId]));
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "비밀번호 초기화 실패");
      }

      alert("비밀번호가 초기화되었습니다.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "비밀번호 초기화에 실패했습니다.",
      );
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const searchLower = search.toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      u.nickname.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-dark">
          회원 관리
          <Badge variant="secondary" className="ml-2">
            {total}명
          </Badge>
        </h2>
      </div>

      <Input
        placeholder="닉네임 또는 이메일로 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {filteredUsers.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {search ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>닉네임</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>부스명</TableHead>
                <TableHead className="w-36">역할</TableHead>
                <TableHead className="w-28">가입일</TableHead>
                <TableHead className="w-48">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const pendingRole = pendingRoles[user.id];
                const isSaving = savingIds.has(user.id);
                const currentDisplayRole = pendingRole ?? user.role;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nickname}
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm text-text-sub">
                      {user.booth_name || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={currentDisplayRole}
                          onValueChange={(v) =>
                            handleRoleChange(user.id, v as UserRole)
                          }
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">일반회원</SelectItem>
                            <SelectItem value="booth_member">
                              부스회원
                            </SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                        {!pendingRole && (
                          <Badge variant={ROLE_BADGE_VARIANT[user.role]}>
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-text-muted">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {pendingRole && pendingRole !== user.role && (
                          <Button
                            size="sm"
                            onClick={() => handleApplyRole(user.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? "저장 중..." : "적용하기"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleResetPassword(user.id, user.nickname)
                          }
                          disabled={isSaving}
                        >
                          비밀번호 초기화
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => fetchUsers(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchUsers(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
