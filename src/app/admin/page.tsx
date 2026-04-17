"use client";

import { useState } from "react";
import {
  ImageIcon,
  FileTextIcon,
  PinIcon,
  MessageCircleIcon,
  StoreIcon,
  UsersIcon,
  InfoIcon,
  ChevronRightIcon,
  PanelLeftIcon,
} from "lucide-react";

import BannerManager from "./_components/banner-manager";
import BoardManager from "./_components/board-manager";
import PinManager from "./_components/pin-manager";
import MemberManager from "./_components/member-manager";
import AboutPageManager from "./_components/about-page-manager";
import QnaManager from "./_components/qna-manager";
import BoothManager from "./_components/booth-manager";

interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly component: React.ComponentType;
}

interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

const NAV_GROUPS: readonly NavGroup[] = [
  {
    title: "사이트",
    items: [
      { key: "banners", label: "배너 관리", icon: ImageIcon, component: BannerManager },
      { key: "about", label: "대학소개 페이지", icon: InfoIcon, component: AboutPageManager },
    ],
  },
  {
    title: "게시판",
    items: [
      { key: "boards", label: "글 관리", icon: FileTextIcon, component: BoardManager },
      { key: "pins", label: "고정 관리", icon: PinIcon, component: PinManager },
    ],
  },
  {
    title: "커뮤니티",
    items: [
      { key: "qna", label: "QnA 답변", icon: MessageCircleIcon, component: QnaManager },
      { key: "booths", label: "부스 관리", icon: StoreIcon, component: BoothManager },
    ],
  },
  {
    title: "시스템",
    items: [
      { key: "members", label: "회원 관리", icon: UsersIcon, component: MemberManager },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminPage() {
  const [activeKey, setActiveKey] = useState("qna");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeItem = ALL_ITEMS.find((item) => item.key === activeKey) ?? ALL_ITEMS[0];
  const ActiveComponent = activeItem.component;

  return (
    <div className="flex gap-6 min-h-[70vh]">
      {/* Sidebar */}
      <aside
        className={`shrink-0 transition-all duration-200 ${
          sidebarOpen ? "w-[200px]" : "w-0 overflow-hidden"
        }`}
      >
        <div className="sticky top-24 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-bold text-[#aaa] tracking-wide uppercase mb-2 pl-2">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.key === activeKey;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setActiveKey(item.key)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#333]"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <ChevronRightIcon className="size-3.5 ml-auto shrink-0 opacity-60" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-md hover:bg-[#f0f0f0] transition-colors text-[#888] cursor-pointer"
            aria-label="사이드바 토글"
          >
            <PanelLeftIcon className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <activeItem.icon className="size-5 text-primary" />
            <h1 className="text-xl font-bold text-[#212121]">{activeItem.label}</h1>
          </div>
        </div>

        {/* Manager component */}
        <ActiveComponent />
      </main>
    </div>
  );
}
