/** 부스홍보게시판 배치도: 행 라벨과 행별 최대 열 번호 */
export const BOOTH_ROWS = ["거", "위", "와", "토", "끼"] as const;
export type BoothRowLabel = (typeof BOOTH_ROWS)[number];

export const BOOTH_ROW_MAX: Readonly<Record<BoothRowLabel, number>> = {
  거: 11,
  위: 11,
  와: 7,
  토: 3,
  끼: 8,
};

export const BOOTH_ROW_COLORS: Readonly<Record<BoothRowLabel, string>> = {
  거: "#2f80d2",
  위: "#2f80d2",
  와: "#999999",
  토: "#33aa8e",
  끼: "#33aa8e",
};

export function isValidBoothPosition(row: string, col: number): row is BoothRowLabel {
  const max = BOOTH_ROW_MAX[row as BoothRowLabel];
  return max !== undefined && Number.isInteger(col) && col >= 1 && col <= max;
}

export function boothPositionKey(row: string, col: number): string {
  return `${row}-${col}`;
}

/**
 * 배치도 박스 하나. cols가 2개면 위아래로 나뉜 박스(칸마다 따로 클릭).
 * gridCol: 1=거, 2=위, 3=와, 4=토, 5=끼-1(가로 박스), 6=끼 / gridRow: 1~8
 */
export interface BoothLayoutBox {
  readonly row: BoothRowLabel;
  readonly cols: readonly number[];
  readonly gridCol: number;
  readonly gridRow: number;
  readonly horizontal?: boolean;
}

function column(
  row: BoothRowLabel,
  gridCol: number,
  boxes: readonly (readonly number[] | null)[],
): BoothLayoutBox[] {
  return boxes.flatMap((cols, i) => (cols ? [{ row, cols, gridCol, gridRow: i + 1 }] : []));
}

export const BOOTH_LAYOUT: readonly BoothLayoutBox[] = [
  ...column("거", 1, [[1], [2], [3], [4, 5], [6], [7, 8], [9], [10, 11]]),
  ...column("위", 2, [[1], [2, 3], [4], [5], [6, 7], [8], [9, 10], [11]]),
  ...column("와", 3, [[1], [2], null, [3, 4], [5], null, [6, 7]]),
  ...column("토", 4, [[1], [2, 3]]),
  { row: "끼", cols: [1], gridCol: 5, gridRow: 1, horizontal: true },
  ...column("끼", 6, [[2], [3], [4], [5], [6], [7], [8]]),
];

/** 배치도 컬럼 헤더(행 라벨 원) 위치 */
export const BOOTH_ROW_HEADER_COL: Readonly<Record<BoothRowLabel, number>> = {
  거: 1,
  위: 2,
  와: 3,
  토: 4,
  끼: 6,
};
