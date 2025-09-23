const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { 
  generateToken, 
  generateRefreshToken, 
  authenticateToken 
} = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin,
  validateEmail 
} = require('../middleware/validation');

const router = express.Router();

// Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, first_name, last_name, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING id, email, name, first_name, last_name`,
      [
        name,
        email,
        hashedPassword,
        firstName || name.split(' ')[0],
        lastName || name.split(' ').slice(1).join(' ')
      ]
    );

    const user = result.rows[0];

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
});

// Register user with payment method
router.post('/register-with-payment', validateUserRegistration, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      firstName, 
      lastName,
      paymentMethod 
    } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Validate payment method if provided
    if (paymentMethod) {
      const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, currency } = paymentMethod;
      
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
        return res.status(400).json({
          error: 'Invalid payment method',
          message: 'Payment method details are incomplete'
        });
      }
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const userResult = await query(
        `INSERT INTO users (name, email, password_hash, first_name, last_name, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, FALSE)
         RETURNING id, email, name, first_name, last_name`,
        [
          name,
          email,
          hashedPassword,
          firstName || name.split(' ')[0],
          lastName || name.split(' ').slice(1).join(' ')
        ]
      );

      const user = userResult.rows[0];

      // Create user wallet
      await query(
        'INSERT INTO user_wallets (user_id, available_balance, total_investment, total_tokens) VALUES ($1, $2, $3, $4)',
        [user.id, 0, 0, 0]
      );

      let paymentMethodData = null;

      // Add payment method if provided
      if (paymentMethod) {
        const bcrypt = require('bcryptjs');
        
        // Helper functions (same as in paymentMethods.js)
        const maskCardNumber = (cardNumber) => {
          const cleaned = cardNumber.replace(/\D/g, '');
          if (cleaned.length < 4) return '****';
          return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
        };

        const detectCardType = (cardNumber) => {
          const cleaned = cardNumber.replace(/\D/g, '');
          if (/^4/.test(cleaned)) return 'visa';
          if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
          return null;
        };

        const { cardNumber, cardHolderName, expiryMonth, expiryYear, cvv, currency = 'PKR' } = paymentMethod;
        
        const cardType = detectCardType(cardNumber);
        if (!cardType || !['visa', 'mastercard'].includes(cardType)) {
          throw new Error('Only VISA and Mastercard are supported');
        }

        const cardNumberMasked = maskCardNumber(cardNumber);
        const cvvHash = await bcrypt.hash(cvv, 10);

        const paymentResult = await query(
          `INSERT INTO payment_methods 
           (user_id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, cvv_hash, currency, is_default, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, FALSE)
           RETURNING id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, currency`,
          [user.id, cardType, cardNumberMasked, cardHolderName, expiryMonth, expiryYear, cvvHash, currency]
        );

        paymentMethodData = paymentResult.rows[0];
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      await query('COMMIT');

      res.status(201).json({
        message: 'User registered successfully',
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        },
        paymentMethod: paymentMethodData
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Registration with payment error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'Unable to create user account'
    });
  }
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT id, email, name, password_hash, is_active, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW(), last_activity_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
});

// Google OAuth callback (for NextAuth compatibility)
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, name, and Google ID are required'
      });
    }

    // Use the upsert query from queries.sql
    const result = await query(
      `INSERT INTO users (email, name, google_id, profile_image, is_email_verified)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         google_id = COALESCE(users.google_id, EXCLUDED.google_id),
         profile_image = COALESCE(EXCLUDED.profile_image, users.profile_image),
         updated_at = NOW()
       RETURNING id, email, name, profile_image`,
      [email, name, googleId, profileImage]
    );

    const user = result.rows[0];
    
    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW(), last_activity_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Google authentication failed',
      message: 'Unable to authenticate with Google'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Please provide a valid refresh token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found or deactivated'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid or expired refresh token'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Please remove tokens from client storage'
  });
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user is populated by authenticateToken middleware
    const user = req.user;
    
    res.json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
        role: user.role,
        kycStatus: user.kyc_status,
        isEmailVerified: user.is_email_verified,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        lastActivityAt: user.last_activity_at,
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile', message: error.message });
  }
});

module.exports = router;
