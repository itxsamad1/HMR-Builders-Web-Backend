# HMR Builders Backend - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Node.js 18+ installed locally
- Vercel CLI installed (`npm i -g vercel`)
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account (for OAuth)

### Step 1: Environment Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Configure environment variables:**
   ```env
   # Server Configuration
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-domain.vercel.app

   # Database (MongoDB Atlas recommended)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hmr-builders

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

   # Google OAuth (for NextAuth compatibility)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXTAUTH_URL=https://your-frontend-domain.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret-here
   ```

### Step 2: Database Setup

1. **Create MongoDB Atlas cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Create a database user
   - Whitelist your IP address (or use 0.0.0.0/0 for Vercel)
   - Get your connection string

2. **Seed the database:**
   ```bash
   npm run seed
   ```

### Step 3: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel:**
   - Go to your project dashboard
   - Navigate to Settings > Environment Variables
   - Add all variables from your `.env` file

4. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Step 4: Configure Google OAuth

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure OAuth URLs:**
   - **Authorized JavaScript origins:**
     - `https://your-frontend-domain.vercel.app`
   - **Authorized redirect URIs:**
     - `https://your-frontend-domain.vercel.app/api/auth/callback/google`

3. **Update environment variables:**
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Vercel

### Step 5: Test Deployment

1. **Health Check:**
   ```bash
   curl https://your-backend-domain.vercel.app/health
   ```

2. **API Documentation:**
   ```bash
   curl https://your-backend-domain.vercel.app/api/docs
   ```

3. **Test Authentication:**
   ```bash
   curl -X POST https://your-backend-domain.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'
   ```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd HMR-Builders-Web-Backend
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   # Edit .env with your local configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Seed database:**
   ```bash
   npm run seed
   ```

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Health endpoint:** `GET /health`
- **API docs:** `GET /api/docs`
- **Status check:** `GET /`

### Database Maintenance
- Regular backups of MongoDB Atlas
- Monitor connection limits
- Set up alerts for errors

### Security
- Rotate JWT secrets regularly
- Monitor failed login attempts
- Keep dependencies updated
- Use environment variables for all secrets

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check MongoDB Atlas connection string
   - Verify IP whitelist includes Vercel IPs
   - Ensure database user has proper permissions

2. **Google OAuth Not Working:**
   - Verify redirect URIs match exactly
   - Check client ID and secret
   - Ensure Google+ API is enabled

3. **CORS Errors:**
   - Update `FRONTEND_URL` in environment variables
   - Check CORS configuration in `index.js`

4. **JWT Token Issues:**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings
   - Ensure consistent secret across deployments

### Logs
- Vercel Function logs: Available in Vercel dashboard
- Database logs: MongoDB Atlas dashboard
- Application logs: Check console output

## 📈 Performance Optimization

### Vercel Optimizations
- Use Vercel Edge Functions for static content
- Implement caching strategies
- Optimize database queries
- Use connection pooling

### Database Optimizations
- Create appropriate indexes
- Use MongoDB aggregation pipelines
- Implement pagination for large datasets
- Monitor query performance

## 🔄 CI/CD Pipeline

### Automated Deployment
1. Connect GitHub repository to Vercel
2. Set up automatic deployments on push to main
3. Configure environment variables
4. Set up staging environment

### Testing
- Run tests before deployment
- Use staging environment for testing
- Implement health checks
- Monitor error rates

## 📞 Support

For deployment issues:
- Check Vercel documentation
- Review MongoDB Atlas guides
- Contact support team
- Check GitHub issues

---

**Happy Deploying! 🚀**
