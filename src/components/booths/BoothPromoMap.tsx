"use client";

import {
  BOOTH_LAYOUT,
  BOOTH_ROW_COLORS,
  BOOTH_ROW_HEADER_COL,
  BOOTH_ROWS,
  boothPositionKey,
  type BoothLayoutBox,
  type BoothRowLabel,
} from "@/lib/booth-layout";
import type { BoothCardData } from "@/types/booth";

interface BoothPromoMapProps {
  /** key: "행-열" */
  readonly boothsByPosition: ReadonlyMap<string, BoothCardData>;
  readonly likedIds: ReadonlySet<string>;
  readonly onSelect: (row: BoothRowLabel, col: number) => void;
}

// 레이아웃 컬럼(1=거 … 6=끼) → CSS grid 컬럼. 2·5번째는 통로 간격
const GRID_COLUMN: Readonly<Record<number, number>> = { 1: 1, 2: 3, 3: 4, 4: 6, 5: 7, 6: 8 };
const GRID_TEMPLATE = "48px 24px 48px 48px 24px 48px 72px 48px";

function Slot({
  row,
  col,
  booth,
  liked,
  className,
  onSelect,
}: {
  row: BoothRowLabel;
  col: number;
  booth: BoothCardData | undefined;
  liked: boolean;
  className: string;
  onSelect: (row: BoothRowLabel, col: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      aria-label={`${row}-${col} ${booth?.name ?? "부스 인포 미등록"}`}
      className={`relative flex flex-1 items-center justify-center border text-[24px] font-semibold leading-none text-[#333333] cursor-pointer transition-[filter] hover:brightness-95 ${
        booth ? "bg-white" : "bg-[#DDDDDD]"
      } ${liked ? "z-10 border-2 border-[#33aa8e]" : "border-[#999999]"} ${className}`}
    >
      {col}
    </button>
  );
}

function Box({ box, ...props }: { box: BoothLayoutBox } & BoothPromoMapProps) {
  const split = box.cols.length > 1;
  return (
    <div
      className={`flex ${box.horizontal ? "h-9 w-[72px] self-start justify-self-end -mr-4 mt-1" : "h-[72px] w-12 flex-col"}`}
      style={{ gridColumn: GRID_COLUMN[box.gridCol], gridRow: box.gridRow + 1 }}
    >
      {box.cols.map((col, i) => {
        const booth = props.boothsByPosition.get(boothPositionKey(box.row, col));
        const shape = !split ? "rounded-[6px]" : i === 0 ? "rounded-t-[6px]" : "-mt-px rounded-b-[6px]";
        return (
          <Slot
            key={col}
            row={box.row}
            col={col}
            booth={booth}
            liked={!!booth && props.likedIds.has(booth.id)}
            className={shape}
            onSelect={props.onSelect}
          />
        );
      })}
    </div>
  );
}

export default function BoothPromoMap(props: BoothPromoMapProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="mx-auto grid w-max gap-x-4 gap-y-5 rounded-[14px] border-2 border-[#999999] px-10 py-8"
        style={{ gridTemplateColumns: GRID_TEMPLATE }}
      >
        {BOOTH_ROWS.map((row) => (
          <div
            key={row}
            className="flex h-10 w-10 items-center justify-center justify-self-center rounded-full text-[24px] font-black leading-none text-white"
            style={{
              gridColumn: GRID_COLUMN[BOOTH_ROW_HEADER_COL[row]],
              gridRow: 1,
              backgroundColor: BOOTH_ROW_COLORS[row],
            }}
          >
            {row}
          </div>
        ))}
        {BOOTH_LAYOUT.map((box) => (
          <Box key={`${box.row}-${box.cols[0]}`} box={box} {...props} />
        ))}
      </div>
    </div>
  );
}
