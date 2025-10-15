const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/kyc';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to detect card type
const detectCardType = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleanNumber)) {
    return 'Visa';
  } else if (/^5[1-5]/.test(cleanNumber)) {
    return 'Mastercard';
  } else if (/^3[47]/.test(cleanNumber)) {
    return 'American Express';
  } else if (/^6(?:011|5)/.test(cleanNumber)) {
    return 'Discover';
  } else if (/^3[0689]/.test(cleanNumber)) {
    return 'Diners Club';
  } else if (/^35/.test(cleanNumber)) {
    return 'JCB';
  } else {
    return 'Unknown';
  }
};

// Helper function to mask card number
const maskCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 4) return cardNumber;
  return '*'.repeat(cleanNumber.length - 4) + cleanNumber.slice(-4);
};

// Create or update KYC verification
router.post('/submit', async (req, res) => {
  try {
    const { 
      userId, 
      faceImageUrl, 
      cnicNumber, 
      cnicImageUrl, 
      cardNumber, 
      cardHolderName, 
      cardExpiryMonth, 
      cardExpiryYear 
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Handle face and CNIC data in payment_methods table
    if (faceImageUrl || cnicNumber || cnicImageUrl) {
      const existingPaymentMethod = await query(
        'SELECT id FROM payment_methods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (existingPaymentMethod.rows.length > 0) {
        // Update existing payment method with KYC data
        await query(
          `UPDATE payment_methods SET 
           face_image_url = COALESCE($2, face_image_url),
           cnic_number = COALESCE($3, cnic_number),
           cnic_image_url = COALESCE($4, cnic_image_url),
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId, faceImageUrl, cnicNumber, cnicImageUrl]
        );
      } else {
        // Create new payment method with KYC data
        await query(
          `INSERT INTO payment_methods (user_id, card_type, card_number_masked, card_holder_name, 
           expiry_month, expiry_year, cvv_hash, face_image_url, cnic_number, cnic_image_url, 
           kyc_status, currency, is_default, is_verified, status)
           VALUES ($1, 'Unknown', '****', 'KYC User', 12, 2025, '***', $2, $3, $4, 'pending', 'PKR', true, false, 'active')`,
          [userId, faceImageUrl, cnicNumber, cnicImageUrl]
        );
      }
    }

    // Handle card data in payment_methods table
    if (cardNumber && cardHolderName && cardExpiryMonth && cardExpiryYear) {
      const cardType = detectCardType(cardNumber).toLowerCase();
      const maskedNumber = maskCardNumber(cardNumber);
      
      // Check if payment method already exists
      const existingPayment = await query(
        'SELECT id FROM payment_methods WHERE user_id = $1 AND card_number_masked = $2',
        [userId, maskedNumber]
      );

      if (existingPayment.rows.length > 0) {
        // Update existing payment method
        await query(
          `UPDATE payment_methods SET 
           card_type = $3,
           card_holder_name = $4,
           expiry_month = $5,
           expiry_year = $6,
           updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND card_number_masked = $2`,
          [userId, maskedNumber, cardType, cardHolderName, cardExpiryMonth, cardExpiryYear]
        );
      } else {
        // Create new payment method
        await query(
          `INSERT INTO payment_methods 
           (user_id, card_type, card_number_masked, card_holder_name, expiry_month, expiry_year, cvv_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, cardType, maskedNumber, cardHolderName, cardExpiryMonth, cardExpiryYear, 'hashed_cvv']
        );
      }
    }

    res.json({
      success: true,
      data: {
        message: 'KYC data submitted successfully'
      }
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit KYC data',
      message: error.message
    });
  }
});

// Upload image endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { type } = req.body; // 'face', 'cnic', 'card'
    const imageUrl = `/uploads/kyc/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        imageUrl,
        type,
        filename: req.file.filename
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Get KYC status for user
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT 
        id,
        face_image_url,
        face_verification_status,
        cnic_number,
        cnic_image_url,
        cnic_verification_status,
        card_number,
        card_type,
        card_holder_name,
        card_expiry_month,
        card_expiry_year,
        card_image_url,
        card_verification_status,
        overall_status,
        created_at,
        updated_at
      FROM kyc_verifications 
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          exists: false,
          status: 'not_started'
        }
      });
    }

    const kyc = result.rows[0];
    res.json({
      success: true,
      data: {
        exists: true,
        ...kyc
      }
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KYC status',
      message: error.message
    });
  }
});

// Update verification status
router.patch('/update-status/:kycId', async (req, res) => {
  try {
    const { kycId } = req.params;
    const { 
      faceVerificationStatus, 
      cnicVerificationStatus, 
      cardVerificationStatus,
      overallStatus 
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (faceVerificationStatus) {
      updateFields.push(`face_verification_status = $${paramCount}`);
      values.push(faceVerificationStatus);
      paramCount++;
    }

    if (cnicVerificationStatus) {
      updateFields.push(`cnic_verification_status = $${paramCount}`);
      values.push(cnicVerificationStatus);
      paramCount++;
    }

    if (cardVerificationStatus) {
      updateFields.push(`card_verification_status = $${paramCount}`);
      values.push(cardVerificationStatus);
      paramCount++;
    }

    if (overallStatus) {
      updateFields.push(`overall_status = $${paramCount}`);
      values.push(overallStatus);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(kycId);

    await query(
      `UPDATE kyc_verifications SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    res.json({
      success: true,
      data: {
        message: 'KYC status updated successfully'
      }
    });

  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update KYC status',
      message: error.message
    });
  }
});

// Get card type for frontend
router.post('/detect-card-type', (req, res) => {
  try {
    const { cardNumber } = req.body;

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        error: 'Card number is required'
      });
    }

    const cardType = detectCardType(cardNumber);
    const maskedNumber = maskCardNumber(cardNumber);

    res.json({
      success: true,
      data: {
        cardType,
        maskedNumber,
        isValid: cardType !== 'Unknown'
      }
    });

  } catch (error) {
    console.error('Card type detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect card type',
      message: error.message
    });
  }
});

// Update KYC status
router.post('/update-status', async (req, res) => {
  try {
    const { userId, kycStatus, kycCompletedAt } = req.body;

    if (!userId || !kycStatus) {
      return res.status(400).json({
        success: false,
        error: 'User ID and KYC status are required'
      });
    }

    // Update KYC status in payment_methods table
    const result = await query(
      `UPDATE payment_methods 
       SET kyc_status = $1, kyc_completed_at = $2 
       WHERE user_id = $3`,
      [kycStatus, kycCompletedAt || new Date(), userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No payment method found for this user'
      });
    }

    res.json({
      success: true,
      message: 'KYC status updated successfully',
      data: {
        userId,
        kycStatus,
        kycCompletedAt: kycCompletedAt || new Date()
      }
    });

  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update KYC status',
      message: error.message
    });
  }
});

module.exports = router;
