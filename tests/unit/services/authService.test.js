import { describe, test, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the repository before importing authService
const mockCreateUser = jest.fn();
const mockFindUserByEmail = jest.fn();

jest.unstable_mockModule('../../../src/repositories/userRepo.js', () => ({
  createUser: mockCreateUser,
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

// Now import authService (after mocking)
const { signUp, logIn } = await import('../../../src/services/authService.js');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-123';
  process.env.JWT_EXPIRES_IN = '1h';
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService - signUp', () => {
  test('should create user and return token', async () => {
    // Mock successful user creation
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      role: 'USER',
    };
    
    mockCreateUser.mockResolvedValue(mockUser);
    
    // Call signUp
    const result = await signUp({
      email: 'test@student.edu',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: null,
    });
    
    // Check result structure
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    
    // Check user data
    expect(result.user).toEqual(mockUser);
    
    // Check token is valid JWT
    expect(typeof result.accessToken).toBe('string');
    expect(result.accessToken.split('.').length).toBe(3);
    
    // Verify createUser was called with hashed password
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
    const callArgs = mockCreateUser.mock.calls[0][0];
    expect(callArgs.email).toBe('test@student.edu');
    expect(callArgs.password).not.toBe('password123'); // Should be hashed
    expect(callArgs.firstName).toBe('Test');
    expect(callArgs.lastName).toBe('User');
  });

  test('should hash password before storing', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    };
    
    mockCreateUser.mockResolvedValue(mockUser);
    
    await signUp({
      email: 'test@student.edu',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });
    
    // Get the password that was passed to createUser
    const hashedPassword = mockCreateUser.mock.calls[0][0].password;
    
    // Verify it's different from original
    expect(hashedPassword).not.toBe('password123');
    
    // Verify it's a valid bcrypt hash
    expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    
    // Verify we can compare it
    const isMatch = await bcrypt.compare('password123', hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('should include user ID and role in token', async () => {
    const mockUser = {
      id: 42,
      email: 'admin@student.edu',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    };
    
    mockCreateUser.mockResolvedValue(mockUser);
    
    const result = await signUp({
      email: 'admin@student.edu',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
    });
    
    // Decode token
    const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET);
    
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('ADMIN');
  });

  test('should throw error for duplicate email', async () => {
    // Mock Prisma unique constraint error for email
    const prismaError = new MockPrismaError('P2002', ['email']);
    mockCreateUser.mockRejectedValue(prismaError);
    
    // Should throw custom error
    await expect(
      signUp({
        email: 'existing@student.edu',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
    ).rejects.toThrow('Email already in use');
  });

  test('should throw error for duplicate phone', async () => {
    // Mock Prisma unique constraint error for phone
    const prismaError = new MockPrismaError('P2002', ['phone']);
    mockCreateUser.mockRejectedValue(prismaError);
    
    await expect(
      signUp({
        email: 'test@student.edu',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
      })
    ).rejects.toThrow('Phone number already in use');
  });

  test('should set phone to null if not provided', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      role: 'USER',
    };
    
    mockCreateUser.mockResolvedValue(mockUser);
    
    await signUp({
      email: 'test@student.edu',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '',  // Empty string
    });
    
    // Check that phone was converted to null
    const callArgs = mockCreateUser.mock.calls[0][0];
    expect(callArgs.phone).toBeNull();
  });
});

describe('authService - logIn', () => {
  test('should login with correct credentials', async () => {
    // Mock user from database
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
    };
    
    mockFindUserByEmail.mockResolvedValue(mockUser);
    
    // Call logIn
    const result = await logIn('test@student.edu', 'password123');
    
    // Check result
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    
    // Check user data (password should be removed)
    expect(result.user.email).toBe('test@student.edu');
    expect(result.user).not.toHaveProperty('password');
    
    // Check token
    expect(typeof result.accessToken).toBe('string');
    
    // Verify findUserByEmail was called
    expect(mockFindUserByEmail).toHaveBeenCalledWith('test@student.edu');
  });

  test('should throw error for non-existent user', async () => {
    mockFindUserByEmail.mockResolvedValue(null);
    
    await expect(
      logIn('nonexistent@student.edu', 'password123')
    ).rejects.toThrow('Invalid credentials');
  });

  test('should throw error for inactive user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      password: await bcrypt.hash('password123', 10),
      isActive: false,  // Inactive!
    };
    
    mockFindUserByEmail.mockResolvedValue(mockUser);
    
    await expect(
      logIn('test@student.edu', 'password123')
    ).rejects.toThrow('Invalid credentials');
  });

  test('should throw error for incorrect password', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      password: await bcrypt.hash('correct-password', 10),
      isActive: true,
    };
    
    mockFindUserByEmail.mockResolvedValue(mockUser);
    
    await expect(
      logIn('test@student.edu', 'wrong-password')
    ).rejects.toThrow('Invalid credentials');
  });

  test('should not return password in response', async () => {
    const mockUser = {
      id: 1,
      email: 'test@student.edu',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
    };
    
    mockFindUserByEmail.mockResolvedValue(mockUser);
    
    const result = await logIn('test@student.edu', 'password123');
    
    // Password should be excluded
    expect(result.user).not.toHaveProperty('password');
    
    // Other fields should be present
    expect(result.user.email).toBe('test@student.edu');
    expect(result.user.firstName).toBe('Test');
  });

  test('should include correct data in token', async () => {
    const mockUser = {
      id: 99,
      email: 'admin@student.edu',
      password: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
      isActive: true,
    };
    
    mockFindUserByEmail.mockResolvedValue(mockUser);
    
    const result = await logIn('admin@student.edu', 'password123');
    
    // Decode token
    const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET);
    
    expect(decoded.id).toBe(99);
    expect(decoded.role).toBe('ADMIN');
  });

  test('should throw error with status 401', async () => {
    mockFindUserByEmail.mockResolvedValue(null);
    
    try {
      await logIn('test@student.edu', 'password123');
      fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toBe('Invalid credentials');
      expect(error.status).toBe(401);
    }
  });
});