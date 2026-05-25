import rateLimit from "express-rate-limit";

const createLimiter = (max, windowMinutes, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message,
  });

export const loginLimiter = createLimiter(
  10,
  15,
  "Too many login attempts. Try later."
);

export const registerLimiter = createLimiter(
  10,
  60,
  "Too many accounts created. Try later."
);

export const forgotLimiter = createLimiter(
  5,
  60,
  "Too many reset requests. Try later."
);