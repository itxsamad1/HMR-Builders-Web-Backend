const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Sample data with proper UUIDs
const users = [
  {
    id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    name: 'Afraz Alam',
    first_name: 'Afraz',
    last_name: 'Alam',
    email: 'afrazalam@example.com',
    phone: '+92-300-1234567',
    kyc_status: 'verified'
  },
  {
    id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    name: 'Sarah Khan',
    first_name: 'Sarah',
    last_name: 'Khan',
    email: 'sarahkhan@example.com',
    phone: '+92-301-2345678',
    kyc_status: 'verified'
  },
  {
    id: 'c8925131-e603-6gdh-003c-6e5267f7g773',
    name: 'Ahmed Hassan',
    first_name: 'Ahmed',
    last_name: 'Hassan',
    email: 'ahmedhassan@example.com',
    phone: '+92-302-3456789',
    kyc_status: 'pending'
  },
  {
    id: 'd9036242-f714-7hei-114d-7f6378g8h884',
    name: 'Fatima Ali',
    first_name: 'Fatima',
    last_name: 'Ali',
    email: 'fatimaali@example.com',
    phone: '+92-303-4567890',
    kyc_status: 'verified'
  },
  {
    id: 'e0147353-g825-8ifj-225e-8g7489h9i995',
    name: 'Omar Malik',
    first_name: 'Omar',
    last_name: 'Malik',
    email: 'omarmalik@example.com',
    phone: '+92-304-5678901',
    kyc_status: 'verified'
  }
];

const properties = [
  {
    id: 'prop-001',
    title: 'Marina Heights Tower',
    slug: 'marina-heights-tower',
    description: 'Luxury residential tower with stunning marina views',
    property_type: 'residential',
    status: 'active',
    location: JSON.stringify({
      address: 'Marina District, Karachi',
      city: 'Karachi',
      state: 'Sindh',
      country: 'Pakistan',
      coordinates: { lat: 24.8607, lng: 67.0011 }
    }),
    price_per_token: 1500,
    total_tokens: 10000,
    tokens_available: 2500,
    min_investment: 50000,
    max_investment: 5000000,
    expected_roi: 12.5,
    investment_duration: 36,
    images: JSON.stringify({
      thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
      ]
    }),
    features: JSON.stringify(['Marina View', 'Gym', 'Pool', 'Parking', 'Security']),
    is_featured: true
  },
  {
    id: 'prop-002',
    title: 'DHA Phase 8 Villa',
    slug: 'dha-phase-8-villa',
    description: 'Spacious family villa in premium DHA location',
    property_type: 'residential',
    status: 'active',
    location: JSON.stringify({
      address: 'DHA Phase 8, Lahore',
      city: 'Lahore',
      state: 'Punjab',
      country: 'Pakistan',
      coordinates: { lat: 31.5204, lng: 74.3587 }
    }),
    price_per_token: 2000,
    total_tokens: 8000,
    tokens_available: 1200,
    min_investment: 75000,
    max_investment: 3000000,
    expected_roi: 15.2,
    investment_duration: 24,
    images: JSON.stringify({
      thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
      ]
    }),
    features: JSON.stringify(['Garden', 'Garage', 'Study Room', 'Balcony', 'Modern Kitchen']),
    is_featured: true
  },
  {
    id: 'prop-003',
    title: 'Islamabad Commercial Plaza',
    slug: 'islamabad-commercial-plaza',
    description: 'Prime commercial property in Blue Area',
    property_type: 'commercial',
    status: 'active',
    location: JSON.stringify({
      address: 'Blue Area, Islamabad',
      city: 'Islamabad',
      state: 'Federal',
      country: 'Pakistan',
      coordinates: { lat: 33.6844, lng: 73.0479 }
    }),
    price_per_token: 3000,
    total_tokens: 15000,
    tokens_available: 5000,
    min_investment: 100000,
    max_investment: 8000000,
    expected_roi: 18.5,
    investment_duration: 48,
    images: JSON.stringify({
      thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop'
      ]
    }),
    features: JSON.stringify(['Prime Location', 'Parking', 'Elevator', 'Security', 'Air Conditioning']),
    is_featured: false
  }
];

const userWallets = [
  {
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    available_balance: 2500000,
    total_investment: 1500000,
    total_tokens: 1000
  },
  {
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    available_balance: 1800000,
    total_investment: 2200000,
    total_tokens: 1500
  },
  {
    user_id: 'c8925131-e603-6gdh-003c-6e5267f7g773',
    available_balance: 500000,
    total_investment: 750000,
    total_tokens: 500
  },
  {
    user_id: 'd9036242-f714-7hei-114d-7f6378g8h884',
    available_balance: 3200000,
    total_investment: 2800000,
    total_tokens: 2000
  },
  {
    user_id: 'e0147353-g825-8ifj-225e-8g7489h9i995',
    available_balance: 1200000,
    total_investment: 1800000,
    total_tokens: 1200
  }
];

const investments = [
  // Afraz's investments
  {
    id: 'inv-001',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    property_id: 'prop-001',
    investment_amount: 750000,
    tokens_purchased: 500,
    price_per_token: 1500,
    status: 'active',
    total_earned: 125000
  },
  {
    id: 'inv-002',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    property_id: 'prop-002',
    investment_amount: 600000,
    tokens_purchased: 300,
    price_per_token: 2000,
    status: 'active',
    total_earned: 95000
  },
  // Sarah's investments
  {
    id: 'inv-003',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    property_id: 'prop-001',
    investment_amount: 900000,
    tokens_purchased: 600,
    price_per_token: 1500,
    status: 'active',
    total_earned: 150000
  },
  {
    id: 'inv-004',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    property_id: 'prop-003',
    investment_amount: 1200000,
    tokens_purchased: 400,
    price_per_token: 3000,
    status: 'active',
    total_earned: 200000
  },
  // Ahmed's investments
  {
    id: 'inv-005',
    user_id: 'c8925131-e603-6gdh-003c-6e5267f7g773',
    property_id: 'prop-002',
    investment_amount: 400000,
    tokens_purchased: 200,
    price_per_token: 2000,
    status: 'active',
    total_earned: 60000
  },
  // Fatima's investments
  {
    id: 'inv-006',
    user_id: 'd9036242-f714-7hei-114d-7f6378g8h884',
    property_id: 'prop-001',
    investment_amount: 1500000,
    tokens_purchased: 1000,
    price_per_token: 1500,
    status: 'active',
    total_earned: 250000
  },
  {
    id: 'inv-007',
    user_id: 'd9036242-f714-7hei-114d-7f6378g8h884',
    property_id: 'prop-003',
    investment_amount: 900000,
    tokens_purchased: 300,
    price_per_token: 3000,
    status: 'active',
    total_earned: 150000
  },
  // Omar's investments
  {
    id: 'inv-008',
    user_id: 'e0147353-g825-8ifj-225e-8g7489h9i995',
    property_id: 'prop-002',
    investment_amount: 800000,
    tokens_purchased: 400,
    price_per_token: 2000,
    status: 'active',
    total_earned: 120000
  },
  {
    id: 'inv-009',
    user_id: 'e0147353-g825-8ifj-225e-8g7489h9i995',
    property_id: 'prop-003',
    investment_amount: 600000,
    tokens_purchased: 200,
    price_per_token: 3000,
    status: 'active',
    total_earned: 100000
  }
];

const walletTransactions = [
  // Afraz's transactions
  {
    id: 'wt-001',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    type: 'deposit',
    amount: 2000000,
    currency: 'PKR',
    status: 'completed',
    description: 'Initial deposit via bank transfer'
  },
  {
    id: 'wt-002',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    type: 'investment',
    amount: -750000,
    currency: 'PKR',
    status: 'completed',
    description: 'Investment in Marina Heights Tower'
  },
  {
    id: 'wt-003',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    type: 'investment',
    amount: -600000,
    currency: 'PKR',
    status: 'completed',
    description: 'Investment in DHA Phase 8 Villa'
  },
  {
    id: 'wt-004',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    type: 'dividend',
    amount: 50000,
    currency: 'PKR',
    status: 'completed',
    description: 'Monthly dividend from Marina Heights Tower'
  },
  // Sarah's transactions
  {
    id: 'wt-005',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    type: 'deposit',
    amount: 3000000,
    currency: 'PKR',
    status: 'completed',
    description: 'Initial deposit via credit card'
  },
  {
    id: 'wt-006',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    type: 'investment',
    amount: -900000,
    currency: 'PKR',
    status: 'completed',
    description: 'Investment in Marina Heights Tower'
  },
  {
    id: 'wt-007',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    type: 'investment',
    amount: -1200000,
    currency: 'PKR',
    status: 'completed',
    description: 'Investment in Islamabad Commercial Plaza'
  },
  {
    id: 'wt-008',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    type: 'dividend',
    amount: 75000,
    currency: 'PKR',
    status: 'completed',
    description: 'Monthly dividend from investments'
  }
];

const paymentMethods = [
  {
    id: 'pm-001',
    user_id: 'a6702919-c381-4ebe-881a-4c3045d5f551',
    card_type: 'visa',
    card_number_masked: '****-****-****-1234',
    card_holder_name: 'Afraz Alam',
    expiry_month: 12,
    expiry_year: 2026,
    currency: 'PKR',
    is_default: true,
    is_verified: true,
    status: 'active'
  },
  {
    id: 'pm-002',
    user_id: 'b7814020-d492-5fcf-992b-5d4156e6f662',
    card_type: 'mastercard',
    card_number_masked: '****-****-****-5678',
    card_holder_name: 'Sarah Khan',
    expiry_month: 8,
    expiry_year: 2027,
    currency: 'PKR',
    is_default: true,
    is_verified: true,
    status: 'active'
  },
  {
    id: 'pm-003',
    user_id: 'c8925131-e603-6gdh-003c-6e5267f7g773',
    card_type: 'visa',
    card_number_masked: '****-****-****-9012',
    card_holder_name: 'Ahmed Hassan',
    expiry_month: 3,
    expiry_year: 2025,
    currency: 'PKR',
    is_default: true,
    is_verified: false,
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await pool.query('DELETE FROM wallet_transactions');
    await pool.query('DELETE FROM investments');
    await pool.query('DELETE FROM payment_methods');
    await pool.query('DELETE FROM user_wallets');
    await pool.query('DELETE FROM properties');
    await pool.query('DELETE FROM users');

    // Insert users
    console.log('👥 Inserting users...');
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (id, name, first_name, last_name, email, phone, kyc_status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          kyc_status = EXCLUDED.kyc_status
      `, [user.id, user.name, user.first_name, user.last_name, user.email, user.phone, user.kyc_status]);
    }

    // Insert properties
    console.log('🏢 Inserting properties...');
    for (const property of properties) {
      await pool.query(`
        INSERT INTO properties (id, title, slug, description, property_type, status, location, 
                               price_per_token, total_tokens, tokens_available, min_investment, 
                               max_investment, expected_roi, investment_duration, images, 
                               features, is_featured, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          property_type = EXCLUDED.property_type,
          status = EXCLUDED.status,
          location = EXCLUDED.location,
          price_per_token = EXCLUDED.price_per_token,
          total_tokens = EXCLUDED.total_tokens,
          tokens_available = EXCLUDED.tokens_available,
          min_investment = EXCLUDED.min_investment,
          max_investment = EXCLUDED.max_investment,
          expected_roi = EXCLUDED.expected_roi,
          investment_duration = EXCLUDED.investment_duration,
          images = EXCLUDED.images,
          features = EXCLUDED.features,
          is_featured = EXCLUDED.is_featured
      `, [
        property.id, property.title, property.slug, property.description, property.property_type,
        property.status, property.location, property.price_per_token, property.total_tokens,
        property.tokens_available, property.min_investment, property.max_investment,
        property.expected_roi, property.investment_duration, property.images,
        property.features, property.is_featured
      ]);
    }

    // Insert user wallets
    console.log('💰 Inserting user wallets...');
    for (const wallet of userWallets) {
      await pool.query(`
        INSERT INTO user_wallets (user_id, available_balance, total_investment, total_tokens, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          available_balance = EXCLUDED.available_balance,
          total_investment = EXCLUDED.total_investment,
          total_tokens = EXCLUDED.total_tokens
      `, [wallet.user_id, wallet.available_balance, wallet.total_investment, wallet.total_tokens]);
    }

    // Insert investments
    console.log('📈 Inserting investments...');
    for (const investment of investments) {
      await pool.query(`
        INSERT INTO investments (id, user_id, property_id, investment_amount, tokens_purchased, 
                                price_per_token, status, total_earned, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          property_id = EXCLUDED.property_id,
          investment_amount = EXCLUDED.investment_amount,
          tokens_purchased = EXCLUDED.tokens_purchased,
          price_per_token = EXCLUDED.price_per_token,
          status = EXCLUDED.status,
          total_earned = EXCLUDED.total_earned
      `, [
        investment.id, investment.user_id, investment.property_id, investment.investment_amount,
        investment.tokens_purchased, investment.price_per_token, investment.status, investment.total_earned
      ]);
    }

    // Insert wallet transactions
    console.log('💳 Inserting wallet transactions...');
    for (const transaction of walletTransactions) {
      await pool.query(`
        INSERT INTO wallet_transactions (id, user_id, type, amount, currency, status, description, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          type = EXCLUDED.type,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status,
          description = EXCLUDED.description
      `, [
        transaction.id, transaction.user_id, transaction.type, transaction.amount,
        transaction.currency, transaction.status, transaction.description
      ]);
    }

    // Insert payment methods
    console.log('💳 Inserting payment methods...');
    for (const paymentMethod of paymentMethods) {
      await pool.query(`
        INSERT INTO payment_methods (id, user_id, card_type, card_number_masked, card_holder_name, 
                                    expiry_month, expiry_year, currency, is_default, is_verified, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          card_type = EXCLUDED.card_type,
          card_number_masked = EXCLUDED.card_number_masked,
          card_holder_name = EXCLUDED.card_holder_name,
          expiry_month = EXCLUDED.expiry_month,
          expiry_year = EXCLUDED.expiry_year,
          currency = EXCLUDED.currency,
          is_default = EXCLUDED.is_default,
          is_verified = EXCLUDED.is_verified,
          status = EXCLUDED.status
      `, [
        paymentMethod.id, paymentMethod.user_id, paymentMethod.card_type, paymentMethod.card_number_masked,
        paymentMethod.card_holder_name, paymentMethod.expiry_month, paymentMethod.expiry_year,
        paymentMethod.currency, paymentMethod.is_default, paymentMethod.is_verified, paymentMethod.status
      ]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Properties: ${properties.length}`);
    console.log(`💰 Wallets: ${userWallets.length}`);
    console.log(`📈 Investments: ${investments.length}`);
    console.log(`💳 Transactions: ${walletTransactions.length}`);
    console.log(`💳 Payment Methods: ${paymentMethods.length}`);

    console.log('\n🔄 User IDs for testing:');
    users.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name}: ${user.id}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
