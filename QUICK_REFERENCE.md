# HMR Builders - Business Logic Quick Reference

A condensed reference guide for developers to quickly understand the business logic flow.

## Table of Contents
- [Quick System Overview](#quick-system-overview)
- [Core Workflows](#core-workflows)
- [Database Tables](#database-tables)
- [API Endpoints Summary](#api-endpoints-summary)
- [Business Rules](#business-rules)
- [Common Scenarios](#common-scenarios)

---

## Quick System Overview

### What is HMR Builders?
A **Real Estate Tokenization Platform** that enables fractional property ownership through digital tokens.

### Key Concepts
- **Properties**: Real estate assets divided into tokens
- **Tokens**: Fractional ownership units (supports decimals, e.g., 0.5 tokens)
- **Wallet**: User's digital balance for investments
- **KYC**: Know Your Customer verification for compliance
- **Investment**: Purchase of property tokens
- **Portfolio**: User's collection of property investments

### Technology Stack
```
Frontend:    React/Next.js (separate repo)
Backend:     Node.js + Express.js
Database:    PostgreSQL (NeonDB)
Auth:        JWT + Google OAuth
Payments:    Stripe, Bank Transfer
Email:       Nodemailer
Storage:     Local (planned: Cloudinary/S3)
```

---

## Core Workflows

### 1. User Registration
```
Register → Create Account → Generate JWT → Create Wallet → Return Token
```
- **Route**: `POST /api/auth/register`
- **Input**: email, password, name
- **Output**: JWT token, user profile, wallet
- **KYC Status**: Set to 'pending'

### 2. User Login
```
Login → Verify Password → Check Active → Generate JWT → Return Token
```
- **Route**: `POST /api/auth/login`
- **Input**: email, password
- **Output**: JWT token, user profile
- **Session**: 7-day access token, 30-day refresh token

### 3. KYC Verification
```
Upload Photos → Enter Details → Submit → Admin Review → Approve/Reject
```
- **Route**: `POST /api/kyc/submit`
- **Required**: Face photo, CNIC photo, CNIC number, Card details
- **Status Flow**: pending → verified/rejected
- **Blocked Until Verified**: Investments, withdrawals

### 4. Add Funds to Wallet
```
Choose Payment → Process Payment → Create Transaction → Update Balance
```
- **Route**: `POST /api/wallet-transactions/deposit`
- **Methods**: Bank Transfer, Credit/Debit Card, Stripe
- **Currencies**: PKR, USD, EUR, GBP (converted to PKR)
- **Admin Approval**: Required for bank transfers

### 5. Buy Property Tokens
```
Select Property → Enter Amount → Check Balance → Deduct Funds → Allocate Tokens
```
- **Route**: `POST /api/wallet/buy-tokens`
- **Input**: property_id, amount_pkr OR token_amount
- **Validation**: 
  - Min: 0.001 tokens
  - Balance >= amount_pkr
  - available_tokens >= requested
- **Transaction**: Atomic (all-or-nothing)

### 6. View Portfolio
```
Get Investments → Get Holdings → Calculate Returns → Display Summary
```
- **Route**: `GET /api/portfolio/summary`
- **Shows**: 
  - Total invested
  - Current value
  - ROI percentage
  - Property breakdown
  - Dividend history

---

## Database Tables

### Core Tables

#### users
```sql
Primary Key: id (UUID)
Unique: email, google_id
Key Fields:
  - email, password_hash
  - kyc_status (pending/verified/rejected)
  - is_active (boolean)
  - role (user/admin)
```

#### properties
```sql
Primary Key: id (UUID)
Unique: slug
Key Fields:
  - title, description
  - status (planning/construction/active/sold-out/completed)
  - tokenization_total_tokens (integer)
  - tokenization_available_tokens (integer)
  - tokenization_price_per_token (decimal)
  - is_active, is_featured (booleans)
```

#### investments
```sql
Primary Key: id (UUID)
Foreign Keys: user_id → users, property_id → properties
Key Fields:
  - investment_amount (decimal)
  - tokens_purchased (integer)
  - price_per_token (decimal)
  - status (pending/confirmed/active/sold/cancelled)
  - payment_status (pending/processing/completed/failed)
```

#### user_wallets
```sql
Primary Key: id (UUID)
Foreign Key: user_id → users (one-to-one)
Key Fields:
  - total_balance (decimal)
  - available_balance (decimal)
  - locked_balance (decimal)
  - total_tokens (integer)
  - total_investment (decimal)
  - total_returns (decimal)
```

#### wallet_transactions
```sql
Primary Key: id (UUID)
Foreign Key: user_id → users
Key Fields:
  - transaction_type (deposit/withdrawal/investment/dividend/refund)
  - amount (decimal)
  - currency (PKR/USD/EUR/GBP)
  - amount_in_pkr (decimal)
  - status (pending/completed/failed)
```

#### property_tokens
```sql
Composite: user_id + property_id
Key Fields:
  - tokens_owned (decimal - supports fractions!)
  - total_invested_pkr (decimal)
  - current_value_pkr (decimal)
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/google` | Google OAuth | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | No |

### Properties
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/properties` | List all properties | Optional |
| GET | `/api/properties/featured` | Featured properties | No |
| GET | `/api/properties/:slug` | Property details | Optional |
| POST | `/api/properties` | Create property | Admin |

### Investments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/investments` | Create investment | Yes + KYC |
| GET | `/api/investments/my-investments` | User's investments | Yes |
| GET | `/api/investments/:id` | Investment details | Yes |

### Wallet
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/wallet/buy-tokens` | Buy property tokens | Yes + KYC |
| GET | `/api/wallet/holdings/:userId` | Token holdings | No (demo) |
| GET | `/api/wallet/history/:userId` | Purchase history | No (demo) |

### Wallet Transactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/wallet-transactions/deposit` | Deposit funds | Yes |
| POST | `/api/wallet-transactions/withdraw` | Withdraw funds | Yes + KYC |
| GET | `/api/wallet-transactions/:userId` | Transaction history | No (demo) |

### KYC
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/kyc/submit` | Submit KYC data | No (demo) |
| POST | `/api/kyc/upload-image` | Upload KYC image | No (demo) |
| GET | `/api/kyc/status/:userId` | Get KYC status | No (demo) |
| POST | `/api/kyc/update-status` | Update KYC status | Admin |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/properties` | Manage properties | Admin |
| GET | `/api/admin/investments` | View all investments | Admin |

---

## Business Rules

### Investment Rules

```javascript
MINIMUM_INVESTMENT = 0.001 tokens
MAXIMUM_INVESTMENT = available_tokens

// Calculation
if (amount_pkr provided) {
  tokens = amount_pkr / tokenization_price_per_token
} else if (token_amount provided) {
  amount_pkr = token_amount * tokenization_price_per_token
}

// Validation
tokens >= MINIMUM_INVESTMENT
tokens <= available_tokens
wallet.available_balance >= amount_pkr
```

### KYC Rules

```javascript
STATUSES = ['pending', 'verified', 'rejected']

// Required Documents
- face_image_url (photo)
- cnic_number (string)
- cnic_image_url (photo)
- card_number (masked, last 4 visible)
- card_type (visa/mastercard)

// Access Control
CAN_INVEST = kyc_status === 'verified'
CAN_WITHDRAW = kyc_status === 'verified'
CAN_BROWSE = true (no KYC needed)
```

### Wallet Rules

```javascript
// Balance Types
total_balance = available_balance + locked_balance

// Transaction Rules
DEPOSIT: available_balance += amount
WITHDRAWAL: locked_balance += amount (pending admin approval)
INVESTMENT: available_balance -= amount
DIVIDEND: available_balance += amount
REFUND: available_balance += amount

// Withdrawal Approval
Admin approves → locked_balance -= amount, total_balance -= amount
Admin rejects → locked_balance -= amount, available_balance += amount
```

### Property Status Rules

```javascript
// Status Flow
'draft' → 'planning' → 'construction' → 'active' → 'sold-out' → 'completed'

// Investment Allowed
status === 'active' AND 
is_active === true AND 
available_tokens > 0

// Auto Status Update
if (available_tokens === 0) {
  status = 'sold-out'
}
```

---

## Common Scenarios

### Scenario 1: New User Makes First Investment

```
1. User registers
   POST /api/auth/register
   → User created with kyc_status: 'pending'
   → Wallet created with balance: 0

2. User submits KYC
   POST /api/kyc/upload-image (face)
   POST /api/kyc/upload-image (cnic)
   POST /api/kyc/submit (all details)
   → Status: pending

3. Admin approves KYC
   POST /api/kyc/update-status
   → Status: verified

4. User deposits funds
   POST /api/wallet-transactions/deposit
   → Balance: 50,000 PKR

5. User buys tokens
   POST /api/wallet/buy-tokens
   {
     property_id: "abc-123",
     amount_pkr: 10000
   }
   → Tokens purchased: 10000 / 500 = 20 tokens
   → Balance: 40,000 PKR
   → Holdings: 20 tokens in property abc-123
```

### Scenario 2: User Views Portfolio

```
1. Get portfolio summary
   GET /api/portfolio/summary
   
2. Response includes:
   {
     totalInvested: 10000,
     currentValue: 10500,  // 5% appreciation
     roi: 5,
     totalTokens: 20,
     properties: [
       {
         propertyId: "abc-123",
         tokens: 20,
         invested: 10000,
         currentValue: 10500
       }
     ]
   }
```

### Scenario 3: Admin Creates New Property

```
1. Admin creates property
   POST /api/properties
   {
     title: "Luxury Apartment Complex",
     slug: "luxury-apartment-complex",
     property_type: "residential",
     status: "draft",
     pricing_total_value: "50000000",
     tokenization_total_tokens: 10000,
     tokenization_available_tokens: 10000,
     tokenization_price_per_token: "5000",
     ...
   }

2. Admin updates status to active
   PUT /api/properties/:id
   { status: "active", is_active: true }

3. Property now visible to users
   GET /api/properties
   → Includes new property

4. Users can invest
   POST /api/wallet/buy-tokens
   → available_tokens decreases
```

### Scenario 4: User Withdraws Funds

```
1. User requests withdrawal
   POST /api/wallet-transactions/withdraw
   {
     amount: 5000,
     bank_account: "..."
   }
   → Transaction created with status: 'pending'
   → available_balance -= 5000
   → locked_balance += 5000

2. Admin reviews
   GET /api/admin/pending-withdrawals
   → Shows withdrawal request

3. Admin approves
   POST /api/admin/approve-withdrawal/:id
   → locked_balance -= 5000
   → total_balance -= 5000
   → Bank transfer initiated
   → Email sent to user
```

### Scenario 5: Property Fully Funded

```
Property State:
  total_tokens: 10000
  available_tokens: 100
  status: 'active'

User buys last 100 tokens:
  POST /api/wallet/buy-tokens
  { property_id: "...", token_amount: 100 }

Transaction:
  BEGIN
    1. Deduct from wallet
    2. Create purchase record
    3. Update property_tokens
    4. Update property:
       available_tokens = 0
       status = 'sold-out'  // Auto-update
  COMMIT

Result:
  Property no longer accepts investments
  All 10000 tokens distributed
```

---

## Transaction Patterns

### Pattern 1: Database Transaction Template

```javascript
try {
  await query('BEGIN');
  
  // Step 1: Lock rows to prevent race conditions
  const property = await query(
    'SELECT * FROM properties WHERE id = $1 FOR UPDATE',
    [propertyId]
  );
  
  // Step 2: Validate business rules
  if (property.available_tokens < requestedTokens) {
    throw new Error('Insufficient tokens');
  }
  
  // Step 3: Perform updates
  await query('UPDATE wallet SET balance = balance - $1 WHERE user_id = $2', 
    [amount, userId]);
  await query('INSERT INTO investments (...) VALUES (...)', [...]);
  await query('UPDATE properties SET available_tokens = available_tokens - $1 WHERE id = $2',
    [requestedTokens, propertyId]);
  
  // Step 4: Commit
  await query('COMMIT');
  
  return { success: true };
  
} catch (error) {
  // Rollback on any error
  await query('ROLLBACK');
  throw error;
}
```

### Pattern 2: Authentication Middleware

```javascript
const authenticateToken = async (req, res, next) => {
  // 1. Extract token
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // 2. Verify JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Get user from database
  const user = await query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
  
  // 4. Check active status
  if (!user.is_active) {
    return res.status(401).json({ error: 'Account deactivated' });
  }
  
  // 5. Attach to request
  req.user = user;
  next();
};
```

### Pattern 3: Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Usage in routes
router.post('/example', async (req, res, next) => {
  try {
    // Business logic
  } catch (error) {
    next(error); // Passes to error handler
  }
});
```

---

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get properties (with auth)
curl -X GET http://localhost:3001/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Buy tokens
curl -X POST http://localhost:3001/api/wallet/buy-tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"user_id":"user-id","property_id":"property-id","amount_pkr":10000}'
```

### Using Postman Collection

The repository includes `HMR_API_Collection.postman_collection.json` with pre-configured requests.

---

## Performance Tips

### Database Queries
- Always use indexes on foreign keys
- Use `LIMIT` and `OFFSET` for pagination
- Use `FOR UPDATE` to lock rows in transactions
- Avoid N+1 queries (use JOINs)

### API Responses
- Return only necessary fields
- Use pagination for large datasets
- Cache frequently accessed data (planned)

### Security
- Never log sensitive data (passwords, tokens)
- Always hash passwords (bcrypt, 12 rounds)
- Validate all inputs (express-validator)
- Use rate limiting (1000 req/15min)

---

## Troubleshooting

### Common Issues

**1. "Insufficient tokens available"**
- Cause: Property tokens sold out or being purchased simultaneously
- Solution: Check `available_tokens` before purchase

**2. "KYC verification required"**
- Cause: User trying to invest without verified KYC
- Solution: Complete KYC process and wait for admin approval

**3. "Insufficient balance"**
- Cause: Wallet balance < investment amount
- Solution: Deposit more funds to wallet

**4. "Transaction deadlock"**
- Cause: Multiple users buying last tokens simultaneously
- Solution: Using `FOR UPDATE` lock (already implemented)

**5. "JWT token expired"**
- Cause: Access token older than 7 days
- Solution: Use refresh token to get new access token

---

## Quick Reference Chart

| Feature | Route | Auth | KYC | Admin |
|---------|-------|------|-----|-------|
| Browse Properties | GET /properties | ❌ | ❌ | ❌ |
| View Property | GET /properties/:slug | ❌ | ❌ | ❌ |
| Register | POST /auth/register | ❌ | ❌ | ❌ |
| Login | POST /auth/login | ❌ | ❌ | ❌ |
| Submit KYC | POST /kyc/submit | ❌ | ❌ | ❌ |
| Deposit Funds | POST /wallet-transactions/deposit | ✅ | ❌ | ❌ |
| Buy Tokens | POST /wallet/buy-tokens | ✅ | ✅ | ❌ |
| Withdraw Funds | POST /wallet-transactions/withdraw | ✅ | ✅ | ❌ |
| View Portfolio | GET /portfolio/summary | ✅ | ❌ | ❌ |
| Create Property | POST /properties | ✅ | ❌ | ✅ |
| Approve KYC | POST /kyc/update-status | ✅ | ❌ | ✅ |
| Dashboard | GET /admin/dashboard | ✅ | ❌ | ✅ |

**Legend:**
- ✅ Required
- ❌ Not Required

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-16  
**For:** Quick Developer Reference
