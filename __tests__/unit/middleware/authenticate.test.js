import { describe, test, expect, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Set environment variables FIRST
process.env.JWT_SECRET = 'test-secret-key-123';

// Import the middleware
const { authenticate } = await import('../../../src/middleware/authenticate.js');

describe('authenticate middleware', () => {
  test('should call next() with valid token', () => {
    const token = jwt.sign({ id: 1, role: 'USER' }, process.env.JWT_SECRET);
    
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {};
    const next = jest.fn();
    
    authenticate(req, res, next);
    
    // Should add user to request
    expect(req.user).toEqual({ id: 1, role: 'USER' });
    
    // Should call next()
    expect(next).toHaveBeenCalled();
  });

  test('should throw 401 if no authorization header', () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();
    
    expect(() => {
      authenticate(req, res, next);
    }).toThrow('Not authenticated');
  });

  test('should throw 401 if authorization header malformed', () => {
    const req = {
      headers: {
        authorization: 'InvalidFormat token123'
      }
    };
    const res = {};
    const next = jest.fn();
    
    expect(() => {
      authenticate(req, res, next);
    }).toThrow('Not authenticated');
  });

  test('should throw 401 for invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid.token.here'
      }
    };
    const res = {};
    const next = jest.fn();
    
    expect(() => {
      authenticate(req, res, next);
    }).toThrow('Not authenticated');
  });

  test('should extract correct user ID and role from token', () => {
    const token = jwt.sign(
      { id: 42, role: 'ADMIN' },
      process.env.JWT_SECRET
    );
    
    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {};
    const next = jest.fn();
    
    authenticate(req, res, next);
    
    expect(req.user.id).toBe(42);
    expect(req.user.role).toBe('ADMIN');
  });

  test('should throw 401 with error status property', () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();
    
    try {
      authenticate(req, res, next);
      fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toBe('Not authenticated');
      expect(error.status).toBe(401);
    }
  });
});