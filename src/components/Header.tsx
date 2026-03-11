"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface NavItem {
  readonly label: string;
  readonly href: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "대학소개", href: "/about/event" },
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
  { label: "회원가입", href: "/signup" },
  { label: "로그인", href: "/login" },
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
  const drawerRef = useRef<HTMLDivElement>(null);

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
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border-light">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between h-[60px] px-6 lg:px-0">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/img/main/logo.png"
            alt="깨달음의 나무 정원"
            width={160}
            height={36}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-[18px] pt-[18px] text-[15px] font-medium transition-colors hover:text-text-dark ${
                  active ? "text-text-dark" : "text-text-muted"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-text-dark" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Login Icon */}
        <div className="hidden md:block relative" ref={loginRef}>
          <button
            type="button"
            onClick={() => setIsLoginOpen((prev) => !prev)}
            className="p-2 cursor-pointer"
            aria-label="로그인 메뉴"
          >
            <Image
              src="/img/main/login.png"
              alt="로그인"
              width={24}
              height={24}
            />
          </button>

          {isLoginOpen && (
            <div className="absolute right-0 top-full mt-2 w-[100px] rounded-lg border border-[#909090] bg-white shadow-sm overflow-hidden">
              {LOGIN_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-[13px] text-text-muted hover:bg-bg-light transition-colors"
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
          className="md:hidden p-2 cursor-pointer"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={closeDrawer}
        >
          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-[60px] px-6 border-b border-border-light">
              <span className="text-[15px] font-semibold text-text-dark">
                메뉴
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 cursor-pointer"
                aria-label="메뉴 닫기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="px-6 py-4">
              {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-3 text-[15px] font-medium border-b border-border-light transition-colors ${
                      active ? "text-text-dark" : "text-text-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Login */}
            <div className="px-6 pt-2">
              <div className="flex items-center gap-2 mb-3 text-[13px] text-text-light">
                <Image
                  src="/img/main/login.png"
                  alt="로그인"
                  width={18}
                  height={18}
                />
                <span>계정</span>
              </div>
              {LOGIN_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-[14px] text-text-muted hover:text-text-dark transition-colors"
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
