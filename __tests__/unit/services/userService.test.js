import { describe, test, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';

// Mock the repository before importing userService
const mockFindAllUsers = jest.fn();
const mockFindUserById = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockFindListingsByUserId = jest.fn();
const mockFindUserByEmail = jest.fn();

jest.unstable_mockModule('../../../src/repositories/userRepo.js', () => ({
  findAllUsers: mockFindAllUsers,
  findUserById: mockFindUserById,
  updateUser: mockUpdateUser,
  deleteUser: mockDeleteUser,
  findListingsByUserId: mockFindListingsByUserId,
  findUserByEmail: mockFindUserByEmail,
}));

// Mock Prisma error
class MockPrismaError extends Error {
  constructor(code, target) {
    super('Unique constraint failed');
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.meta = { target };
  }
}

// Now import userService (after mocking)
const {
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getCurrentUserListings,
  updateUserRole
} = await import('../../../src/services/userService.js');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-123';
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('userService - getAllUsers', () => {
  test('should return all active users', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@student.edu', firstName: 'User', lastName: 'One' },
      { id: 2, email: 'user2@student.edu', firstName: 'User', lastName: 'Two' }
    ];

    mockFindAllUsers.mockResolvedValue(mockUsers);

    const result = await getAllUsers();

    expect(result).toEqual(mockUsers);
    expect(mockFindAllUsers).toHaveBeenCalledTimes(1);
  });

  test('should return empty array if no users', async () => {
    mockFindAllUsers.mockResolvedValue([]);

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });
});

describe('userService - getCurrentUser', () => {
  test('should return user by ID', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'Test',
      lastName: 'User'
    };

    mockFindUserById.mockResolvedValue(mockUser);

    const result = await getCurrentUser(1);

    expect(result).toEqual(mockUser);
    expect(mockFindUserById).toHaveBeenCalledWith(1);
  });

  test('should throw 404 error if user not found', async () => {
    mockFindUserById.mockResolvedValue(null);

    await expect(getCurrentUser(999)).rejects.toThrow('User not found');
    
    try {
      await getCurrentUser(999);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});

describe('userService - updateCurrentUser', () => {
  test('should update user successfully', async () => {
    const userId = 1;
    const updates = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'Updated',
      lastName: 'Name'
    };

    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    const result = await updateCurrentUser(userId, updates);

    expect(result).toEqual(mockUpdatedUser);
    expect(mockUpdateUser).toHaveBeenCalledWith(userId, updates);
  });

  test('should hash password when updating password', async () => {
    const userId = 1;
    const updates = { password: 'newpassword123' };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@student.edu'
    };

    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    await updateCurrentUser(userId, updates);

    // Check that updateUser was called with hashed password
    const callArgs = mockUpdateUser.mock.calls[0][1];
    expect(callArgs.password).not.toBe('newpassword123'); // Should be hashed
    expect(callArgs.password).toMatch(/^\$2[aby]\$/); // Bcrypt hash format

    // Verify we can compare it
    const isMatch = await bcrypt.compare('newpassword123', callArgs.password);
    expect(isMatch).toBe(true);
  });

  test('should check for duplicate email before updating', async () => {
    const userId = 1;
    const updates = { email: 'newemail@student.edu' };

    // Mock existing user with different ID (duplicate)
    mockFindUserByEmail.mockResolvedValue({
      id: 2,
      email: 'newemail@student.edu'
    });

    await expect(
      updateCurrentUser(userId, updates)
    ).rejects.toThrow('Email already in use');

    try {
      await updateCurrentUser(userId, updates);
    } catch (error) {
      expect(error.status).toBe(409);
    }
  });

  test('should allow updating to same email (user owns it)', async () => {
    const userId = 1;
    const updates = { email: 'same@student.edu' };

    // Mock user owns this email
    mockFindUserByEmail.mockResolvedValue({
      id: 1,
      email: 'same@student.edu'
    });

    const mockUpdatedUser = {
      id: 1,
      email: 'same@student.edu'
    };

    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    const result = await updateCurrentUser(userId, updates);

    expect(result).toEqual(mockUpdatedUser);
  });

  test('should throw 409 for duplicate email (Prisma error)', async () => {
    const userId = 1;
    const updates = { email: 'duplicate@student.edu' };

    mockFindUserByEmail.mockResolvedValue(null);

    // Mock Prisma unique constraint error for email
    const prismaError = new MockPrismaError('P2002', ['email']);
    mockUpdateUser.mockRejectedValue(prismaError);

    await expect(
      updateCurrentUser(userId, updates)
    ).rejects.toThrow('Email already in use');

    try {
      await updateCurrentUser(userId, updates);
    } catch (error) {
      expect(error.status).toBe(409);
    }
  });

  test('should throw 409 for duplicate phone (Prisma error)', async () => {
    const userId = 1;
    const updates = { phone: '+1234567890' };

    // Mock Prisma unique constraint error for phone
    const prismaError = new MockPrismaError('P2002', ['phone']);
    mockUpdateUser.mockRejectedValue(prismaError);

    await expect(
      updateCurrentUser(userId, updates)
    ).rejects.toThrow('Phone number already in use');

    try {
      await updateCurrentUser(userId, updates);
    } catch (error) {
      expect(error.status).toBe(409);
    }
  });

  test('should handle phone as null', async () => {
    const userId = 1;
    const updates = { phone: null };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@student.edu',
      phone: null
    };

    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    const result = await updateCurrentUser(userId, updates);

    expect(result.phone).toBeNull();
  });

  test('should throw 404 if user not found during update', async () => {
    const userId = 999;
    const updates = { firstName: 'New' };

    mockUpdateUser.mockResolvedValue(null);

    await expect(
      updateCurrentUser(userId, updates)
    ).rejects.toThrow('User not found');

    try {
      await updateCurrentUser(userId, updates);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  test('should only update provided fields', async () => {
    const userId = 1;
    const updates = { firstName: 'NewFirst' };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'NewFirst',
      lastName: 'Original'
    };

    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    await updateCurrentUser(userId, updates);

    // Should only call with firstName
    const callArgs = mockUpdateUser.mock.calls[0][1];
    expect(callArgs).toEqual({ firstName: 'NewFirst' });
  });
});

describe('userService - deleteCurrentUser', () => {
  test('should delete user successfully', async () => {
    const userId = 1;

    mockDeleteUser.mockResolvedValue({
      id: 1,
      email: 'deleted@student.edu'
    });

    await deleteCurrentUser(userId);

    expect(mockDeleteUser).toHaveBeenCalledWith(userId);
  });

  test('should throw 404 if user not found', async () => {
    const userId = 999;

    mockDeleteUser.mockResolvedValue(null);

    await expect(
      deleteCurrentUser(userId)
    ).rejects.toThrow('User not found');

    try {
      await deleteCurrentUser(userId);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});

describe('userService - getCurrentUserListings', () => {
  test('should return user listings', async () => {
    const userId = 1;
    const mockListings = [
      { id: 1, title: 'Item 1', price: 10.00 },
      { id: 2, title: 'Item 2', price: 20.00 }
    ];

    mockFindListingsByUserId.mockResolvedValue(mockListings);

    const result = await getCurrentUserListings(userId);

    expect(result).toEqual(mockListings);
    expect(mockFindListingsByUserId).toHaveBeenCalledWith(userId);
  });

  test('should return empty array if no listings', async () => {
    const userId = 1;

    mockFindListingsByUserId.mockResolvedValue([]);

    const result = await getCurrentUserListings(userId);

    expect(result).toEqual([]);
  });
});

describe('userService - updateUserRole', () => {
  test('should update user role successfully', async () => {
    const userId = 1;
    const newRole = 'ADMIN';

    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      role: 'USER'
    };

    const mockUpdatedUser = {
      id: 1,
      email: 'test@student.edu',
      role: 'ADMIN'
    };

    mockFindUserById.mockResolvedValue(mockUser);
    mockUpdateUser.mockResolvedValue(mockUpdatedUser);

    const result = await updateUserRole(userId, newRole);

    expect(result.role).toBe('ADMIN');
    expect(mockUpdateUser).toHaveBeenCalledWith(userId, { role: newRole });
  });

  test('should throw 404 if user not found', async () => {
    const userId = 999;
    const newRole = 'ADMIN';

    mockFindUserById.mockResolvedValue(null);

    await expect(
      updateUserRole(userId, newRole)
    ).rejects.toThrow('User not found');

    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});