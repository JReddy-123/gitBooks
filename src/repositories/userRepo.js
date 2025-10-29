import prisma from '../config/db.js';

export async function createUser(data) {
  return await prisma.user.create({ 
    data,
    omit: { password: true } 
  });
}

export async function findUserByEmail(email) {
  return await prisma.user.findUnique({ 
    where: { email, isActive: true } 
  });
}

export async function findAllUsers() {
  return await prisma.user.findMany({
    where: { isActive: true },
    omit: { password: true },
  });
}

export async function findUserById(id) {
  return await prisma.user.findUnique({
    where: { id, isActive: true },
    omit: { password: true }
  });
}

export async function updateUser(id, data) {
  try {
    return await prisma.user.update({
      where: { id },
      data,
      omit: { password: true }
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    return await prisma.user.delete({
      where: { id }
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function findListingsByUserId(userId) {
  return await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' }
  });
}
