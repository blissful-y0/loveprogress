import test from "node:test";
import assert from "node:assert/strict";

import {
  BOOTH_LAYOUT,
  BOOTH_ROW_MAX,
  isValidBoothPosition,
} from "../src/lib/booth-layout.ts";

test("booth layout places every valid position exactly once", () => {
  const placed = BOOTH_LAYOUT.flatMap((box) => box.cols.map((c) => `${box.row}-${c}`));
  const expected = Object.entries(BOOTH_ROW_MAX).flatMap(([row, max]) =>
    Array.from({ length: max }, (_, i) => `${row}-${i + 1}`),
  );

  assert.equal(placed.length, 40);
  assert.deepEqual([...placed].sort(), [...expected].sort());
});

test("booth layout boxes do not overlap", () => {
  const cells = BOOTH_LAYOUT.map((box) => `${box.gridCol}:${box.gridRow}`);
  assert.equal(new Set(cells).size, cells.length);
});

test("isValidBoothPosition enforces per-row column range", () => {
  assert.equal(isValidBoothPosition("거", 11), true);
  assert.equal(isValidBoothPosition("토", 4), false);
  assert.equal(isValidBoothPosition("끼", 0), false);
  assert.equal(isValidBoothPosition("와", 1.5), false);
  assert.equal(isValidBoothPosition("가", 1), false);
});
