const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  handleValidationErrors
];

// Property validation rules
const validatePropertyCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('propertyType')
    .isIn(['residential', 'commercial', 'mixed-use'])
    .withMessage('Property type must be residential, commercial, or mixed-use'),
  body('pricing.totalValue')
    .notEmpty()
    .withMessage('Total value is required'),
  body('pricing.marketValue')
    .notEmpty()
    .withMessage('Market value is required'),
  body('tokenization.totalTokens')
    .isInt({ min: 1 })
    .withMessage('Total tokens must be a positive integer'),
  body('tokenization.pricePerToken')
    .notEmpty()
    .withMessage('Price per token is required'),
  handleValidationErrors
];

const validatePropertyUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'construction', 'active', 'coming-soon', 'sold-out', 'completed'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

// Investment validation rules
const validateInvestmentCreation = [
  body('propertyId')
    .isMongoId()
    .withMessage('Valid property ID is required'),
  body('tokensPurchased')
    .isInt({ min: 1 })
    .withMessage('Tokens purchased must be a positive integer'),
  body('investmentAmount')
    .isFloat({ min: 0 })
    .withMessage('Investment amount must be a positive number'),
  body('payment.method')
    .isIn(['bank_transfer', 'credit_card', 'debit_card', 'stripe', 'paypal'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validatePropertyFilters = [
  query('status')
    .optional()
    .isIn(['planning', 'construction', 'active', 'coming-soon', 'sold-out', 'completed'])
    .withMessage('Invalid status filter'),
  query('propertyType')
    .optional()
    .isIn(['residential', 'commercial', 'mixed-use'])
    .withMessage('Invalid property type filter'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

// Password validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePropertyCreation,
  validatePropertyUpdate,
  validateInvestmentCreation,
  validatePagination,
  validatePropertyFilters,
  validateObjectId,
  validateEmail,
  validatePasswordChange
};
