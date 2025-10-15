# HMR Builders Web Backend API Documentation

## Overview
This is the complete API documentation for the HMR Builders Real Estate Tokenization Platform. The API provides endpoints for user management, property management, investment tracking, wallet operations, and portfolio management.

**Base URL:** `http://localhost:3001/api` (Development)  
**Content-Type:** `application/json`  
**Authentication:** None (Demo Mode)

---

## Table of Contents
1. [User Management](#user-management)
2. [Properties](#properties)
3. [Investments](#investments)
4. [Portfolio](#portfolio)
5. [Wallet & Transactions](#wallet--transactions)
6. [Payment Methods](#payment-methods)
7. [Calculator](#calculator)
8. [Support](#support)
9. [Admin](#admin)
10. [API Flows](#api-flows)
11. [Error Handling](#error-handling)

---

## User Management

### GET /users/profile/:userId
Get user profile by ID (for mobile app).

**Parameters:**
- `userId` (string): User ID

### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  }
}
```

### GET /users/wallet/:userId
Get user wallet information by ID.

**Parameters:**
- `userId` (string): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 50000,
    "totalInvestment": 100000,
    "totalTokens": 1500,
    "totalReturns": 15000
  }
}
```

### GET /users/all
Get list of all users (for profile switching in demo).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "kycStatus": "verified"
      }
    ]
  }
}
```

---

## Properties

### GET /properties
Get all properties with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Property status filter
- `property_type` (string): Property type filter
- `city` (string): City filter
- `featured` (boolean): Featured properties only

**Example:**
```
GET /properties?page=1&limit=12&status=active&property_type=residential&city=Karachi
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid",
        "title": "Marina Heights Tower",
        "slug": "marina-heights-tower",
        "location": "Marina District, Karachi",
        "price": "PKR 150.0M",
        "marketValue": "PKR 150.0M",
        "roi": "12.5%",
        "type": "residential",
        "image": "https://example.com/image.jpg",
        "status": "active",
        "tokens": 10000,
        "availableTokens": 2500,
        "minInvestment": "PKR 50K",
        "fundingPercentage": 75,
        "investorCount": 750
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProperties": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /properties/featured
Get featured properties.

### GET /properties/:id
Get property by ID.

### GET /properties/slug/:slug
Get property by slug.

### GET /properties/filter-options
Get available filter options for properties.

**Response:**
```json
{
  "success": true,
  "data": {
    "cities": [
      { "value": "", "label": "All Cities" },
      { "value": "Karachi", "label": "Karachi" }
    ],
    "propertyTypes": [
      { "value": "", "label": "All Types" },
      { "value": "residential", "label": "Residential" }
    ],
    "statuses": [
      { "value": "", "label": "All Status" },
      { "value": "active", "label": "Active" }
    ]
  }
}
```

---

## Investments

### GET /investments/user/:userId
Get investments by user ID (for mobile app).

**Parameters:**
- `userId` (string): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "propertyTitle": "Marina Heights Tower",
      "investmentAmount": 50000,
      "tokensPurchased": 100,
      "pricePerToken": 500,
      "status": "active",
      "totalEarned": 5000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /investments
Create new investment.

**Request Body:**
```json
{
  "propertyId": "uuid",
  "investmentAmount": 50000,
  "paymentMethodId": "uuid"
}
```

### GET /investments/:id
Get investment by ID.

### PATCH /investments/:id/status
Update investment status (admin only).

### PATCH /investments/:id/cancel
Cancel investment.

---

## Portfolio

### GET /portfolio/stats/:userId
Get user portfolio statistics.

**Parameters:**
- `userId` (string): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "totalInvestment": 320000,
    "currentValue": 352000,
    "totalROI": 10,
    "totalTokens": 500,
    "activeInvestments": 4,
    "totalInvestmentChange": 6,
    "totalInvestmentChangeType": "positive",
    "currentValueChange": 8.2,
    "currentValueChangeType": "positive",
    "totalROIChange": 2.1,
    "totalROIChangeType": "positive",
    "activeInvestmentsChange": 1,
    "activeInvestmentsChangeType": "positive"
  }
}
```

---

## Wallet & Transactions

### GET /wallet-transactions/user/:userId
Get user's wallet transactions.

**Parameters:**
- `userId` (string): User ID

**Query Parameters:**
- `type` (string): Transaction type (deposit, withdrawal, investment, return)
- `status` (string): Transaction status (pending, completed, failed)
- `limit` (number): Number of transactions to return
- `offset` (number): Number of transactions to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "transactionType": "deposit",
      "amount": 10000,
      "currency": "PKR",
      "amountInPKR": 10000,
      "status": "completed",
      "description": "Wallet top-up",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /wallet-transactions/deposit
Create wallet deposit.

**Request Body:**
```json
{
  "userId": "uuid",
  "amount": 10000,
  "currency": "PKR",
  "paymentMethodId": "uuid",
  "description": "Wallet top-up"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transactionId": "uuid",
    "amount": 10000,
    "currency": "PKR",
    "amountInPKR": 10000,
    "status": "completed"
  }
}
```

### POST /wallet-transactions/withdrawal
Create wallet withdrawal.

**Request Body:**
```json
{
  "userId": "uuid",
  "amount": 5000,
  "currency": "PKR",
  "paymentMethodId": "uuid",
  "description": "Wallet withdrawal"
}
```

### GET /wallet-transactions/balance/current
Get current wallet balance.

---

## Payment Methods

### GET /payment-methods
Get all payment methods (demo - returns first user's methods).

### GET /payment-methods/user/:userId
Get payment methods for specific user.

**Parameters:**
- `userId` (string): User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cardType": "visa",
      "cardNumberMasked": "****-****-****-1234",
      "cardHolderName": "John Doe",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "currency": "PKR",
      "isDefault": true,
      "isVerified": true,
      "status": "active"
    }
  ]
}
```

### POST /payment-methods
Add new payment method.

**Request Body:**
```json
{
  "cardType": "visa",
  "cardNumber": "4111111111111111",
  "cardHolderName": "John Doe",
  "expiryMonth": 12,
  "expiryYear": 2026,
  "cvv": "123",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  }
}
```

---

## Calculator

### POST /calculator/roi
Calculate ROI for property investment.

**Request Body:**
```json
{
  "propertyId": "uuid",
  "investmentAmount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": 100,
    "totalCosts": 1750,
    "costBreakdown": {
      "purchaseFee": 1000,
      "runningFee": 500,
      "transactionFee": 250
    },
    "projectedReturns": {
      "year1": 2000,
      "year2": 4000,
      "year3": 6000,
      "year4": 8000,
      "year5": 10000
    }
  }
}
```

### POST /calculator/investment
Calculate investment scenarios for different amounts.

**Request Body:**
```json
{
  "propertyId": "uuid",
  "investmentAmounts": [10000, 25000, 50000, 100000]
}
```

---

## Support

### POST /support/contact
Submit support request.

**Request Body:**
```json
{
  "type": "technical",
  "subject": "Login Issue",
  "message": "I'm having trouble logging in to my account"
}
```

### GET /support/faq
Get frequently asked questions.

---

## Admin

### GET /admin/dashboard
Get admin dashboard statistics (admin only).

### GET /admin/users
Get all users (admin only).

### GET /admin/properties
Get all properties (admin only).

### GET /admin/investments
Get all investments (admin only).

---

## API Flows

### 1. Property Investment Flow
```
1. GET /properties → Browse available properties
2. GET /properties/:id → View property details
3. POST /calculator/roi → Calculate investment returns
4. GET /payment-methods/user/:userId → Get payment methods
5. POST /investments → Create investment
6. POST /wallet-transactions/deposit → Add funds to wallet
```

### 2. Portfolio Management Flow
```
1. GET /portfolio/stats/:userId → Get portfolio statistics
2. GET /investments/user/:userId → Get investment history
3. GET /wallet-transactions/user/:userId → Get transaction history
4. GET /users/wallet/:userId → Get wallet balance
```

### 3. Wallet Operations Flow
```
1. GET /payment-methods/user/:userId → Get payment methods
2. POST /payment-methods → Add new payment method (if needed)
3. POST /wallet-transactions/deposit → Deposit funds
4. POST /wallet-transactions/withdrawal → Withdraw funds
5. GET /wallet-transactions/user/:userId → View transaction history
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error details (optional)"
}
```

### Common Error Types
- `ValidationError`: Invalid request data
- `AuthenticationError`: Invalid or missing authentication
- `AuthorizationError`: Insufficient permissions
- `NotFoundError`: Resource not found
- `ConflictError`: Resource already exists
- `InternalError`: Server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## API Access

### All Endpoints Open (Demo Mode)
- No authentication required for any endpoint
- User-specific endpoints require `userId` parameter
- All endpoints are accessible for demo purposes

---

## Frontend Integration Notes

### 1. User Context Management
- Store user data in context/state management
- Handle user switching and data isolation
- Manage user-specific API calls

### 2. API Client Setup
```javascript
// Example axios configuration
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// No authentication required for demo
```

### 3. Error Handling
- Implement global error handling for API responses
- Show user-friendly error messages
- Handle network errors and timeouts

### 4. Loading States
- Implement loading states for all API calls
- Use React Query or similar for caching and state management
- Implement optimistic updates where appropriate

### 5. Data Validation
- Validate form data before sending to API
- Implement client-side validation rules
- Show validation errors to users

---

## Rate Limiting & Best Practices

### Rate Limiting
- No specific rate limiting implemented
- Consider implementing for production use

### Best Practices
1. Always handle errors gracefully
2. Implement proper loading states
3. Cache data when appropriate
4. Validate data on both client and server
5. Use proper HTTP methods
6. Implement proper user management
7. Handle user data isolation
8. Implement retry logic for failed requests

---

## Testing

### Test Endpoints
You can test the API using:
- Postman
- curl commands
- Frontend application
- API documentation endpoint: `GET /api/docs`

### Example curl Commands
```bash
# Get properties
curl -X GET "http://localhost:3001/api/properties"

# Get user portfolio stats
curl -X GET "http://localhost:3001/api/portfolio/stats/a6702919-c381-4ebe-881a-4c3045d5f551"

# Create deposit
curl -X POST "http://localhost:3001/api/wallet-transactions/deposit" \
  -H "Content-Type: application/json" \
  -d '{"userId":"a6702919-c381-4ebe-881a-4c3045d5f551","amount":10000,"paymentMethodId":"8b63621d-c8da-498a-af89-ee2afd04d1a2"}'
```

---

This documentation covers all available endpoints and their usage. For any questions or clarifications, please refer to the source code or contact the backend development team.
