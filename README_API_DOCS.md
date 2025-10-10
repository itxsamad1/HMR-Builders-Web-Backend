# HMR Builders API Documentation

## 📚 Documentation Files

This directory contains comprehensive API documentation for the HMR Builders Real Estate Tokenization Platform:

### 1. **API_DOCUMENTATION.md** - Complete API Reference
- **Purpose**: Comprehensive documentation of all API endpoints
- **Audience**: Frontend developers, mobile developers, API integrators
- **Contents**: 
  - Detailed endpoint descriptions
  - Request/response examples
  - Authentication requirements
  - API flows and dependencies
  - Error handling guidelines

### 2. **API_QUICK_REFERENCE.md** - Quick Reference Guide
- **Purpose**: Quick lookup for commonly used endpoints
- **Audience**: Frontend developers during development
- **Contents**:
  - Most frequently used endpoints
  - Common API flows
  - Response format examples
  - Development tips

### 3. **HMR_API_Collection.postman_collection.json** - Postman Collection
- **Purpose**: Ready-to-use API collection for testing
- **Audience**: Frontend developers, QA testers
- **Contents**:
  - Pre-configured API requests
  - Environment variables
  - Example request bodies
  - Test scenarios

### 4. **test-api.js** - API Testing Script
- **Purpose**: Automated testing of all API endpoints
- **Audience**: Developers, QA testers
- **Contents**:
  - Node.js script to test all endpoints
  - Validation of API responses
  - Error detection and reporting

## 🚀 Getting Started

### For Frontend Developers

1. **Start with Quick Reference**: Read `API_QUICK_REFERENCE.md` first
2. **Import Postman Collection**: Import `HMR_API_Collection.postman_collection.json` into Postman
3. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3001/api`
   - `userId`: `a6702919-c381-4ebe-881a-4c3045d5f551` (for testing)
4. **Test API Endpoints**: Use Postman collection to test endpoints
5. **Refer to Full Documentation**: Use `API_DOCUMENTATION.md` for detailed information

### For Mobile Developers

1. **Focus on User-Specific Endpoints**: Use endpoints with `:userId` parameter
2. **No Authentication Required**: Most endpoints work without authentication for demo
3. **Key Endpoints**:
   - `GET /users/profile/:userId`
   - `GET /users/wallet/:userId`
   - `GET /investments/user/:userId`
   - `GET /wallet-transactions/user/:userId`
   - `GET /payment-methods/user/:userId`
   - `GET /portfolio/stats/:userId`

## 🔧 API Testing

### Using Postman
1. Import the collection file
2. Set environment variables
3. Run individual requests or entire collection
4. Check responses for expected data structure

### Using the Test Script
```bash
# Make sure the backend server is running
cd HMR-Builders-Web-Backend
npm start

# In another terminal, run the test script
node test-api.js
```

### Manual Testing with curl
```bash
# Test properties endpoint
curl "http://localhost:3001/api/properties?limit=5"

# Test user portfolio
curl "http://localhost:3001/api/portfolio/stats/a6702919-c381-4ebe-881a-4c3045d5f551"

# Test deposit (this will create a real transaction)
curl -X POST "http://localhost:3001/api/wallet-transactions/deposit" \
  -H "Content-Type: application/json" \
  -d '{"userId":"a6702919-c381-4ebe-881a-4c3045d5f551","amount":1000,"paymentMethodId":"8b63621d-c8da-498a-af89-ee2afd04d1a2"}'
```

## 📊 API Overview

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-vercel-app.vercel.app/api`

### Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Note**: Currently disabled for demo purposes

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message" // optional
}
```

### Error Format
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error description"
}
```

## 🎯 Key Features

### 1. User Management
- User registration and login
- Profile management
- KYC status tracking
- Multi-user support with profile switching

### 2. Property Management
- Property listing with filters
- Featured properties
- Property details and statistics
- Dynamic filter options from database

### 3. Investment System
- Investment creation and tracking
- Portfolio statistics
- ROI calculations
- Investment history

### 4. Wallet System
- Deposit and withdrawal functionality
- Transaction history
- Balance tracking
- Payment method management

### 5. Calculator Tools
- ROI calculations
- Investment scenario planning
- Cost breakdown analysis

## 🔄 Common API Flows

### 1. User Onboarding
```
Register → Login → Get Profile → Add Payment Method → Deposit Funds
```

### 2. Property Investment
```
Browse Properties → View Details → Calculate ROI → Create Investment
```

### 3. Portfolio Management
```
Get Portfolio Stats → View Investments → Check Transactions → Monitor Performance
```

### 4. Wallet Operations
```
Check Balance → Add Payment Method → Deposit/Withdraw → View History
```

## 🚨 Important Notes

### Current Status
- **Authentication**: Disabled for demo purposes
- **User Separation**: Each user has separate data
- **Database**: Using Neon PostgreSQL
- **CORS**: Enabled for all origins

### Development Tips
1. **Always check `success` field** in API responses
2. **Handle errors gracefully** - show user-friendly messages
3. **Implement loading states** for all API calls
4. **Use React Query** for caching and state management
5. **Validate data** before sending to API

### Testing Users
- `a6702919-c381-4ebe-881a-4c3045d5f551` - Robas Ahmed (has payment methods)
- `b7814020-d492-5fcf-992b-5d4156e6f662` - Sarah Khan
- `cff12952-dd79-49de-a831-ee2ff12204f6` - Ahmed Hassan

## 📞 Support

### For API Issues
1. Check server logs for detailed error messages
2. Use the test script to identify failing endpoints
3. Verify request format matches documentation
4. Check if backend server is running

### For Development Questions
1. Refer to the complete documentation
2. Check the Postman collection for examples
3. Contact the backend development team
4. Review the source code in `/routes` directory

## 🔄 Updates

This documentation is updated whenever:
- New endpoints are added
- Existing endpoints are modified
- API response formats change
- Authentication requirements change

**Last Updated**: October 2024  
**API Version**: 1.0.0  
**Backend Version**: Latest

---

Happy coding! 🚀
