const express = require('express');
const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
  const apiDocs = {
    title: 'HMR Builders Web Backend API',
    version: '1.0.0',
    description: 'Real Estate Tokenization Platform API',
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-vercel-app.vercel.app' 
      : `http://localhost:${process.env.PORT || 3001}`,
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/google': 'Google OAuth login',
        'POST /api/auth/refresh': 'Refresh JWT token',
        'GET /api/auth/me': 'Get current user profile',
        'POST /api/auth/logout': 'Logout user'
      },
      properties: {
        'GET /api/properties': 'Get all properties with filters',
        'GET /api/properties/featured': 'Get featured properties',
        'GET /api/properties/:id': 'Get property by ID',
        'GET /api/properties/slug/:slug': 'Get property by slug',
        'GET /api/properties/:id/stats': 'Get property investment statistics',
        'POST /api/properties': 'Create property (Admin only)',
        'PUT /api/properties/:id': 'Update property (Admin only)',
        'DELETE /api/properties/:id': 'Delete property (Admin only)'
      },
      investments: {
        'GET /api/investments/my-investments': 'Get user investments',
        'GET /api/investments/:id': 'Get investment by ID',
        'POST /api/investments': 'Create new investment',
        'PATCH /api/investments/:id/status': 'Update investment status',
        'PATCH /api/investments/:id/cancel': 'Cancel investment',
        'GET /api/investments/portfolio/summary': 'Get portfolio summary'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'PUT /api/users/change-password': 'Change password',
        'POST /api/users/kyc': 'Submit KYC documents',
        'GET /api/users/kyc/status': 'Get KYC status',
        'GET /api/users/activity': 'Get user activity',
        'GET /api/users/notifications': 'Get user notifications'
      },
      admin: {
        'GET /api/admin/dashboard': 'Get dashboard statistics',
        'GET /api/admin/users': 'Get all users',
        'GET /api/admin/properties': 'Get all properties',
        'GET /api/admin/investments': 'Get all investments',
        'GET /api/admin/analytics': 'Get analytics data'
      }
    },
    authentication: {
      type: 'Bearer Token',
      description: 'Include JWT token in Authorization header',
      example: 'Authorization: Bearer <your-jwt-token>'
    },
    responseFormat: {
      success: {
        message: 'Success message',
        data: 'Response data object'
      },
      error: {
        error: 'Error type',
        message: 'Error description',
        details: 'Additional error details (optional)'
      }
    },
    statusCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    }
  };

  res.json(apiDocs);
});

module.exports = router;
