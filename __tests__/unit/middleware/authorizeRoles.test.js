import { describe, test, expect, jest } from '@jest/globals';

// Import the middleware
const { authorizeRoles } = await import('../../../src/middleware/authorizeRoles.js');

describe('authorizeRoles middleware', () => {
  test('should allow USER to access USER routes', () => {
    const middleware = authorizeRoles('USER');
    
    const req = { user: { id: 1, role: 'USER' } };
    const res = {};
    const next = jest.fn();
    
    const result = middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(result).toBeUndefined(); // Should just call next()
  });

  test('should allow ADMIN to access ADMIN routes', () => {
    const middleware = authorizeRoles('ADMIN');
    
    const req = { user: { id: 1, role: 'ADMIN' } };
    const res = {};
    const next = jest.fn();
    
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('should throw 403 when USER tries ADMIN route', () => {
    const middleware = authorizeRoles('ADMIN');
    
    const req = { user: { id: 1, role: 'USER' } };
    const res = {};
    const next = jest.fn();
    
    expect(() => {
      middleware(req, res, next);
    }).toThrow('Forbidden: insufficient permission');
    
    // Should NOT call next()
    expect(next).not.toHaveBeenCalled();
  });

  test('should throw 403 with error status property', () => {
    const middleware = authorizeRoles('ADMIN');
    
    const req = { user: { id: 1, role: 'USER' } };
    const res = {};
    const next = jest.fn();
    
    try {
      middleware(req, res, next);
      fail('Should have thrown error');
    } catch (error) {
      expect(error.message).toBe('Forbidden: insufficient permission');
      expect(error.status).toBe(403);
    }
  });

  test('should allow multiple roles', () => {
    const middleware = authorizeRoles('USER', 'ADMIN');
    
    // Test USER role
    const req1 = { user: { id: 1, role: 'USER' } };
    const next1 = jest.fn();
    middleware(req1, {}, next1);
    expect(next1).toHaveBeenCalledTimes(1);
    
    // Test ADMIN role
    const req2 = { user: { id: 2, role: 'ADMIN' } };
    const next2 = jest.fn();
    middleware(req2, {}, next2);
    expect(next2).toHaveBeenCalledTimes(1);
  });
});