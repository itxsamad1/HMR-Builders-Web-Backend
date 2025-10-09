const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Contact support
router.post('/contact', async (req, res) => {
  try {
    const { type, message, subject } = req.body;
    // For demo purposes, use the first user from database
    const userId = 'a6702919-c381-4ebe-881a-4c3045d5f551';

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Type and message are required'
      });
    }

    // Store support request in database
    const result = await query(
      `INSERT INTO support_requests (user_id, type, subject, message, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       RETURNING id`,
      [userId, type, subject || 'General Inquiry', message]
    );

    // In a real application, you would send email/notification here
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'Support request submitted successfully',
      data: {
        requestId: result.rows[0].id,
        type: type,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Contact support error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit support request',
      message: error.message
    });
  }
});

// Get FAQ
router.get('/faq', async (req, res) => {
  try {
    const faqs = [
      {
        id: 1,
        question: "What is HMR Builders?",
        answer: "HMR Builders is a real estate tokenization platform that allows you to invest in premium properties with as little as PKR 10,000. We break down expensive properties into affordable tokens, making real estate investment accessible to everyone.",
        category: "General"
      },
      {
        id: 2,
        question: "How does tokenization work?",
        answer: "Each property is divided into a fixed number of tokens (usually 1000). You can buy as many tokens as you want based on your budget. Each token represents a fractional ownership of the property.",
        category: "Investment"
      },
      {
        id: 3,
        question: "What is the minimum investment amount?",
        answer: "The minimum investment varies by property, but typically starts from PKR 10,000. You can check the specific minimum investment for each property on its detail page.",
        category: "Investment"
      },
      {
        id: 4,
        question: "How do I earn returns on my investment?",
        answer: "You earn returns through rental income and property appreciation. Returns are distributed proportionally based on the number of tokens you own. You can track your returns in your portfolio dashboard.",
        category: "Returns"
      },
      {
        id: 5,
        question: "Can I sell my tokens?",
        answer: "Yes, you can sell your tokens back to the platform or to other investors. The selling process is simple and can be done through your portfolio dashboard.",
        category: "Trading"
      },
      {
        id: 6,
        question: "What documents do I need for KYC?",
        answer: "You need a valid government-issued ID (CNIC, Passport, or Driver's License) and a recent utility bill or bank statement for address verification.",
        category: "KYC"
      },
      {
        id: 7,
        question: "How long does KYC verification take?",
        answer: "KYC verification typically takes 1-3 business days. You'll receive an email notification once your documents are reviewed and approved.",
        category: "KYC"
      },
      {
        id: 8,
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers, credit cards, and debit cards. All payments are processed securely through our payment partners.",
        category: "Payment"
      },
      {
        id: 9,
        question: "Is my investment secure?",
        answer: "Yes, all investments are backed by real properties and are legally protected. We maintain comprehensive insurance and follow strict regulatory compliance.",
        category: "Security"
      },
      {
        id: 10,
        question: "How can I contact customer support?",
        answer: "You can contact us through WhatsApp, phone call, or email. Visit the support section in the app to get our contact details and submit your queries.",
        category: "Support"
      }
    ];

    res.json({
      success: true,
      data: {
        faqs: faqs
      }
    });

  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve FAQ',
      message: error.message
    });
  }
});

// Get support contact information
router.get('/contact-info', async (req, res) => {
  try {
    const contactInfo = {
      whatsapp: {
        number: "+92-300-1234567",
        message: "Hi, I need help with my HMR Builders account"
      },
      phone: {
        number: "+92-21-1234567",
        hours: "9:00 AM - 6:00 PM (Monday to Friday)"
      },
      email: {
        address: "support@hmrbuilders.com",
        responseTime: "Within 24 hours"
      },
      address: {
        street: "123 Business District",
        city: "Karachi",
        country: "Pakistan"
      }
    };

    res.json({
      success: true,
      data: contactInfo
    });

  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact information',
      message: error.message
    });
  }
});

module.exports = router;
