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
    console.error('SignUp Error Details:', {
      name: error.constructor.name,
      code: error.code,
      meta: error.meta,
      message: error.message
    });

    // Check if it's a Prisma error
    if (error.constructor.name === 'PrismaClientKnownRequestError' || error.code === 'P2002') {
      // Unique constraint violation
      const target = error.meta?.target;
      let field;
      
      if (Array.isArray(target)) {
        field = target[0];
      } else if (typeof target === 'string') {
        field = target;
      }
      
      console.log('Constraint violation on field:', field);
      
      if (field === 'email') {
        const err = new Error('Email already in use');
        err.status = 409;
        throw err;
      } else if (field === 'phone') {
        const err = new Error('Phone number already in use');
        err.status = 409;
        throw err;
      } else {
        const err = new Error('This information is already registered');
        err.status = 409;
        throw err;
      }
    }
    
    // Re-throw if not a duplicate error
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