import { 
  findAllUsers, 
  findUserById, 
  updateUser, 
  deleteUser, 
  findListingsByUserId, 
  findUserByEmail 
} from '../repositories/userRepo.js';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function getAllUsers() {
  return await findAllUsers();
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
}

export async function updateCurrentUser(userId, updateData) {
  const updates = {};
  
  if (updateData.email) {
    const existingUser = await findUserByEmail(updateData.email);
    if (existingUser && existingUser.id !== userId) {
      const error = new Error('Email already in use');
      error.status = 409;
      throw error;
    }
    updates.email = updateData.email;
  }
  
  if (updateData.password) {
    updates.password = await bcrypt.hash(updateData.password, 10);
  }
  
  if (updateData.firstName) updates.firstName = updateData.firstName;
  if (updateData.lastName) updates.lastName = updateData.lastName;
  if (updateData.phone !== undefined) updates.phone = updateData.phone;
  
  try {
    const updatedUser = await updateUser(userId, updates);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return updatedUser;
  } catch (error) {
    console.error('UpdateUser Error Details:', {
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

export async function deleteCurrentUser(userId) {
  const result = await deleteUser(userId);
  if (!result) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
}

export async function getCurrentUserListings(userId) {
  return await findListingsByUserId(userId);
}

export async function updateUserRole(targetUserId, newRole) {
  const user = await findUserById(targetUserId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  
  const updatedUser = await updateUser(targetUserId, { role: newRole });
  return updatedUser;
}