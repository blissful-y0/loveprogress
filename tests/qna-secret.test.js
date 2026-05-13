const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const qnaCardSource = fs.readFileSync(
  path.join(rootDir, "src", "app", "qna", "_components", "qna-card.tsx"),
  "utf8",
);
const qnaRouteSource = fs.readFileSync(
  path.join(rootDir, "src", "app", "api", "qna", "route.ts"),
  "utf8",
);
const verifyRoutePath = path.join(
  rootDir,
  "src",
  "app",
  "api",
  "qna",
  "[id]",
  "verify-password",
  "route.ts",
);

test("secret qna client does not use a hardcoded password", () => {
  assert.doesNotMatch(qnaCardSource, /1234/);
});

test("secret qna list response strips protected content server-side", () => {
  assert.match(qnaRouteSource, /const canView = !post\.is_secret \|\| isOwner/);
  assert.match(qnaRouteSource, /content:\s*canView\s*\?\s*post\.content\s*:\s*""/);
  assert.match(qnaRouteSource, /answer:\s*canView\s*\?/);
});

test("secret qna verification is handled by a server route", () => {
  assert.equal(fs.existsSync(verifyRoutePath), true);
});
