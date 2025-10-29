import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../repositories/userRepo.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function signUp({ email, password, firstName, lastName, phone }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const newUser = await createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
    });
    
    const accessToken = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return { user: newUser, accessToken };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const err = new Error('Email already in use');
        err.status = 409;
        throw err;
      }
    }
    throw error;
  }
}

export async function logIn(email, password) {
  const user = await findUserByEmail(email);
  
  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken };
}
