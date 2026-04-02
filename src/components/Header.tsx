"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  PenLineIcon,
  LogOutIcon,
  UserXIcon,
} from "lucide-react";

import { useUser } from "@/hooks/useUser";
import LoginModal from "@/components/auth/login-modal";
import NicknameChangeModal from "@/components/auth/nickname-change-modal";
import WithdrawModal from "@/components/auth/withdraw-modal";

interface NavItem {
  readonly label: string;
  readonly href: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "대학소개", href: "/about" },
  { label: "입학·교육", href: "/info/notices" },
  { label: "학사안내", href: "/info/events" },
  { label: "대학생활", href: "/booths" },
  { label: "나무광장", href: "/qna" },
  { label: "우애의관", href: "/booth-board" },
] as const;

interface MenuItem {
  readonly label: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly icon?: React.ReactNode;
  readonly variant?: "default" | "danger";
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, signOut, refetch } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const desktopLoginRef = useRef<HTMLDivElement>(null);
  const mobileLoginRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // 소셜 로그인 최초 가입 시 닉네임 설정 모달 자동 오픈
  useEffect(() => {
    if (user && searchParams.get("nickname_setup") === "1") {
      setIsNicknameModalOpen(true);
      // URL에서 쿼리 파라미터 제거
      const url = new URL(window.location.href);
      url.searchParams.delete("nickname_setup");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [user, searchParams, router]);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const handleSignOut = useCallback(async () => {
    closeLogin();
    await signOut();
    window.location.href = "/";
  }, [signOut, closeLogin]);

  const handleOpenNicknameModal = useCallback(() => {
    closeLogin();
    setIsNicknameModalOpen(true);
  }, [closeLogin]);

  const handleOpenWithdrawModal = useCallback(() => {
    closeLogin();
    setIsWithdrawModalOpen(true);
  }, [closeLogin]);

  const userMenuItems: readonly MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    if (user?.role === "admin") {
      items.push({ label: "관리자", href: "/admin", icon: <ShieldCheckIcon className="size-3.5" /> });
    }
    items.push({ label: "닉네임 변경", onClick: handleOpenNicknameModal, icon: <PenLineIcon className="size-3.5" /> });
    items.push({ label: "회원 탈퇴", onClick: handleOpenWithdrawModal, icon: <UserXIcon className="size-3.5" />, variant: "danger" });
    items.push({ label: "로그아웃", onClick: handleSignOut, icon: <LogOutIcon className="size-3.5" /> });
    return items;
  }, [user?.role, handleSignOut, handleOpenNicknameModal, handleOpenWithdrawModal]);

  const menuItems = user ? userMenuItems : [];

  useEffect(() => {
    if (!isLoginOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inDesktop = desktopLoginRef.current?.contains(target) ?? false;
      const inMobile = mobileLoginRef.current?.contains(target) ?? false;
      if (!inDesktop && !inMobile) {
        closeLogin();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLoginOpen, closeLogin]);

  useEffect(() => {
    closeLogin();
  }, [pathname, closeLogin]);

  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeLink = mobileNavRef.current.querySelector<HTMLElement>("[data-active]");
    activeLink?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [pathname]);

  const renderDropdownItem = (item: MenuItem, i: number, compact?: boolean) => {
    const isDanger = item.variant === "danger";
    const baseClass = compact
      ? `flex w-full items-center gap-2 px-3.5 py-2.5 text-[13px] transition-colors cursor-pointer ${
          i > 0 ? "border-t border-gray-100" : ""
        }`
      : `flex w-full items-center gap-2.5 px-4 py-3 text-[14px] transition-colors cursor-pointer ${
          i > 0 ? "border-t border-gray-50" : ""
        }`;
    const colorClass = isDanger
      ? "text-red-400 hover:text-red-500 hover:bg-red-50/60"
      : "text-[#606060] hover:text-[#333] hover:bg-[#f5fbf8]";

    const content = (
      <>
        <span className={isDanger ? "text-red-300" : "text-[#aaa]"}>{item.icon}</span>
        <span className="font-medium">{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <Link key={item.label} href={item.href} className={`${baseClass} ${colorClass}`}>
          {content}
        </Link>
      );
    }
    return (
      <button key={item.label} type="button" onClick={item.onClick} className={`${baseClass} ${colorClass}`}>
        {content}
      </button>
    );
  };

  const renderDesktopDropdown = () => {
    if (!isLoginOpen || !user) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-[180px] rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/8 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-50">
        {/* User info header */}
        <div className="px-4 py-3 bg-[#f7fbf9] border-b border-[#e0f0ea]">
          <p className="text-[13px] font-semibold text-[#333] truncate">{user.nickname}</p>
          <p className="text-[11px] text-[#999] mt-0.5 truncate">{user.authUser.email ?? ""}</p>
        </div>
        {/* Menu items */}
        <div className="py-1">
          {menuItems.map((item, i) => renderDropdownItem(item, i))}
        </div>
      </div>
    );
  };

  const renderMobileDropdown = () => {
    if (!isLoginOpen || !user) return null;

    return (
      <div className="absolute right-0 top-full mt-1.5 w-[170px] rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/8 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 z-50">
        {/* User info header */}
        <div className="px-3.5 py-2.5 bg-[#f7fbf9] border-b border-[#e0f0ea]">
          <p className="text-[12px] font-semibold text-[#333] truncate">{user.nickname}</p>
          <p className="text-[10px] text-[#999] mt-0.5 truncate">{user.authUser.email ?? ""}</p>
        </div>
        {/* Menu items */}
        <div className="py-0.5">
          {menuItems.map((item, i) => renderDropdownItem(item, i, true))}
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border-light">
      {/* Desktop Header */}
      <div className="hidden lg:flex mx-auto max-w-[1280px] items-center justify-between h-20 px-8">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80 mt-1">
          <img
            src="/img/main/logo.png"
            alt="파이낙사 온리전"
            width={160}
            height={36}
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-[15px]">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-4 pb-[15px] pt-5 text-[15px] font-bold transition-colors hover:text-text-dark ${
                  active ? "text-text-dark" : "text-text-muted"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-text-dark rounded-full transition-all duration-200 ${
                    active ? "w-5/6 opacity-100" : "w-0 opacity-0 group-hover:w-5/6 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="relative w-9" ref={desktopLoginRef}>
          {!loading && (
            <button
              type="button"
              onClick={() => user ? setIsLoginOpen((prev) => !prev) : setIsLoginModalOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label={user ? "사용자 메뉴" : "로그인"}
            >
              <img
                src="/img/main/login.png"
                alt={user ? "사용자 메뉴" : "로그인"}
                width={20}
                height={20}
                className="opacity-70"
              />
            </button>
          )}

          {user && renderDesktopDropdown()}
        </div>
      </div>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden">
        {/* Top row: Logo + Login */}
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            <img
              src="/img/main/logo.png"
              alt="파이낙사 온리전"
              width={140}
              height={32}
              className="h-7 w-auto"
            />
          </Link>

          <div className="relative w-9" ref={mobileLoginRef}>
            {!loading && (
              <button
                type="button"
                onClick={() => user ? setIsLoginOpen((prev) => !prev) : setIsLoginModalOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label={user ? "사용자 메뉴" : "로그인"}
              >
                <img
                  src="/img/main/login.png"
                  alt={user ? "사용자 메뉴" : "로그인"}
                  width={20}
                  height={20}
                  className="opacity-70"
                />
              </button>
            )}

            {user && renderMobileDropdown()}
          </div>
        </div>

        {/* Bottom row: Scrollable nav */}
        <nav ref={mobileNavRef} className="flex overflow-x-auto scrollbar-hide border-t border-gray-100">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? "" : undefined}
                className={`relative shrink-0 px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
                  active ? "text-text-dark" : "text-text-muted"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-text-dark rounded-full transition-all duration-200 ${
                    active ? "w-4/5 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      {user && (
        <>
          <NicknameChangeModal
            open={isNicknameModalOpen}
            onOpenChange={setIsNicknameModalOpen}
            currentNickname={user.nickname}
            onNicknameChanged={refetch}
          />
          <WithdrawModal
            open={isWithdrawModalOpen}
            onOpenChange={setIsWithdrawModalOpen}
          />
        </>
      )}
    </header>
  );
}
