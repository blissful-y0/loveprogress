interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitResult {
  readonly success: boolean;
  readonly remaining: number;
}

export function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  store.set(key, { count: entry.count + 1, resetTime: entry.resetTime });
  return { success: true, remaining: maxAttempts - entry.count - 1 };
}
