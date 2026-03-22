# Develop Merge Blockers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the three blockers preventing a safe `develop -> main` merge: rate-limit RPC exposure, nickname uniqueness enforcement, and outdated secret Q&A tests.

**Architecture:** Harden the database boundary first so the security and data-integrity guarantees live in SQL, then align the API layer with those guarantees, then update tests to validate the current behavior instead of removed mock-data assumptions.

**Tech Stack:** Next.js App Router, Supabase SQL migrations, Postgres RLS/functions, Node test runner.

---

### Task 1: Add failing verification for the three blockers

**Files:**
- Modify: `tests/schema-rls.test.js`
- Modify: `tests/register-route.test.js`
- Modify: `tests/qna-secret.test.js`

**Step 1:** Extend schema tests so they fail until the rate-limit function revokes public execute and nickname uniqueness exists in schema.

**Step 2:** Extend register route tests so they fail until nickname duplicate handling exists in the API source.

**Step 3:** Update Q&A secret tests to assert against the current API/client structure rather than removed mock constants, then run tests to confirm red on the other blockers.

### Task 2: Fix SQL-level blockers

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/migrations/20260322200000_add_rate_limit.sql`

**Step 1:** Add nickname uniqueness at the schema level.

**Step 2:** Revoke `PUBLIC` execute on `increment_rate_limit` and grant only the intended role.

### Task 3: Align API behavior with new guarantees

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

**Step 1:** Detect nickname unique-constraint failures during profile insert.

**Step 2:** Return a stable conflict response for duplicate nickname instead of a generic 500.

### Task 4: Verify

**Files:**
- None

**Step 1:** Run targeted node tests.

**Step 2:** Run full `node --test tests/*.js`.

**Step 3:** Run `npm run build`.
