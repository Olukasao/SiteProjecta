const DEFAULT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 600;

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs) || DEFAULT_WINDOW_MS;
  const maxRequests = Number(options.maxRequests) || DEFAULT_MAX_REQUESTS;
  const skip = typeof options.skip === "function" ? options.skip : () => false;
  const hits = new Map();
  let lastSweep = Date.now();

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const now = Date.now();
    if (now - lastSweep > windowMs) {
      for (const [key, value] of hits.entries()) {
        if (value.expiresAt <= now) {
          hits.delete(key);
        }
      }
      lastSweep = now;
    }

    const key = getClientIp(req);
    const current = hits.get(key);

    if (!current || current.expiresAt <= now) {
      hits.set(key, {
        count: 1,
        expiresAt: now + windowMs
      });
      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((current.expiresAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: "Muitas requisicoes em pouco tempo. Tente novamente em alguns minutos."
      });
    }

    return next();
  };
}

const apiRateLimiter = createRateLimiter({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS,
  maxRequests: Number(process.env.API_RATE_LIMIT_MAX) || DEFAULT_MAX_REQUESTS,
  skip(req) {
    return req.path === "/" || req.path === "/health";
  }
});

module.exports = {
  createRateLimiter,
  apiRateLimiter
};
