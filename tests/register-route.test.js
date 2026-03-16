const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const routeSource = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "src",
    "app",
    "api",
    "auth",
    "register",
    "route.ts",
  ),
  "utf8",
);

test("register route reads zod issues instead of removed errors property", () => {
  assert.doesNotMatch(routeSource, /parsed\.error\.errors/);
  assert.match(routeSource, /parsed\.error\.issues/);
});
