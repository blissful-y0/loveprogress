const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const schemaPath = path.join(__dirname, "..", "supabase", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
const rateLimitMigrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260322200000_add_rate_limit.sql",
);
const rateLimitMigration = fs.readFileSync(rateLimitMigrationPath, "utf8");

function getPolicyBlock(policyName) {
  const marker = `CREATE POLICY "${policyName}"`;
  const start = schema.indexOf(marker);

  assert.notEqual(start, -1, `Policy ${policyName} should exist`);

  const remaining = schema.slice(start);
  const nextPolicy = remaining.indexOf('\nCREATE POLICY "', marker.length);
  const nextSection = remaining.indexOf("\n-- ───", marker.length);

  const candidates = [nextPolicy, nextSection].filter((index) => index !== -1);
  const end = candidates.length > 0 ? Math.min(...candidates) : remaining.length;

  return remaining.slice(0, end);
}

test("public board comments policy excludes secret posts", () => {
  const policy = getPolicyBlock("board_comments_select_public");

  assert.match(policy, /board_posts\.board_type IN \('notice', 'event'\)/);
  assert.match(policy, /board_posts\.is_secret = false/);
});

test("booth board comments policy excludes secret posts", () => {
  const policy = getPolicyBlock("board_comments_select_booth");

  assert.match(policy, /board_posts\.board_type = 'booth_private'/);
  assert.match(policy, /board_posts\.is_secret = false/);
});

test("secret board comments have a dedicated policy", () => {
  const policy = getPolicyBlock("board_comments_select_secret");

  assert.match(policy, /board_posts\.is_secret = true/);
  assert.match(policy, /board_posts\.author_user_id = auth\.uid\(\)/);
  assert.match(policy, /users\.role = 'admin'/);
});

test("qna answers are not globally readable", () => {
  assert.doesNotMatch(schema, /CREATE POLICY "qna_answers_select_all"/);

  const policy = getPolicyBlock("qna_answers_select_public");
  assert.match(policy, /qna_posts\.is_secret = false/);
});

test("users nickname is unique at the schema level", () => {
  assert.match(
    schema,
    /nickname\s+TEXT\s+NOT NULL UNIQUE|CREATE UNIQUE INDEX .*nickname/i,
  );
});

test("rate limit function is not executable by public", () => {
  assert.match(
    rateLimitMigration,
    /REVOKE EXECUTE ON FUNCTION increment_rate_limit\(TEXT,\s*INTEGER,\s*BIGINT\) FROM PUBLIC;/,
  );
  assert.match(
    rateLimitMigration,
    /GRANT EXECUTE ON FUNCTION increment_rate_limit\(TEXT,\s*INTEGER,\s*BIGINT\) TO service_role;/,
  );
});
