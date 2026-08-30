export const USE_LIVE_API = true;

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Custom error type that carries additional context from the API response —
 * currently used to surface the server's `retryAfterSeconds` value when the
 * rate limiter kicks in, so the UI can show "try again in N seconds"
 * instead of just "Too many requests".
 */
export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetSeconds: number;
  };

  constructor(
    message: string,
    status: number,
    extra: {
      retryAfterSeconds?: number;
      rateLimit?: { limit: number; remaining: number; resetSeconds: number };
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (extra.retryAfterSeconds != null) this.retryAfterSeconds = extra.retryAfterSeconds;
    if (extra.rateLimit) this.rateLimit = extra.rateLimit;
  }
}

function parseRateLimitHeaders(response: Response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  if (!limit || !remaining || !reset) return undefined;
  const n = Number(limit);
  const r = Number(remaining);
  const rs = Number(reset);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(rs)) return undefined;
  return { limit: n, remaining: r, resetSeconds: rs };
}

export async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (USE_LIVE_API) {
    const hasBody = options.body !== undefined;
    const token = typeof window !== 'undefined' ? localStorage.getItem('flexywork_token') : null;
    const headers: Record<string, string> = {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || 'API request failed';
      const extra: {
        retryAfterSeconds?: number;
        rateLimit?: { limit: number; remaining: number; resetSeconds: number };
      } = {};
      if (typeof data?.retryAfterSeconds === 'number') {
        extra.retryAfterSeconds = data.retryAfterSeconds;
      } else {
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) {
          const n = Number(retryAfter);
          if (Number.isFinite(n)) extra.retryAfterSeconds = n;
        }
      }
      const rl = parseRateLimitHeaders(response);
      if (rl) extra.rateLimit = rl;
      throw new ApiError(message, response.status, extra);
    }
    return data as T;
  }

  throw new Error('Using local mock data - live API calls are disabled.');
}
