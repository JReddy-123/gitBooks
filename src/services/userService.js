import { create, findByEmail } from "../repositories/userRepo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function createUser(userData) {
    const { email, password, first_name, last_name, phone } = userData;
    
    // Check if user already exists
    const existingUser = findByEmail(email);
    if (existingUser) {
        const error = new Error('User with this email already exists');
        error.status = 409;
        throw error;
    }
    
    // Hash password
    //const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Create user
    const newUser = create({
        email,
        password,
        first_name,
        last_name,
        phone
    });
    
    // Generate JWT token
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key-sprint1',
        { expiresIn: '7d' }
    );
    
    return { user: newUser, token };
}

export function authenticateUser(credentials) {
    const { email, password } = credentials;
    
    // Find user by email (this returns user with password)
    const user = findByEmail(email);
    if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }
    
    // Verify password
    //const isValidPassword = bcrypt.compareSync(password, user.password);
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }
    
    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key-sprint1',
        { expiresIn: '7d' }
    );
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
}