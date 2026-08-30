const buckets = new Map();

/**
 * Normalise the client IP. Behind `app.set("trust proxy", ...)` Express may
 * hand us either an IPv4 (`127.0.0.1`), an IPv6 (`::1`), or the IPv6-mapped
 * IPv4 form (`::ffff:127.0.0.1`). Treating those as different keys would
 * silently bypass the limit in dev (and for some IPv6 clients in prod),
 * which is exactly what was causing "Too many requests" right after a
 * handful of attempts on localhost.
 */
function getClientKey(req, prefix) {
  const raw = req.ip || req.socket?.remoteAddress || "unknown";
  // Strip the IPv6-mapped prefix so v4 and v4-in-v6 map to the same bucket.
  const ip = raw.startsWith("::ffff:") ? raw.slice(7) : raw;
  return `${prefix}:${ip}`;
}

function pruneBucket(bucket, windowMs) {
  const cutoff = Date.now() - windowMs;
  while (bucket.length && bucket[0] <= cutoff) {
    bucket.shift();
  }
}

/**
 * Best-effort cleanup of buckets whose every timestamp has expired. Without
 * this the in-memory Map grew unbounded for every IP/prefix we'd ever seen
 * (a slow leak on long-running servers).
 */
function cleanupExpiredBuckets(windowMs) {
  const cutoff = Date.now() - windowMs;
  for (const [key, bucket] of buckets) {
    pruneBucket(bucket, windowMs);
    if (bucket.length === 0) {
      // Drop only buckets older than the cutoff so we don't race with a
      // request that is about to add to them.
      if (bucket._lastTouched && bucket._lastTouched < cutoff) {
        buckets.delete(key);
      }
    }
  }
}

// Run cleanup once a minute. Unref so it never blocks process exit.
const cleanupInterval = setInterval(() => {
  // Use the smallest window in use (60s) as the sweep cutoff; larger
  // windows only need less frequent cleanup.
  cleanupExpiredBuckets(60_000);
}, 60_000);
if (typeof cleanupInterval.unref === "function") cleanupInterval.unref();

/**
 * Sliding-window in-memory rate limiter.
 *
 * Returns an Express middleware that allows up to `max` requests per
 * `windowMs` per (key-prefix × client-IP). On overflow it sends a 429 with
 * a useful `Retry-After` header. The middleware also exposes
 * `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`
 * headers so the frontend (and curl/devtools) can see the current budget.
 */
export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "" } = {}) {
  return (req, res, next) => {
    const key = getClientKey(req, keyPrefix);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
    }

    pruneBucket(bucket, windowMs);
    bucket._lastTouched = Date.now();

    const remaining = Math.max(0, max - bucket.length - 1);
    const resetMs = bucket.length ? Math.max(0, bucket[0] + windowMs - Date.now()) : windowMs;

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetMs / 1000)));

    if (bucket.length >= max) {
      const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
        retryAfterSeconds: retryAfterSec
      });
    }

    bucket.push(Date.now());
    next();
  };
}
