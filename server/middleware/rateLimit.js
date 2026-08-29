const buckets = new Map();

function pruneBucket(bucket, windowMs) {
  const cutoff = Date.now() - windowMs;
  while (bucket.length && bucket[0] <= cutoff) {
    bucket.shift();
  }
}

export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "" } = {}) {
  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.socket.remoteAddress || "unknown"}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
    }

    pruneBucket(bucket, windowMs);

    if (bucket.length >= max) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    bucket.push(Date.now());
    next();
  };
}
