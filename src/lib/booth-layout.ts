export const BOOTH_ROWS = [
  { name: "거", count: 11, color: "#2f80d2", x: 10, groups: [[1],[2],[3],[4,5],[6],[7,8],[9],[10,11]] },
  { name: "위", count: 11, color: "#2f80d2", x: 28, groups: [[1],[2,3],[4],[5],[6,7],[8],[9,10],[11]] },
  { name: "와", count: 7, color: "#999999", x: 43, groups: [[1],[2],[],[3,4],[5],[],[6,7]] },
  { name: "토", count: 3, color: "#33aa8e", x: 61, groups: [[1],[2,3]] },
  { name: "끼", count: 8, color: "#33aa8e", x: 88, groups: [[2],[3],[4],[5],[6],[7],[8]] },
] as const;
export function validBoothPosition(row: string, column: number) {
  const definition = BOOTH_ROWS.find(r => r.name === row);
  return !!definition && Number.isInteger(column) && column >= 1 && column <= definition.count;
}
