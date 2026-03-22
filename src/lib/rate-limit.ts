import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

interface RateLimitOptions {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export function rateLimit(
  request: Request,
  endpoint: string,
  options: RateLimitOptions,
): NextResponse | null {
  cleanupExpiredEntries();

  const ip = getClientIp(request);
  const key = `${endpoint}:${ip}`;
  const now = Date.now();

  const existing = rateLimitStore.get(key);

  if (!existing || now >= existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
    return null;
  }

  if (existing.count >= options.maxRequests) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  rateLimitStore.set(key, {
    count: existing.count + 1,
    resetTime: existing.resetTime,
  });

  return null;
}
