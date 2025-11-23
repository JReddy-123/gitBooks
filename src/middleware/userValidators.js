import { body, param, oneOf } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateUser = [
  body('email')
    .exists({ values: 'falsy' })
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email is not valid')
    .normalizeEmail(),

  body('password')
    .exists({ values: 'falsy' })
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters'),
  
  body('firstName')
    .if((value, { req }) => req.path === '/signup')
    .exists({ values: 'falsy' })
    .withMessage('First name is required')
    .bail()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  
  body('lastName')
    .if((value, { req }) => req.path === '/signup')
    .exists({ values: 'falsy' })
    .withMessage('Last name is required')
    .bail()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  
  body('phone')
  .optional({ values: 'falsy' })
  .custom((value) => {
    if (!value || value === '') return true;
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(value);
  })
  .withMessage('Phone number is not valid'),

  handleValidationErrors,
];

export const validateUpdateUser = [
  oneOf(
    [
      body('email').exists({ values: 'falsy' }),
      body('password').exists({ values: 'falsy' }),
      body('firstName').exists({ values: 'falsy' }),
      body('lastName').exists({ values: 'falsy' }),
      body('phone').exists({ values: 'falsy' })
    ],
    {
      message: 'At least one field must be provided for update'
    }
  ),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email is not valid')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      return /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(value);
    })
    .withMessage('Phone number is not valid'),
  
  handleValidationErrors,
];

export const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User id must be a positive integer'),
  handleValidationErrors,
];

export const validateUserRole = [
  body('role')
    .exists({ values: 'falsy' })
    .withMessage('Role is required')
    .bail()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),
  handleValidationErrors,
];