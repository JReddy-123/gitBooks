import express from "express";
import { validateUserRegistration, validateUserLogin } from "../middleware/userValidators.js";
import { register, login } from "../controllers/userController.js";

const router = express.Router();

// Sprint 1: Basic authentication routes only
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Sprint 1: Basic test route
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Sprint 1 - User routes working!',
        sprint: 1
    });
});

export default router;