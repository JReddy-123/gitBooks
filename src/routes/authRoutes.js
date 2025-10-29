import express from 'express';
import { signUpHandler, logInHandler } from '../controllers/authController.js';
import { validateUser } from '../middleware/userValidators.js';
import logInLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', validateUser, signUpHandler);
router.post('/login', logInLimiter, validateUser, logInHandler);

export default router;
