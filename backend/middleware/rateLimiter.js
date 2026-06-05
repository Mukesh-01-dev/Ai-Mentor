const rateLimitStore = {};

// Clean up expired entries every 10 minutes to prevent memory growth
const interval = setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitStore) {
    if (now > rateLimitStore[ip].resetTime) {
      delete rateLimitStore[ip];
    }
  }
}, 10 * 60 * 1000);

if (interval.unref) {
  interval.unref();
}

export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default: 15 mins
  const max = options.max || 100; // default: 100 requests
  const message = options.message || "Too many requests, please try again later.";

  return (req, res, next) => {
    // Determine client IP safely
    const ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = {
        resetTime: now + windowMs,
        count: 0,
      };
    }

    const clientData = rateLimitStore[ip];

    // Reset window if it has expired
    if (now > clientData.resetTime) {
      clientData.resetTime = now + windowMs;
      clientData.count = 0;
    }

    clientData.count += 1;

    // Set standard headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - clientData.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(clientData.resetTime / 1000));

    if (clientData.count > max) {
      return res.status(429).json({ message });
    }

    next();
  };
};
