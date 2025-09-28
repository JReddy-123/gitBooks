import { createUser, authenticateUser } from "../services/userService.js";

export function register(req, res, next) {
    try {
        const result = createUser(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully - Sprint 1',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export function login(req, res, next) {
    try {
        const result = authenticateUser(req.body);
        res.status(200).json({
            success: true,
            message: 'Login successful - Sprint 1',
            data: result
        });
    } catch (error) {
        next(error);
    }
}