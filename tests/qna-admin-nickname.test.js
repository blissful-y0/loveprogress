const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const adminQnaRouteSource = fs.readFileSync(
  path.join(rootDir, "src", "app", "api", "admin", "qna", "route.ts"),
  "utf8",
);
const qnaManagerSource = fs.readFileSync(
  path.join(rootDir, "src", "app", "admin", "_components", "qna-manager.tsx"),
  "utf8",
);

test("admin qna route returns login nickname for authenticated writers", () => {
  assert.match(adminQnaRouteSource, /user_id/);
  assert.match(adminQnaRouteSource, /author_nickname/);
  assert.match(adminQnaRouteSource, /from\("users"\)/);
  assert.match(adminQnaRouteSource, /nickname/);
});

test("admin qna manager renders login nickname when it exists", () => {
  assert.match(qnaManagerSource, /author_nickname\?: string \| null/);
  assert.match(qnaManagerSource, /post\.author_nickname/);
  assert.match(qnaManagerSource, /로그인 닉네임/);
});
