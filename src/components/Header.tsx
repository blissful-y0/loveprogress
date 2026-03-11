"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface NavItem {
  readonly label: string;
  readonly href: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "대학소개", href: "/" },
  { label: "입학·교육", href: "/info/notices" },
  { label: "학사안내", href: "/info/events" },
  { label: "대학생활", href: "/booths" },
  { label: "나무광장", href: "/qna" },
  { label: "우애의관", href: "/booth-board" },
] as const;

interface LoginMenuItem {
  readonly label: string;
  readonly href: string;
}

const LOGIN_MENU_ITEMS: readonly LoginMenuItem[] = [
  { label: "회원가입", href: "/auth/register" },
  { label: "로그인", href: "/auth/login" },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

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
    closeDrawer();
    closeLogin();
  }, [pathname, closeDrawer, closeLogin]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border-light">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <img
            src="/img/main/logo.png"
            alt="깨달음의 나무 정원"
            width={160}
            height={36}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-5 text-[14px] font-medium transition-colors hover:text-text-dark ${
                  active ? "text-text-dark" : "text-text-muted"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] bg-text-dark rounded-full transition-all duration-200 ${
                    active ? "w-5/6 opacity-100" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Login Icon */}
        <div className="hidden md:block relative" ref={loginRef}>
          <button
            type="button"
            onClick={() => setIsLoginOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="로그인 메뉴"
          >
            <img
              src="/img/main/login.png"
              alt="로그인"
              width={20}
              height={20}
              className="opacity-70"
            />
          </button>

          {isLoginOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-[120px] rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {LOGIN_MENU_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-[13px] text-text-sub hover:bg-gray-50 transition-colors ${
                    i > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={closeDrawer}
        >
          <div
            className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
              <span className="text-[15px] font-semibold text-text-dark">
                메뉴
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="메뉴 닫기"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="px-3 py-2">
              {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3.5 text-[15px] font-medium rounded-lg transition-colors ${
                      active
                        ? "text-text-dark bg-gray-50"
                        : "text-text-muted hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Login */}
            <div className="mx-6 mt-2 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-medium text-text-lighter uppercase tracking-wider mb-2 px-1">
                계정
              </p>
              {LOGIN_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2.5 text-[14px] text-text-sub rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
