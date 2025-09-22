# HMR Builders Web Backend

A comprehensive Node.js Express backend API for the HMR Builders real estate tokenization platform. This backend provides authentication, property management, investment tracking, and admin functionality.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth integration (NextAuth compatible)
  - Role-based access control (Admin, User)
  - KYC verification system

- **Property Management**
  - CRUD operations for properties
  - Advanced filtering and search
  - Image management
  - Investment statistics

- **Investment System**
  - Token-based fractional ownership
  - Investment tracking and portfolio management
  - Returns and dividend calculations
  - Secondary market for token trading

- **User Management**
  - User profiles and preferences
  - Investment history
  - Notification system
  - KYC document management

- **Admin Dashboard**
  - Analytics and reporting
  - User management
  - Property oversight
  - Investment monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Google OAuth
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HMR-Builders-Web-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/hmr-builders
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   # ... other environment variables
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run build` - Build for production

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001`
- Production: `https://your-vercel-app.vercel.app`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/google` | Google OAuth login | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Property Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/properties` | Get all properties | Optional |
| GET | `/api/properties/featured` | Get featured properties | No |
| GET | `/api/properties/:id` | Get property by ID | Optional |
| GET | `/api/properties/slug/:slug` | Get property by slug | Optional |
| GET | `/api/properties/:id/stats` | Get property statistics | No |
| POST | `/api/properties` | Create property | Admin |
| PUT | `/api/properties/:id` | Update property | Admin |
| DELETE | `/api/properties/:id` | Delete property | Admin |

### Investment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/investments/my-investments` | Get user investments | Yes |
| GET | `/api/investments/:id` | Get investment by ID | Yes |
| POST | `/api/investments` | Create investment | Yes + KYC |
| PATCH | `/api/investments/:id/status` | Update investment status | Yes |
| PATCH | `/api/investments/:id/cancel` | Cancel investment | Yes |
| GET | `/api/investments/portfolio/summary` | Get portfolio summary | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| POST | `/api/users/kyc` | Submit KYC documents | Yes |
| GET | `/api/users/kyc/status` | Get KYC status | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/properties` | Get all properties | Admin |
| GET | `/api/admin/investments` | Get all investments | Admin |
| GET | `/api/admin/analytics` | Get analytics data | Admin |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Google OAuth Integration

The backend is compatible with NextAuth.js Google OAuth:

1. Set up Google OAuth credentials in Google Cloud Console
2. Configure the callback URLs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-frontend-domain.com/api/auth/callback/google`
3. Use the `/api/auth/google` endpoint for authentication

## 🗄️ Database Models

### User Model
- Basic profile information
- Authentication data (password, Google ID)
- KYC verification status
- Investment profile preferences
- Account status and timestamps

### Property Model
- Property details and location
- Pricing and tokenization information
- Unit types and features
- Construction progress
- Investment statistics

### Investment Model
- User and property references
- Investment amount and tokens
- Payment information
- Returns and dividends
- Sale information (if applicable)

## 🚀 Deployment on Vercel

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables**
   Set the following environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL`
   - Other required variables from `env.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Password hashing** with bcrypt
- **JWT token** authentication
- **Role-based access control**

## 📊 Monitoring & Logging

- **Morgan** for HTTP request logging
- **Health check** endpoint at `/health`
- **Error handling** with detailed error messages
- **Request/response logging** for debugging

## 🧪 Testing

Run the seed script to populate the database with test data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@hmrbuilders.com` / `Admin123!`
- Test users with sample investments
- Sample properties with full details

## 📝 API Response Format

All API responses follow this format:

```json
{
  "message": "Success message",
  "data": {
    // Response data
  },
  "error": "Error message (if applicable)"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@hmrbuilders.com
- Documentation: [API Docs](https://your-api-docs-url.com)

---

**HMR Builders** - Revolutionizing Real Estate Investment through Tokenization