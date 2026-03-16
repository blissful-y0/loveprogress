const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const envSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "lib", "supabase", "env.ts"),
  "utf8",
);

test("supabase env module does not bypass validation during production build", () => {
  assert.doesNotMatch(envSource, /NEXT_PHASE/);
});

test("supabase env module does not fall back to empty credentials", () => {
  assert.doesNotMatch(envSource, /\?\? ""/);
});
