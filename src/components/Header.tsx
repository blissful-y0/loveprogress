"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useUser } from "@/hooks/useUser";

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
}

const GUEST_MENU_ITEMS: readonly MenuItem[] = [
  { label: "회원가입", href: "/auth/register" },
  { label: "로그인", href: "/auth/login" },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);

  const handleSignOut = useCallback(async () => {
    closeLogin();
    await signOut();
    window.location.href = "/";
  }, [signOut, closeLogin]);

  const userMenuItems: readonly MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    if (user?.role === "admin") {
      items.push({ label: "관리자", href: "/admin" });
    }
    items.push({ label: "로그아웃", onClick: handleSignOut });
    return items;
  }, [user?.role, handleSignOut]);

  const menuItems = user ? userMenuItems : GUEST_MENU_ITEMS;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        closeLogin();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeLogin]);

  useEffect(() => {
    closeLogin();
  }, [pathname, closeLogin]);

  const menuHeight = menuItems.length * 45;

  const renderDesktopDropdown = () => {
    if (!isLoginOpen) return null;

    return (
      <div
        className="absolute right-0 top-full mt-1.5 w-[100px] rounded-lg border border-text-light bg-white shadow-lg shadow-black/5 overflow-hidden"
        style={{ height: `${menuHeight}px` }}
      >
        {menuItems.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center h-[45px] text-[16px] font-medium text-text-light hover:bg-bg-light transition-colors"
            >
              <span className="rounded-[5px] px-2 py-1 hover:bg-bg-light">
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex w-full items-center justify-center h-[45px] text-[16px] font-medium text-text-light hover:bg-bg-light transition-colors cursor-pointer"
            >
              <span className="rounded-[5px] px-2 py-1 hover:bg-bg-light">
                {item.label}
              </span>
            </button>
          ),
        )}
      </div>
    );
  };

  const renderMobileDropdown = () => {
    if (!isLoginOpen) return null;

    return (
      <div className="absolute right-0 top-full mt-1.5 w-[120px] rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/5 overflow-hidden z-50">
        {menuItems.map((item, i) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`block px-4 py-2.5 text-[13px] text-text-sub hover:bg-gray-50 transition-colors ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`block w-full px-4 py-2.5 text-left text-[13px] text-text-sub hover:bg-gray-50 transition-colors cursor-pointer ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {item.label}
            </button>
          ),
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border-light">
      {/* Desktop Header */}
      <div className="hidden lg:flex mx-auto max-w-[1280px] items-center justify-between h-20 px-8">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <img
            src="/img/main/logo.png"
            alt="깨달음의 나무 정원"
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
                className={`relative px-4 pb-[15px] pt-5 text-[15px] font-bold transition-colors hover:text-text-dark ${
                  active ? "text-text-dark" : "text-text-muted"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-text-dark rounded-full transition-all duration-200 ${
                    active ? "w-5/6 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="relative" ref={loginRef}>
          {!loading && (
            <button
              type="button"
              onClick={() => setIsLoginOpen((prev) => !prev)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label={user ? "사용자 메뉴" : "로그인 메뉴"}
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

          {renderDesktopDropdown()}
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
              alt="깨달음의 나무 정원"
              width={140}
              height={32}
              className="h-7 w-auto"
            />
          </Link>

          <div className="relative" ref={loginRef}>
            {!loading && (
              <button
                type="button"
                onClick={() => setIsLoginOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label={user ? "사용자 메뉴" : "로그인 메뉴"}
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

            {renderMobileDropdown()}
          </div>
        </div>

        {/* Bottom row: Scrollable nav */}
        <nav className="flex overflow-x-auto scrollbar-hide border-t border-gray-100">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
    </header>
  );
}
