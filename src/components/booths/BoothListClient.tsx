"use client";

import { useMemo, useState } from "react";
import type { BoothKeyword } from "@/types/database";
import type { BoothCardData } from "@/types/booth";
import { AGE_FILTERS, KEYWORD_FILTERS } from "@/lib/mock-booth-data";
import BoothCard from "./BoothCard";

interface BoothListClientProps {
  readonly booths: readonly BoothCardData[];
}

type AgeFilterValue = "all" | "general" | "adult";

export default function BoothListClient({ booths }: BoothListClientProps) {
  const [ageFilter, setAgeFilter] = useState<AgeFilterValue>("all");
  const [keywordFilters, setKeywordFilters] = useState<ReadonlySet<BoothKeyword>>(
    new Set()
  );

  const handleAgeFilter = (value: AgeFilterValue) => {
    setAgeFilter(value);
  };

  const handleKeywordToggle = (keyword: BoothKeyword) => {
    setKeywordFilters((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
  };

  const filteredBooths = useMemo(() => {
    return booths.filter((booth) => {
      // Group A: age filter
      if (ageFilter !== "all" && booth.ageType !== ageFilter) {
        return false;
      }

      // Group B: keyword filter (AND with Group A, booth must have at least one selected keyword)
      if (keywordFilters.size > 0) {
        const hasMatchingKeyword = booth.keywords.some((kw) =>
          keywordFilters.has(kw)
        );
        if (!hasMatchingKeyword) {
          return false;
        }
      }

      return true;
    });
  }, [booths, ageFilter, keywordFilters]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="sticky top-[80px] lg:top-[80px] z-30 bg-white/95 backdrop-blur-sm border-b border-border-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-4">
          {/* Group A: Age filters */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[12px] font-semibold text-text-light mr-1 shrink-0">
              연령
            </span>
            {AGE_FILTERS.map((filter) => {
              const isActive = ageFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleAgeFilter(filter.value as AgeFilterValue)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-text-sub hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Group B: Keyword filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-text-light mr-1 shrink-0">
              키워드
            </span>
            {KEYWORD_FILTERS.map((keyword) => {
              const isActive = keywordFilters.has(keyword);
              return (
                <button
                  key={keyword}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleKeywordToggle(keyword)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-text-sub hover:bg-gray-200"
                  }`}
                >
                  #{keyword}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booth Grid */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
        {filteredBooths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[15px] text-text-light">
              조건에 맞는 부스가 없습니다.
            </p>
            <button
              type="button"
              onClick={() => {
                setAgeFilter("all");
                setKeywordFilters(new Set());
              }}
              className="mt-4 text-[13px] text-primary font-medium hover:underline cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-text-light mb-6">
              총 {filteredBooths.length}개의 부스
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooths.map((booth) => (
                <BoothCard key={booth.id} booth={booth} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
