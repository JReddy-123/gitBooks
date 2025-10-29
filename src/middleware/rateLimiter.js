import { rateLimit } from 'express-rate-limit';

const logInLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: process.env.NODE_ENV === 'test' ? 1000 : 5,
  handler: (req, res, next) => {
    const error = new Error('Too many login attempts. Try again later.');
    error.status = 429;
    next(error);
  }
});

export default logInLimiter;