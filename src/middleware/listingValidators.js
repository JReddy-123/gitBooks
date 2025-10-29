import { param, query, body, oneOf } from 'express-validator';
import { handleValidationErrors } from './handleValidationErrors.js';

export const validateListingId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Listing id must be a positive integer'),
  handleValidationErrors,
];

const allowedSortFields = ['id', 'title', 'price', 'createdAt'];
const allowedSortOrders = ['asc', 'desc'];
const allowedCategories = ['TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'SCHOOL_SUPPLIES', 'OTHER'];
const allowedConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED'];

export const validateListingQuery = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),

  query('category')
    .optional()
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),

  query('condition')
    .optional()
    .isIn(allowedConditions)
    .withMessage(`Condition must be one of: ${allowedConditions.join(', ')}`),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be 0 or greater'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be 0 or greater'),

  query('sortBy')
    .optional()
    .isIn(allowedSortFields)
    .withMessage(`sortBy must be one of: ${allowedSortFields.join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(allowedSortOrders)
    .withMessage(`sortOrder must be one of: ${allowedSortOrders.join(', ')}`),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be 0 or greater'),

  handleValidationErrors,
];

export const validateCreateListing = [
  body('title')
    .exists({ values: 'falsy' })
    .withMessage('Title is required')
    .bail()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .exists({ values: 'falsy' })
    .withMessage('Description is required')
    .bail()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('price')
    .exists({ values: 'falsy' })
    .withMessage('Price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Price must be 0 or greater'),

  body('condition')
    .exists({ values: 'falsy' })
    .withMessage('Condition is required')
    .bail()
    .isIn(allowedConditions)
    .withMessage(`Condition must be one of: ${allowedConditions.join(', ')}`),

  body('category')
    .exists({ values: 'falsy' })
    .withMessage('Category is required')
    .bail()
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .bail()
    .custom((images) => images.length <= 5)
    .withMessage('Maximum 5 images allowed'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  handleValidationErrors,
];

export const validateUpdateListing = [
  oneOf(
    [
      body('title').exists({ values: 'falsy' }),
      body('description').exists({ values: 'falsy' }),
      body('price').exists({ values: 'falsy' }),
      body('condition').exists({ values: 'falsy' }),
      body('category').exists({ values: 'falsy' }),
      body('images').exists({ values: 'falsy' }),
      body('isAvailable').exists({ values: 'falsy' }),
    ],
    {
      message: 'At least one field must be provided for update',
    },
  ),

  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be 0 or greater'),

  body('condition')
    .optional()
    .isIn(allowedConditions)
    .withMessage(`Condition must be one of: ${allowedConditions.join(', ')}`),

  body('category')
    .optional()
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .bail()
    .custom((images) => images.length <= 5)
    .withMessage('Maximum 5 images allowed'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),

  handleValidationErrors,
];