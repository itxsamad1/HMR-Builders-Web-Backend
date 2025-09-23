# HMR Builders Backend Setup Guide

## 🚀 Quick Setup

### 1. **Create Environment File**
Create a `.env` file in the `HMR-Builders-Web-Backend` folder:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL='postgresql://neondb_owner:npg_t0Zm7Kfaejpl@ep-bold-voice-a1wnsh6j-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-this-very-long-and-secure
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. **Install Dependencies**
```bash
cd HMR-Builders-Web-Backend
npm install
```

### 3. **Setup Database**
```bash
npm run setup-db
```

### 4. **Start the Server**
```bash
npm run dev
```

## 🔧 Port Configuration

- **Backend API**: `http://localhost:3001`
- **Frontend**: `http://localhost:3000`

This separation allows both frontend and backend to run simultaneously during development.

## 🐘 Database

The backend uses **NeonDB PostgreSQL** with the following features:
- ✅ User authentication and management
- ✅ Property tokenization data
- ✅ Investment tracking
- ✅ Transaction history
- ✅ Wallet management

## 🔐 JWT Configuration

The JWT token you provided uses ES512 algorithm. Update your JWT_SECRET in the `.env` file to match your requirements.

## 🚨 Common Issues

### SQL Parameter Error
If you see `ERROR: there is no parameter $1`, it means:
1. The database tables haven't been created yet
2. Run `npm run setup-db` to create tables and seed data

### Connection Issues
1. Check your `DATABASE_URL` in `.env`
2. Ensure NeonDB is accessible
3. Verify your connection string format

## 📊 Database Schema

The setup script creates:
- `users` - User accounts and profiles
- `properties` - Real estate properties
- `investments` - User investments
- `user_wallets` - User wallet data
- `token_transactions` - Transaction history
- `notifications` - User notifications

## 🔄 Development Workflow

1. **Start Backend**: `npm run dev` (port 3001)
2. **Start Frontend**: `cd ../HMR-Builders-Web && npm run dev` (port 3000)
3. **Access API**: `http://localhost:3001/api`
4. **Access Frontend**: `http://localhost:3000`

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user
- `GET /api/properties` - List properties
- `POST /api/investments` - Create investment
- `GET /api/users/wallet` - Get user wallet

## 🛠️ Troubleshooting

### Database Connection
```bash
# Test database connection
node -e "
const { query } = require('./config/database');
query('SELECT NOW()').then(result => {
  console.log('✅ Database connected:', result.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});
"
```

### Reset Database
```bash
# Drop and recreate all tables
npm run setup-db
```

## 📚 Additional Resources

- [NeonDB Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

