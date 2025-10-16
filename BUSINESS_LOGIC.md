# HMR Builders - Complete Business Logic Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Business Entities](#core-business-entities)
3. [User Flows](#user-flows)
4. [Investment Flows](#investment-flows)
5. [Payment & Wallet Flows](#payment--wallet-flows)
6. [KYC Verification Flow](#kyc-verification-flow)
7. [Admin Operations Flow](#admin-operations-flow)
8. [Database Architecture](#database-architecture)
9. [API Interaction Flowcharts](#api-interaction-flowcharts)

---

## System Overview

HMR Builders is a **Real Estate Tokenization Platform** that enables fractional ownership of properties through blockchain-inspired tokenization. The platform allows users to invest in properties by purchasing tokens, track their portfolio, and earn returns on their investments.

### Key Features
- **Fractional Ownership**: Users can buy fractional tokens representing ownership in properties
- **Multi-Currency Support**: PKR, USD, EUR, GBP with automatic conversion
- **Wallet System**: Digital wallet for managing funds and investments
- **KYC Verification**: Know Your Customer verification for compliance
- **Portfolio Management**: Track investments, returns, and property performance
- **Admin Dashboard**: Comprehensive analytics and management tools

---

## Core Business Entities

### 1. Users
```
User Entity:
├── Basic Information
│   ├── Name, Email, Phone
│   ├── Profile Image
│   └── Address Details
├── Authentication
│   ├── Password (hashed)
│   ├── Google OAuth ID
│   └── JWT Tokens
├── KYC Status
│   ├── pending
│   ├── verified
│   └── rejected
├── Investment Profile
│   └── Preferences and settings
└── Account Status
    ├── active
    ├── suspended
    └── banned
```

### 2. Properties
```
Property Entity:
├── Basic Details
│   ├── Title, Description
│   ├── Location (Address, City, State)
│   └── Property Type (residential/commercial/mixed-use)
├── Financial Information
│   ├── Total Value
│   ├── Market Value
│   ├── Expected ROI
│   └── Minimum Investment
├── Tokenization
│   ├── Total Tokens
│   ├── Available Tokens
│   ├── Price Per Token
│   └── Token Price (PKR)
├── Construction Details
│   ├── Progress Percentage
│   ├── Start Date
│   ├── Expected Completion
│   └── Handover Date
└── Media & Features
    ├── Images (cover, gallery)
    ├── Documents
    ├── Amenities
    └── Unit Types
```

### 3. Investments
```
Investment Entity:
├── Transaction Details
│   ├── User ID
│   ├── Property ID
│   ├── Investment Amount
│   ├── Tokens Purchased
│   └── Price Per Token
├── Payment Information
│   ├── Payment Method
│   ├── Payment Status
│   ├── Transaction ID
│   └── Stripe Payment Intent ID
├── Investment Status
│   ├── pending
│   ├── confirmed
│   ├── active
│   ├── sold
│   └── cancelled
├── Returns Tracking
│   ├── Total Earned
│   ├── Dividend History
│   ├── Last Dividend Date
│   └── Next Dividend Date
└── Sale Information
    ├── Sale Date
    ├── Sale Price
    ├── Sale Profit
    └── Profit Percentage
```

### 4. Wallet
```
User Wallet:
├── Balances
│   ├── Total Balance
│   ├── Available Balance
│   └── Locked Balance
├── Investment Summary
│   ├── Total Tokens Owned
│   ├── Total Investment
│   └── Total Returns
└── Transactions
    ├── Deposits
    ├── Withdrawals
    ├── Investments
    └── Returns/Dividends
```

---

## User Flows

### 1. User Registration & Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────┐
│  Choose Method  │
│  - Email/Pass   │
│  - Google OAuth │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────┐
│ Email/  │  │  Google  │
│ Pass    │  │  OAuth   │
└────┬────┘  └────┬─────┘
     │            │
     ▼            ▼
┌─────────────────────────┐
│  Validate Input Data    │
│  - Email Format         │
│  - Password Strength    │
│  - Required Fields      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Existing User    │
│  (by email)             │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Exists   New User
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │  Hash Password  │
    │    │  (bcrypt)       │
    │    └────────┬────────┘
    │             │
    │             ▼
    │    ┌─────────────────────┐
    │    │  Create User Record │
    │    │  - Insert to DB     │
    │    │  - Set KYC: pending │
    │    └────────┬────────────┘
    │             │
    │             ▼
    │    ┌─────────────────────┐
    │    │  Create User Wallet │
    │    │  - Balance: 0       │
    │    │  - Tokens: 0        │
    │    └────────┬────────────┘
    │             │
    │             ▼
    │    ┌─────────────────────┐
    │    │  Generate JWT Token │
    │    │  - Access Token     │
    │    │  - Refresh Token    │
    │    └────────┬────────────┘
    │             │
    ▼             ▼
┌─────────────────────────┐
│  Return User Profile    │
│  + Authentication Token │
└────────┬────────────────┘
         │
         ▼
       END
```

### 2. User Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────┐
│  Submit Login   │
│  - Email        │
│  - Password     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Input         │
│  - Email format         │
│  - Required fields      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Query User by Email    │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
  Found    Not Found
    │          │
    │          ▼
    │     ┌─────────────┐
    │     │  Return 401 │
    │     │  Invalid    │
    │     └─────────────┘
    │
    ▼
┌─────────────────────────┐
│  Check Account Status   │
│  - is_active = true?    │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
  Active   Inactive
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 401  │
    │     │  Deactivated │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────┐
│  Verify Password        │
│  bcrypt.compare()       │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
  Valid    Invalid
    │          │
    │          ▼
    │     ┌─────────────┐
    │     │  Return 401 │
    │     │  Invalid    │
    │     └─────────────┘
    │
    ▼
┌─────────────────────────┐
│  Update Last Login      │
│  - last_login_at        │
│  - last_activity_at     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Generate JWT Tokens    │
│  - Access Token (7d)    │
│  - Refresh Token (30d)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return User Profile    │
│  + Tokens               │
└────────┬────────────────┘
         │
         ▼
       END
```

---

## Investment Flows

### 1. Property Token Purchase Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 TOKEN PURCHASE FLOW                          │
└─────────────────────────────────────────────────────────────┘

START (User wants to buy tokens)
  │
  ▼
┌─────────────────────────┐
│  User Authentication    │
│  - Verify JWT Token     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Get Property Details   │
│  - Property ID/Slug     │
│  - Token Availability   │
│  - Token Price          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Property Status  │
│  - status = 'active'?   │
│  - is_active = true?    │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
  Active   Not Active
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 400  │
    │     │  Not Active  │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────┐
│  Calculate Token Amount │
│  - If amount_pkr given: │
│    tokens = amount/price│
│  - If tokens given:     │
│    amount = tokens*price│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Purchase      │
│  - tokens > min (0.001) │
│  - tokens <= available  │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
  Valid    Invalid
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 400  │
    │     │  Validation  │
    │     │  Error       │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────┐
│  Check Wallet Balance   │
│  - available_balance    │
│  >= required_amount?    │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Sufficient  Insufficient
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 400  │
    │     │  Insufficient│
    │     │  Balance     │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│         BEGIN TRANSACTION               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  1. Create Wallet Txn   │
│     - Type: investment  │
│     - Deduct amount     │
│     - Status: completed │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  2. Update Wallet       │
│     - Deduct from       │
│       available_balance │
│     - Add to            │
│       total_investment  │
│     - Add to            │
│       total_tokens      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  3. Create Token        │
│     Purchase Record     │
│     - tokens_purchased  │
│     - pkr_amount        │
│     - status: completed │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  4. Update/Create       │
│     Property Tokens     │
│     - tokens_owned      │
│     - total_invested    │
│     - current_value     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  5. Update Property     │
│     - Reduce available  │
│       tokens            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         COMMIT TRANSACTION              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Success         │
│  - Purchase details     │
│  - Updated wallet       │
│  - Updated holdings     │
└────────┬────────────────┘
         │
         ▼
       END

Note: If any step fails, ROLLBACK transaction
```

### 2. Investment Creation Flow (Alternative Method)

```
┌─────────────────────────────────────────────────────────────┐
│              INVESTMENT CREATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────┐
│  Authenticate User      │
│  - Verify JWT           │
│  - Check is_active      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Input         │
│  - propertyId           │
│  - tokensPurchased      │
│  - investmentAmount     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         BEGIN TRANSACTION               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Lock Property Row      │
│  FOR UPDATE             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Verify Property        │
│  - Exists?              │
│  - Is Active?           │
│  - Status = 'active'?   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Token            │
│  Availability           │
│  available >= purchased?│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Create Investment      │
│  Record                 │
│  - user_id              │
│  - property_id          │
│  - investment_amount    │
│  - tokens_purchased     │
│  - status: 'active'     │
│  - payment: 'completed' │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update Property        │
│  - available_tokens -= │
│    tokens_purchased     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Create/Update Wallet   │
│  - total_investment +=  │
│  - total_tokens +=      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         COMMIT TRANSACTION              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Investment      │
│  Details                │
└────────┬────────────────┘
         │
         ▼
       END
```

---

## Payment & Wallet Flows

### 1. Wallet Deposit Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   WALLET DEPOSIT FLOW                        │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────┐
│  User Initiates Deposit │
│  - Amount               │
│  - Currency (PKR/USD/   │
│    EUR/GBP)             │
│  - Payment Method       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Amount        │
│  - amount > 0           │
│  - Valid currency       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Calculate Exchange     │
│  Rate                   │
│  - Get current rate     │
│  - Convert to PKR       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Process Payment        │
│  - Bank Transfer        │
│  - Credit/Debit Card    │
│  - Stripe               │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Success     Failure
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 400  │
    │     │  Payment     │
    │     │  Failed      │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│         BEGIN TRANSACTION               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Create Wallet          │
│  Transaction            │
│  - type: 'deposit'      │
│  - amount (original)    │
│  - amount_in_pkr        │
│  - currency             │
│  - exchange_rate        │
│  - status: 'completed'  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update User Wallet     │
│  - available_balance += │
│    amount_in_pkr        │
│  - total_balance +=     │
│    amount_in_pkr        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         COMMIT TRANSACTION              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Transaction     │
│  Details                │
│  - New balance          │
│  - Transaction ID       │
└────────┬────────────────┘
         │
         ▼
       END
```

### 2. Wallet Withdrawal Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 WALLET WITHDRAWAL FLOW                       │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────┐
│  User Initiates         │
│  Withdrawal             │
│  - Amount (PKR)         │
│  - Bank Account         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Request       │
│  - amount > 0           │
│  - Bank account valid   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Get Wallet Balance     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Sufficient       │
│  Balance                │
│  available_balance      │
│  >= amount?             │
└────────┬────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Sufficient  Insufficient
    │          │
    │          ▼
    │     ┌──────────────┐
    │     │  Return 400  │
    │     │  Insufficient│
    │     │  Balance     │
    │     └──────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│         BEGIN TRANSACTION               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Create Withdrawal      │
│  Transaction            │
│  - type: 'withdrawal'   │
│  - amount: -amount      │
│  - status: 'pending'    │
│  - bank_details         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update Wallet          │
│  - available_balance -= │
│  - locked_balance +=    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         COMMIT TRANSACTION              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Process Bank Transfer  │
│  (Async - Admin Review) │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Pending Status  │
│  - Transaction ID       │
│  - Processing time      │
└────────┬────────────────┘
         │
         ▼
       END

Note: Admin approves withdrawal separately
```

---

## KYC Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  KYC VERIFICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────┐
│  User Submits KYC       │
│  - Face Photo           │
│  - CNIC Number          │
│  - CNIC Photo           │
│  - Card Details         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Upload Images          │
│  - Face image to server │
│  - CNIC image to server │
│  - Store file paths     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Card Number   │
│  - Detect card type     │
│    (Visa/Mastercard)    │
│  - Mask card number     │
│  - Hash CVV             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update Payment Method  │
│  - face_image_url       │
│  - cnic_number          │
│  - cnic_image_url       │
│  - card_number_masked   │
│  - card_type            │
│  - kyc_status: pending  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Success         │
│  - KYC submitted        │
│  - Status: pending      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         ADMIN REVIEW PROCESS            │
│  (Separate Flow - Manual/Automated)     │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
 Approve    Reject
    │          │
    ▼          ▼
┌─────────┐  ┌─────────┐
│ Update  │  │ Update  │
│ Status: │  │ Status: │
│ verified│  │ rejected│
└────┬────┘  └────┬────┘
     │            │
     ▼            ▼
┌─────────────────────────┐
│  Update User Record     │
│  - kyc_status           │
│  - kyc_verified_at      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Send Notification      │
│  - Email                │
│  - In-app notification  │
└────────┬────────────────┘
         │
         ▼
       END
```

---

## Admin Operations Flow

### 1. Admin Dashboard Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│               ADMIN DASHBOARD FLOW                           │
└─────────────────────────────────────────────────────────────┘

START (Admin logs in)
  │
  ▼
┌─────────────────────────┐
│  Authenticate Admin     │
│  - Verify role='admin'  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│    PARALLEL DATA AGGREGATION            │
└─────────────────────────────────────────┘
         │
    ┌────┴────┬────┬────┬────┬────┐
    │         │    │    │    │    │
    ▼         ▼    ▼    ▼    ▼    ▼
┌────────┐ ┌───┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ Users  │ │Pro│ │In│ │Wa│ │Re│ │Ac│
│ Count  │ │per│ │ves│ │lle│ │ven│ │tiv│
│        │ │ties│ │tmen│ │t  │ │ue │ │ity│
│        │ │    │ │ts  │ │Txns│ │   │ │    │
└────┬───┘ └─┬─┘ └─┬┘ └─┬┘ └─┬┘ └─┬┘
     │       │     │    │    │    │
     └───────┴─────┴────┴────┴────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Calculate Metrics  │
         │  - Total Investment │
         │  - Commission       │
         │  - Avg Funding %    │
         │  - Growth Rate      │
         └────────┬────────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │  Get Recent         │
         │  Activity           │
         │  - New users        │
         │  - New investments  │
         │  - New properties   │
         └────────┬────────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │  Aggregate Response │
         │  - Statistics       │
         │  - Charts data      │
         │  - Activity feed    │
         └────────┬────────────┘
                  │
                  ▼
                END
```

### 2. Property Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│            ADMIN PROPERTY MANAGEMENT                         │
└─────────────────────────────────────────────────────────────┘

CREATE PROPERTY:
START
  │
  ▼
┌─────────────────────────┐
│  Admin Submits Property │
│  - All details          │
│  - Images               │
│  - Documents            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Input         │
│  - Required fields      │
│  - Numeric values       │
│  - Date ranges          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Generate Slug          │
│  - From title           │
│  - Ensure unique        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Upload Images          │
│  - Cover image          │
│  - Gallery images       │
│  - Store URLs/paths     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Upload Documents       │
│  - Brochures            │
│  - Legal docs           │
│  - Financial reports    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Insert Property Record │
│  - All fields           │
│  - status: draft        │
│  - is_active: false     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Property ID     │
└────────┬────────────────┘
         │
         ▼
       END


UPDATE PROPERTY STATUS:
START
  │
  ▼
┌─────────────────────────┐
│  Admin Changes Status   │
│  draft → active         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Validate Transition    │
│  - All required data?   │
│  - Images uploaded?     │
│  - Tokens configured?   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update Property        │
│  - status = 'active'    │
│  - is_active = true     │
│  - sort_order           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Notify Investors       │
│  - New property         │
│  - Email/notification   │
└────────┬────────────────┘
         │
         ▼
       END
```

---

## Database Architecture

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                 DATABASE SCHEMA                               │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│    USERS    │
├─────────────┤
│ id (PK)     │──┐
│ email       │  │
│ name        │  │
│ password    │  │
│ google_id   │  │
│ kyc_status  │  │
│ is_active   │  │
└─────────────┘  │
                 │
       ┌─────────┴──────────┬────────────┬──────────┐
       │                    │            │          │
       ▼                    ▼            ▼          ▼
┌──────────────┐   ┌──────────────┐  ┌─────────┐ ┌────────────┐
│ INVESTMENTS  │   │ USER_WALLETS │  │  KYC    │ │ PAYMENT_   │
├──────────────┤   ├──────────────┤  │         │ │ METHODS    │
│ id (PK)      │   │ id (PK)      │  │         │ ├────────────┤
│ user_id (FK) │──→│ user_id (FK) │  │         │ │ user_id(FK)│
│ property_id  │   │ balance      │  │         │ │ card_type  │
│ amount       │   │ total_tokens │  │         │ │ cnic       │
│ tokens       │   │ investment   │  │         │ │ face_img   │
│ status       │   │ returns      │  │         │ └────────────┘
└──────┬───────┘   └──────────────┘  └─────────┘
       │
       │
       ▼
┌──────────────┐
│ PROPERTIES   │
├──────────────┤
│ id (PK)      │──┐
│ title        │  │
│ slug         │  │
│ type         │  │
│ status       │  │
│ total_tokens │  │
│ available    │  │
│ price/token  │  │
└──────────────┘  │
                  │
       ┌──────────┴────────────────┬─────────────┐
       │                           │             │
       ▼                           ▼             ▼
┌──────────────┐         ┌─────────────┐  ┌────────────┐
│ PROPERTY_    │         │ PROPERTY_   │  │ TOKEN_     │
│ TOKENS       │         │ TOKEN_      │  │ TXNS       │
├──────────────┤         │ PURCHASES   │  ├────────────┤
│ user_id (FK) │         ├─────────────┤  │ user_id    │
│ property_id  │         │ user_id     │  │ property_id│
│ tokens_owned │         │ property_id │  │ type       │
│ invested     │         │ tokens      │  │ amount     │
│ current_val  │         │ pkr_amount  │  │ status     │
└──────────────┘         └─────────────┘  └────────────┘


┌─────────────────┐
│ WALLET_         │
│ TRANSACTIONS    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │──→ users.id
│ type            │
│ amount          │
│ currency        │
│ amount_in_pkr   │
│ exchange_rate   │
│ status          │
│ created_at      │
└─────────────────┘
```

### Key Database Constraints

```
1. Foreign Key Constraints:
   - investments.user_id → users.id (CASCADE DELETE)
   - investments.property_id → properties.id (CASCADE DELETE)
   - user_wallets.user_id → users.id (CASCADE DELETE)
   - property_tokens.user_id → users.id
   - property_tokens.property_id → properties.id

2. Check Constraints:
   - investment_amount >= 0
   - tokens_purchased > 0
   - price_per_token >= 0
   - kyc_status IN ('pending', 'verified', 'rejected')
   - payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
   - status IN ('pending', 'confirmed', 'active', 'sold', 'cancelled')

3. Unique Constraints:
   - users.email
   - users.google_id
   - properties.slug

4. Indexes (for performance):
   - users: email, google_id, kyc_status
   - properties: slug, status, is_active, is_featured, city
   - investments: user_id, property_id, status, payment_status
   - wallet_transactions: user_id, created_at
```

---

## API Interaction Flowcharts

### 1. Complete User Journey

```
┌──────────────────────────────────────────────────────────────┐
│              COMPLETE USER JOURNEY                            │
└──────────────────────────────────────────────────────────────┘

1. DISCOVERY PHASE
   │
   ├─→ Browse Properties (GET /api/properties)
   │   - Filter by city, type, status
   │   - View featured properties
   │   - Pagination
   │
   ├─→ View Property Details (GET /api/properties/:slug)
   │   - Full property info
   │   - Token availability
   │   - Investment stats
   │   - Documents & images
   │
   └─→ Calculate Returns (POST /api/calculator/roi)
       - Input investment amount
       - See projected returns


2. REGISTRATION PHASE
   │
   ├─→ Register (POST /api/auth/register)
   │   - Email/password or Google
   │   - Create user account
   │   - Generate JWT token
   │   - Create wallet
   │
   └─→ Login (POST /api/auth/login)
       - Authenticate
       - Receive tokens


3. KYC PHASE
   │
   ├─→ Upload Face Photo (POST /api/kyc/upload-image)
   │
   ├─→ Upload CNIC (POST /api/kyc/upload-image)
   │
   ├─→ Submit Card Details (POST /api/kyc/submit)
   │   - Card number, expiry, CVV
   │   - CNIC number
   │   - Face & CNIC images
   │
   ├─→ Check KYC Status (GET /api/kyc/status/:userId)
   │
   └─→ [Wait for Admin Approval]


4. FUNDING PHASE
   │
   ├─→ Add Payment Method (POST /api/payment-methods)
   │   - Card details
   │   - Bank account
   │
   └─→ Deposit to Wallet (POST /api/wallet-transactions/deposit)
       - Amount & currency
       - Payment processing
       - Wallet credit


5. INVESTMENT PHASE
   │
   ├─→ Buy Property Tokens (POST /api/wallet/buy-tokens)
   │   - Select property
   │   - Specify amount or tokens
   │   - Deduct from wallet
   │   - Allocate tokens
   │
   └─→ Confirm Investment (GET /api/investments/:id)
       - View investment details


6. PORTFOLIO MANAGEMENT
   │
   ├─→ View Portfolio (GET /api/portfolio/summary)
   │   - Total investment
   │   - Current value
   │   - ROI
   │
   ├─→ View Holdings (GET /api/wallet/holdings/:userId)
   │   - Properties owned
   │   - Tokens per property
   │   - Current values
   │
   ├─→ View Transactions (GET /api/wallet-transactions/:userId)
   │   - Transaction history
   │   - Deposits, withdrawals
   │   - Investments
   │
   └─→ Track Performance (GET /api/investments/my-investments)
       - Individual investments
       - Returns tracking
       - Dividend history


7. WITHDRAWAL PHASE
   │
   └─→ Withdraw Funds (POST /api/wallet-transactions/withdraw)
       - Specify amount
       - Bank details
       - Pending approval
```

### 2. Property Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                PROPERTY LIFECYCLE                             │
└──────────────────────────────────────────────────────────────┘

ADMIN CREATES PROPERTY
         │
         ▼
    ┌─────────┐
    │  DRAFT  │ (status: draft, is_active: false)
    └────┬────┘
         │ Admin completes all details
         │ Uploads images & documents
         ▼
    ┌─────────┐
    │ PLANNING│ (status: planning)
    └────┬────┘
         │ Construction starts
         ▼
    ┌──────────────┐
    │ CONSTRUCTION │ (status: construction)
    └────┬─────────┘
         │ - Progress updates
         │ - construction_progress: 0-100%
         │ Property ready for investment
         ▼
    ┌─────────┐
    │ ACTIVE  │ (status: active, is_active: true)
    └────┬────┘
         │ Users can invest
         │ Tokens being sold
         │
         ├──→ COMING SOON (optional pre-launch)
         │
         │ All tokens sold
         ▼
    ┌──────────┐
    │ SOLD OUT │ (available_tokens = 0)
    └────┬─────┘
         │ Construction completes
         ▼
    ┌───────────┐
    │ COMPLETED │ (status: completed)
    └───────────┘
         │ Property generating returns
         │ Dividends distributed
         │ Users can trade tokens
```

### 3. Token Trading Flow (Secondary Market)

```
┌──────────────────────────────────────────────────────────────┐
│              TOKEN TRADING FLOW                               │
└──────────────────────────────────────────────────────────────┘

SELLER LISTS TOKENS FOR SALE
         │
         ▼
    ┌─────────────────┐
    │ Create Listing  │
    │ - Property      │
    │ - Token amount  │
    │ - Price/token   │
    └────┬────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Lock Tokens     │
    │ (in seller's    │
    │  wallet)        │
    └────┬────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Listing Active  │
    │ (visible to     │
    │  buyers)        │
    └────┬────────────┘
         │
         │ BUYER PURCHASES
         ▼
    ┌─────────────────┐
    │ Verify Buyer    │
    │ Funds           │
    └────┬────────────┘
         │
         ▼
┌─────────────────────────────────┐
│    BEGIN TRANSACTION            │
└────┬────────────────────────────┘
     │
     ├─→ Deduct from buyer wallet
     │
     ├─→ Credit to seller wallet
     │
     ├─→ Transfer tokens
     │   (seller → buyer)
     │
     ├─→ Update investment records
     │   - Original investment: sold
     │   - New investment: created
     │
     ├─→ Calculate & record profit
     │   - sale_price
     │   - sale_profit
     │   - sale_profit_percentage
     │
     └─→ Create transaction records
         │
         ▼
┌─────────────────────────────────┐
│    COMMIT TRANSACTION           │
└────┬────────────────────────────┘
     │
     ▼
┌─────────────────┐
│ Notify Both     │
│ Parties         │
│ - Buyer         │
│ - Seller        │
└─────────────────┘
```

---

## Business Rules & Validations

### 1. Investment Rules

```
MINIMUM INVESTMENT:
- Token purchase: 0.001 tokens minimum
- PKR amount: Varies by property (pricing_min_investment)

MAXIMUM INVESTMENT:
- Limited by available tokens
- Limited by wallet balance

TOKEN FRACTIONAL SUPPORT:
- Yes, supports fractional tokens (e.g., 0.5, 0.1, 0.001)
- Calculated as: amount_pkr / token_price_pkr

KYC REQUIREMENTS:
- Basic browsing: No KYC required
- Property viewing: No KYC required
- Making investments: KYC REQUIRED (status: 'verified')

PAYMENT METHODS:
- Bank Transfer
- Credit Card
- Debit Card
- Stripe
- PayPal (planned)
```

### 2. Wallet Rules

```
WALLET CREATION:
- Auto-created on user registration
- Initial balances: 0
- Currency: PKR (primary)

BALANCE TYPES:
- total_balance: Overall wallet value
- available_balance: Usable for investments/withdrawals
- locked_balance: In pending transactions

TRANSACTION TYPES:
- deposit: Add funds (+)
- withdrawal: Remove funds (-)
- investment: Buy tokens (-)
- dividend: Receive returns (+)
- refund: Investment cancelled (+)

CURRENCY SUPPORT:
- PKR (Pakistani Rupee) - Primary
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- Auto-conversion to PKR for internal processing
```

### 3. Property Status Rules

```
STATUS TRANSITIONS:
draft → planning → construction → active → sold-out → completed

INVESTMENT ALLOWED ONLY WHEN:
- status = 'active'
- is_active = true
- available_tokens > 0

FEATURED PROPERTIES:
- is_featured = true
- Shown on homepage
- Priority in listings
- Sort_order determines display sequence

TOKEN AVAILABILITY:
- total_tokens: Fixed at creation
- available_tokens: Decreases with purchases
- When available_tokens = 0 → status = 'sold-out'
```

### 4. KYC Verification Rules

```
VERIFICATION LEVELS:
1. pending: Default for new users
2. verified: Passed all checks
3. rejected: Failed verification

REQUIRED DOCUMENTS:
- Face photo (selfie)
- CNIC (National ID) photo
- CNIC number
- Card details (for payment)

VERIFICATION PROCESS:
1. User uploads documents
2. System validates format/quality
3. Admin reviews (manual/automated)
4. Status updated
5. User notified

POST-VERIFICATION:
- Can make investments
- Can withdraw funds
- Full platform access
```

---

## Security Measures

### 1. Authentication & Authorization

```
JWT TOKEN SECURITY:
- Access Token: 7 days expiry
- Refresh Token: 30 days expiry
- Signed with JWT_SECRET
- Bearer token in Authorization header

PASSWORD SECURITY:
- bcryptjs hashing (12 rounds)
- Minimum strength requirements
- Never stored in plain text

GOOGLE OAUTH:
- OAuth 2.0 flow
- google_id stored
- Email verification automatic
- Profile image from Google

ROLE-BASED ACCESS:
- user: Standard access
- admin: Full system access
- Middleware checks role
```

### 2. Data Protection

```
SENSITIVE DATA:
- Card numbers: Masked (last 4 digits visible)
- CVV: Hashed (bcrypt)
- CNIC: Stored securely
- Passwords: Hashed (bcrypt)

PII (Personally Identifiable Information):
- Names, emails, phone
- Address details
- Date of birth
- Stored with encryption at rest (database level)

FINANCIAL DATA:
- Transaction records
- Wallet balances
- Investment amounts
- Audit trail maintained
```

### 3. API Security

```
RATE LIMITING:
- 1000 requests per 15 minutes per IP
- Prevents abuse & DDoS

CORS POLICY:
- Specific origin whitelist
- Credentials allowed
- Specific methods allowed

HELMET.JS:
- Security headers
- XSS protection
- Content Security Policy
- HTTPS enforcement (production)

INPUT VALIDATION:
- express-validator
- Schema validation
- SQL injection prevention
- XSS sanitization
```

---

## Monitoring & Analytics

### 1. Admin Dashboard Metrics

```
USER METRICS:
- Total registered users
- Active users (last 30 days)
- KYC completion rate
- User growth rate

PROPERTY METRICS:
- Total properties
- Active properties
- Average funding percentage
- Fully funded properties
- Properties in progress

INVESTMENT METRICS:
- Total investment amount (PKR)
- Monthly investment
- Average investment size
- Number of investors
- Investment growth rate

FINANCIAL METRICS:
- Total revenue
- Monthly revenue
- Commission earned (2% of investments)
- Wallet deposits
- Wallet withdrawals

TRANSACTION METRICS:
- Active transactions
- Pending approvals
- Failed transactions
- Transaction volume
```

### 2. Property Performance Tracking

```
FOR EACH PROPERTY:
- Total investment received
- Number of investors
- Funding percentage
- Average investment per investor
- Time to fully funded
- ROI delivered vs expected
- Dividend distribution history
```

### 3. User Activity Tracking

```
TRACKED EVENTS:
- Registration
- Login/Logout
- KYC submission
- Wallet deposits
- Token purchases
- Property views
- Document downloads
- Investment transactions

ANALYTICS USES:
- User behavior analysis
- Conversion funnel optimization
- Engagement metrics
- Retention analysis
```

---

## Integration Points

### 1. Payment Gateways

```
STRIPE INTEGRATION:
- Card payments
- Automated refunds
- Webhook for payment status
- PCI compliance

BANK TRANSFER:
- Manual verification
- Admin approval required
- Bank account validation

FUTURE INTEGRATIONS:
- PayPal
- Cryptocurrency wallets
- Mobile money (JazzCash, Easypaisa)
```

### 2. Email Notifications

```
NODEMAILER INTEGRATION:
- Welcome emails
- KYC status updates
- Investment confirmations
- Dividend notifications
- Withdrawal confirmations
- Password reset
- Security alerts
```

### 3. File Storage

```
CURRENT: Local file system
- KYC documents: /uploads/kyc/
- Property images: /uploads/properties/
- User avatars: /uploads/profiles/

PLANNED: Cloud storage
- Cloudinary (configured)
- AWS S3
- Azure Blob Storage
```

### 4. Database

```
POSTGRESQL (NeonDB):
- Cloud-hosted
- SSL connections
- Connection pooling (max: 10, min: 2)
- Automatic failover
- Backup & restore
```

---

## Error Handling & Recovery

### 1. Transaction Rollback

```
ALL FINANCIAL TRANSACTIONS USE:
BEGIN TRANSACTION
  → Multiple database operations
  → If any fails: ROLLBACK
  → If all succeed: COMMIT
  
ENSURES:
- Atomic operations
- Data consistency
- No partial updates
- Automatic retry (3 attempts)
```

### 2. Common Error Responses

```
400 BAD REQUEST:
- Invalid input
- Missing required fields
- Validation errors

401 UNAUTHORIZED:
- Invalid/missing token
- Expired token
- Account deactivated

403 FORBIDDEN:
- KYC not verified
- Admin access required
- Insufficient permissions

404 NOT FOUND:
- Resource doesn't exist
- Invalid ID/slug

500 INTERNAL SERVER ERROR:
- Database errors
- Unexpected exceptions
- Service unavailable
```

### 3. Retry Logic

```
DATABASE QUERIES:
- Automatic retry: 3 attempts
- Retry on: ECONNRESET, ENOTFOUND, ETIMEDOUT
- 1 second delay between retries
- Error logging for debugging
```

---

## Scalability Considerations

### 1. Database Optimization

```
INDEXES:
- Created on frequently queried columns
- Email, slug, user_id, property_id
- Status fields for filtering
- Composite indexes for complex queries

CONNECTION POOLING:
- Max connections: 10
- Min connections: 2
- Connection reuse
- Timeout management

QUERY OPTIMIZATION:
- Pagination for large datasets
- SELECT only needed columns
- JOIN optimization
- Use of prepared statements
```

### 2. Caching Strategy (Planned)

```
REDIS INTEGRATION:
- Property listings cache
- User session cache
- Featured properties cache
- Dashboard statistics cache
- Cache invalidation on updates
```

### 3. Load Balancing (Production)

```
HORIZONTAL SCALING:
- Multiple API instances
- Load balancer distribution
- Session persistence
- Stateless architecture
```

---

## Compliance & Regulations

### 1. KYC/AML Compliance

```
REQUIREMENTS:
- Identity verification (CNIC)
- Address verification
- Photo verification
- Payment method verification

ANTI-MONEY LAUNDERING:
- Transaction monitoring
- Suspicious activity flagging
- Reporting mechanisms
- User due diligence
```

### 2. Data Privacy (GDPR-like)

```
USER RIGHTS:
- Access personal data
- Request data deletion
- Export data
- Update information

DATA RETENTION:
- Active users: Indefinite
- Inactive users: Review after 2 years
- Deleted users: Anonymize after 30 days
- Transaction records: 7 years (legal requirement)
```

### 3. Financial Regulations

```
SECURITIES COMPLIANCE:
- Property tokenization regulations
- Fractional ownership rules
- Investor protection
- Disclosure requirements

AUDIT TRAIL:
- All transactions logged
- Immutable records
- Timestamp verification
- User action tracking
```

---

## Future Enhancements

### 1. Blockchain Integration

```
PLANNED FEATURES:
- Smart contracts for investments
- Token on-chain representation
- Transparent transaction history
- Decentralized ownership registry
- NFT property certificates
```

### 2. Advanced Features

```
MOBILE APP:
- iOS & Android
- Push notifications
- Biometric authentication
- QR code payments

SOCIAL FEATURES:
- Investor community
- Property discussions
- Investment insights sharing
- Referral program

ADVANCED ANALYTICS:
- AI-powered property recommendations
- Risk assessment tools
- Investment portfolio optimization
- Market trend analysis
```

### 3. Marketplace

```
SECONDARY MARKET:
- P2P token trading
- Order book
- Market makers
- Real-time pricing
- Trading fees
```

---

## Summary

This HMR Builders platform is a comprehensive **Real Estate Tokenization System** that:

1. **Enables fractional property ownership** through tokenization
2. **Provides secure wallet system** for managing investments
3. **Ensures compliance** through KYC verification
4. **Offers transparent tracking** of investments and returns
5. **Supports multi-currency** transactions with PKR as base
6. **Implements robust security** with JWT, encryption, and validation
7. **Scales efficiently** with PostgreSQL, connection pooling, and indexes
8. **Maintains audit trails** for compliance and transparency
9. **Admin tools** for comprehensive platform management
10. **Future-ready** with blockchain and marketplace features planned

The business logic flows ensure:
- **Atomic transactions** (all-or-nothing)
- **Data consistency** across all operations
- **User-friendly experience** with clear status updates
- **Security-first approach** with multiple validation layers
- **Scalable architecture** ready for growth

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-16  
**Maintained By:** HMR Builders Development Team
