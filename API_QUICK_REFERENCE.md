# HMR Builders API - Quick Reference Guide

## Base URL: `http://localhost:3001/api`

## 🚀 Most Used Endpoints

### Properties
```javascript
// Get all properties with filters
GET /properties?page=1&limit=12&status=active&city=Karachi

// Get featured properties
GET /properties/featured

// Get property by ID
GET /properties/:id

// Get filter options
GET /properties/filter-options
```

### User Data
```javascript
// Get user profile
GET /users/profile/:userId

// Get user wallet
GET /users/wallet/:userId

// Get all users (for demo)
GET /users/all
```

### Portfolio & Investments
```javascript
// Get portfolio stats
GET /portfolio/stats/:userId

// Get user investments
GET /investments/user/:userId

// Create investment
POST /investments
Body: { propertyId, investmentAmount, paymentMethodId }
```

### Wallet Operations
```javascript
// Get user transactions
GET /wallet-transactions/user/:userId?type=deposit&limit=10

// Deposit funds
POST /wallet-transactions/deposit
Body: { userId, amount, paymentMethodId, description }

// Withdraw funds
POST /wallet-transactions/withdrawal
Body: { userId, amount, paymentMethodId, description }
```

### Payment Methods
```javascript
// Get user payment methods
GET /payment-methods/user/:userId

// Add payment method
POST /payment-methods
Body: { cardType, cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, billingAddress }
```

## 🔄 Common API Flows

### 1. Property Investment Flow
```javascript
// 1. Get properties
const properties = await fetch('/api/properties?status=active');

// 2. Get property details
const property = await fetch(`/api/properties/${propertyId}`);

// 3. Calculate ROI
const roi = await fetch('/api/calculator/roi', {
  method: 'POST',
  body: JSON.stringify({ propertyId, investmentAmount })
});

// 4. Get payment methods
const paymentMethods = await fetch(`/api/payment-methods/user/${userId}`);

// 5. Create investment
const investment = await fetch('/api/investments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ propertyId, investmentAmount, paymentMethodId })
});
```

### 2. Wallet Operations Flow
```javascript
// 1. Get wallet balance
const wallet = await fetch(`/api/users/wallet/${userId}`);

// 2. Get payment methods
const paymentMethods = await fetch(`/api/payment-methods/user/${userId}`);

// 3. Deposit funds
const deposit = await fetch('/api/wallet-transactions/deposit', {
  method: 'POST',
  body: JSON.stringify({ userId, amount: 10000, paymentMethodId })
});

// 4. Get transaction history
const transactions = await fetch(`/api/wallet-transactions/user/${userId}`);
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message" // optional
}
```

### Error Response
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🔑 API Access

### No Authentication Required
- All endpoints are currently open for demo purposes
- User-specific endpoints require `userId` parameter
- Property browsing and calculator endpoints
- Support FAQ and contact forms

## 🎯 Key User IDs for Testing
- `a6702919-c381-4ebe-881a-4c3045d5f551` - Robas Ahmed (has payment methods)
- `b7814020-d492-5fcf-992b-5d4156e6f662` - Sarah Khan
- `cff12952-dd79-49de-a831-ee2ff12204f6` - Ahmed Hassan

## 🚨 Important Notes

1. **User ID Required**: Most endpoints require `userId` in request body or URL
2. **No Authentication**: All endpoints are open for demo purposes
3. **CORS Enabled**: Frontend can make requests from any origin
4. **Error Handling**: Always check `success` field in response
5. **Data Validation**: Validate data before sending to API

## 📱 Mobile App Specific Endpoints

These endpoints are designed for mobile app usage:
- `GET /users/profile/:userId`
- `GET /users/wallet/:userId`
- `GET /investments/user/:userId`
- `GET /wallet-transactions/user/:userId`
- `GET /payment-methods/user/:userId`
- `GET /portfolio/stats/:userId`

## 🔧 Development Tips

1. **Use React Query**: For caching and state management
2. **Error Boundaries**: Implement proper error handling
3. **Loading States**: Show loading indicators for all API calls
4. **Optimistic Updates**: Update UI before API response
5. **Retry Logic**: Implement retry for failed requests
6. **User Management**: Handle user switching and data isolation

## 📞 Support

For API questions or issues:
- Check the full documentation: `API_DOCUMENTATION.md`
- Test endpoints using Postman or curl
- Check server logs for detailed error messages
- Contact backend development team
