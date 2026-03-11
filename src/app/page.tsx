"use client";

import TopCarousel from "@/components/main/TopCarousel";
import MiddleBanners from "@/components/main/MiddleBanners";
import BoardSections from "@/components/main/BoardSections";
export default function Home() {
  return (
    <main>
      <TopCarousel />
      <MiddleBanners />
      <BoardSections />
    </main>
  );
}
