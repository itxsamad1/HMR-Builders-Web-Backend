const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');
const router = express.Router();

// Helper function to mask card number
const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
};

// Helper function to hash CVV
const hashCVV = async (cvv) => {
  return await bcrypt.hash(cvv, 10);
};

// Helper function to verify CVV
const verifyCVV = async (cvv, hashedCVV) => {
  return await bcrypt.compare(cvv, hashedCVV);
};

// Helper function to validate card number
const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Helper function to detect card type
const detectCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  
  return null;
};

// Get user's payment methods
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, currency, is_default, is_verified, status, created_at FROM payment_methods WHERE user_id = $1 AND status = $2 ORDER BY is_default DESC, created_at DESC',
      [userId, 'active']
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment methods',
      message: error.message 
    });
  }
});

// Add new payment method
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      cardNumber, 
      cardHolderName, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      currency = 'PKR',
      billingAddress = {} 
    } = req.body;
    
    // Validate input
    if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Validate card number
    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid card number'
      });
    }
    
    // Detect card type
    const cardType = detectCardType(cardNumber);
    if (!cardType || !['visa', 'mastercard'].includes(cardType)) {
      return res.status(400).json({
        success: false,
        error: 'Only VISA and Mastercard are supported'
      });
    }
    
    // Validate expiry date
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return res.status(400).json({
        success: false,
        error: 'Card has expired'
      });
    }
    
    // Validate CVV
    if (!/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CVV'
      });
    }
    
    // Check if card already exists for user
    const cardNumberMasked = maskCardNumber(cardNumber);
    const existingCard = await query(
      'SELECT id FROM payment_methods WHERE user_id = $1 AND card_number_masked = $2',
      [userId, cardNumberMasked]
    );
    
    if (existingCard.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This card is already added to your account'
      });
    }
    
    // Hash CVV for security
    const cvvHash = await hashCVV(cvv);
    
    // If this is the first card, make it default
    const existingCards = await query(
      'SELECT COUNT(*) as count FROM payment_methods WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    
    const isDefault = existingCards.rows[0].count === '0';
    
    // Insert payment method
    const result = await query(
      `INSERT INTO payment_methods 
       (user_id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, cvv_hash, currency, billing_address, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, currency, is_default, created_at`,
      [userId, cardType, cardNumberMasked, cardHolderName, expiryMonth, expiryYear, cvvHash, currency, JSON.stringify(billingAddress), isDefault]
    );
    
    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method',
      message: error.message
    });
  }
});

// Set default payment method
router.put('/:id/default', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = req.params.id;
    
    // Start transaction
    await query('BEGIN');
    
    // Remove default from all user's cards
    await query(
      'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );
    
    // Set new default
    const result = await query(
      'UPDATE payment_methods SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
      [paymentMethodId, userId]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    await query('COMMIT');
    
    res.json({
      success: true,
      message: 'Default payment method updated'
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update default payment method',
      message: error.message
    });
  }
});

// Delete payment method
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = req.params.id;
    
    const result = await query(
      'UPDATE payment_methods SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      ['inactive', paymentMethodId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove payment method',
      message: error.message
    });
  }
});

// Verify payment method with OTP (for testing purposes)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = req.params.id;
    const { otp } = req.body;
    
    // Fixed OTP for testing
    const FIXED_OTP = '1122';
    
    if (otp !== FIXED_OTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }
    
    const result = await query(
      'UPDATE payment_methods SET is_verified = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
      [paymentMethodId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment method verified successfully'
    });
  } catch (error) {
    console.error('Verify payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment method',
      message: error.message
    });
  }
});

module.exports = router;
