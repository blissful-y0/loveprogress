"use client";

import { useMemo, useState } from "react";
import type { BoothKeyword } from "@/types/database";
import type { BoothCardData } from "@/types/booth";
import { AGE_FILTERS, KEYWORD_FILTERS } from "@/lib/mock-booth-data";
import { BOOTH_KEYWORD_PILL_COLORS } from "@/lib/booth-keyword-colors";
import BoothCard from "./BoothCard";
import BoothDetailModal from "./BoothDetailModal";

interface BoothListClientProps {
  readonly booths: readonly BoothCardData[];
}

type AgeFilterValue = "all" | "general" | "adult";

function FilterPill({
  label,
  active,
  onClick,
  colorKey,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  colorKey?: string;
}) {
  const colors = colorKey ? BOOTH_KEYWORD_PILL_COLORS[colorKey] : null;

  const cls = active
    ? colors?.active ?? "bg-[#1a1a1a] text-white shadow-sm"
    : colors?.inactive ?? "text-[#888] hover:text-[#555] bg-transparent ring-[#e0e0e0] hover:ring-[#bbb]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-[5px] text-[12px] font-medium tracking-[-0.01em] transition-all duration-150 cursor-pointer ring-1 ring-inset ${cls}`}
    >
      {label}
    </button>
  );
}

export default function BoothListClient({ booths }: BoothListClientProps) {
  const [ageFilter, setAgeFilter] = useState<AgeFilterValue>("all");
  const [keywordFilters, setKeywordFilters] = useState<ReadonlySet<BoothKeyword>>(new Set());
  const [selectedBooth, setSelectedBooth] = useState<BoothCardData | null>(null);

  const handleKeywordToggle = (keyword: BoothKeyword) => {
    setKeywordFilters((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  };

  const filteredBooths = useMemo(() => {
    return booths.filter((booth) => {
      if (ageFilter !== "all" && booth.ageType !== ageFilter) return false;
      if (keywordFilters.size > 0) {
        if (!booth.keywords.some((kw) => keywordFilters.has(kw))) return false;
      }
      return true;
    });
  }, [booths, ageFilter, keywordFilters]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0]">
        <div className="mx-auto max-w-[960px] px-6 py-4 flex flex-wrap items-center justify-center gap-2">
          {AGE_FILTERS.map((filter) => (
            <FilterPill
              key={filter.value}
              label={filter.label}
              active={ageFilter === filter.value}
              onClick={() => setAgeFilter(filter.value as AgeFilterValue)}
            />
          ))}
          <span className="w-px h-4 bg-[#e0e0e0] mx-1 hidden sm:block" />
          {KEYWORD_FILTERS.map((keyword) => (
            <FilterPill
              key={keyword}
              label={`#${keyword}`}
              active={keywordFilters.has(keyword)}
              onClick={() => handleKeywordToggle(keyword)}
              colorKey={keyword}
            />
          ))}
        </div>
      </div>

      {/* Booth Grid */}
      <div className="mx-auto max-w-[960px] px-6 pt-8 pb-16">
        {filteredBooths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[15px] text-[#bbb]">조건에 맞는 부스가 없습니다.</p>
            <button
              type="button"
              onClick={() => { setAgeFilter("all"); setKeywordFilters(new Set()); }}
              className="mt-4 text-[13px] text-[#1a1a1a] font-medium underline underline-offset-2 decoration-[#ccc] hover:decoration-[#666] cursor-pointer transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-[#bbb] tracking-wide mb-8 text-center">
              총 <span className="font-semibold text-[#888]">{filteredBooths.length}</span>개의 부스
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
              {filteredBooths.map((booth) => (
                <BoothCard
                  key={booth.id}
                  booth={booth}
                  onClick={() => setSelectedBooth(booth)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <BoothDetailModal
        booth={selectedBooth}
        open={selectedBooth !== null}
        onOpenChange={(open) => { if (!open) setSelectedBooth(null); }}
      />
    </div>
  );
}
