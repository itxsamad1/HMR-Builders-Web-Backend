const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Property = require('../models/Property');
const Investment = require('../models/Investment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Database connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@hmrbuilders.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      kycStatus: 'verified',
      investmentProfile: {
        riskTolerance: 'aggressive',
        investmentExperience: 'advanced',
        annualIncome: 'over-10m',
        netWorth: 'over-50m'
      }
    });

    // Create test users
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        kycStatus: 'verified',
        investmentProfile: {
          riskTolerance: 'moderate',
          investmentExperience: 'intermediate',
          annualIncome: '1m-5m',
          netWorth: '5m-10m'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        isEmailVerified: true,
        kycStatus: 'verified',
        investmentProfile: {
          riskTolerance: 'conservative',
          investmentExperience: 'beginner',
          annualIncome: '500k-1m',
          netWorth: '1m-5m'
        }
      },
      {
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        password: 'Password123!',
        firstName: 'Ahmed',
        lastName: 'Khan',
        isEmailVerified: true,
        kycStatus: 'pending',
        investmentProfile: {
          riskTolerance: 'moderate',
          investmentExperience: 'beginner',
          annualIncome: '500k-1m',
          netWorth: '1m-5m'
        }
      }
    ];

    const users = [adminUser, ...testUsers];
    await User.insertMany(users);
    console.log('✅ Users seeded successfully');
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedProperties = async () => {
  try {
    // Clear existing properties
    await Property.deleteMany({});

    const properties = [
      {
        title: 'H1 Tower',
        slug: 'h1-tower',
        description: 'H1 Tower is the Flagship Tower of HMR Waterfront - a G+39 floors architectural masterpiece offering panoramic Arabian Sea views. Located at Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, right by the Arabian Sea corridor with easy walking access to HMR promenade.',
        shortDescription: 'Flagship Tower with panoramic Arabian Sea views',
        location: {
          address: 'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi',
          city: 'Karachi',
          state: 'Sindh',
          country: 'Pakistan',
          coordinates: {
            latitude: 24.8607,
            longitude: 67.0011
          }
        },
        propertyType: 'residential',
        projectType: 'flagship',
        status: 'active',
        construction: {
          floors: 'Ground + 39',
          totalUnits: 200,
          constructionProgress: 40,
          startDate: new Date('2023-01-01'),
          expectedCompletion: new Date('2025-12-31'),
          handoverDate: new Date('2025-12-31')
        },
        pricing: {
          totalValue: 'PKR 8.92 - 39.11 Cr',
          marketValue: 'PKR 10.71 - 46.93 Cr',
          appreciation: '20.0%',
          expectedROI: '18-22%',
          minInvestment: 'PKR 89,200 - 391,100'
        },
        tokenization: {
          totalTokens: 1000,
          availableTokens: 342,
          pricePerToken: 'PKR 89,200 - 391,100',
          tokenPrice: 'PKR 95,000'
        },
        unitTypes: [
          {
            type: '1-Bedroom Apartment',
            area: '907-1,121 sq ft',
            price: 'PKR 8.92 Cr',
            bedrooms: 1,
            bathrooms: 1,
            tokens: 1000,
            tokenPrice: 'PKR 89,200'
          },
          {
            type: '2-Bedroom Apartment',
            area: '2,037-2,433 sq ft',
            price: 'PKR 8.92-10.30 Cr',
            bedrooms: 2,
            bathrooms: 2,
            tokens: 1000,
            tokenPrice: 'PKR 89,200-103,000'
          },
          {
            type: '3-Bedroom Apartment',
            area: '2,800-3,200 sq ft',
            price: 'PKR 12.18-13.60 Cr',
            bedrooms: 3,
            bathrooms: 3,
            tokens: 1000,
            tokenPrice: 'PKR 121,800-136,000'
          },
          {
            type: '4-Bedroom Apartment',
            area: '3,500-4,000 sq ft',
            price: 'PKR 16.72-18.95 Cr',
            bedrooms: 4,
            bathrooms: 4,
            tokens: 1000,
            tokenPrice: 'PKR 167,200-189,500'
          },
          {
            type: 'Townhouse',
            area: '6,899-7,589 sq ft',
            price: 'PKR 25.00+ Cr',
            bedrooms: 4,
            bathrooms: 5,
            tokens: 1000,
            tokenPrice: 'PKR 250,000+'
          },
          {
            type: 'Penthouse',
            area: '8,356-8,933 sq ft',
            price: 'PKR 39.11 Cr',
            bedrooms: 4,
            bathrooms: 5,
            tokens: 1000,
            tokenPrice: 'PKR 391,100'
          }
        ],
        features: [
          { icon: 'home', title: 'Elegant Reception', description: 'Grand lobby with 24/7 concierge service' },
          { icon: 'users', title: '24 hours Concierge', description: 'Round-the-clock concierge service' },
          { icon: 'waves', title: 'Sea and Boulevard Apartments', description: 'Stunning waterfront and city views' },
          { icon: 'waves', title: 'Infinity Pool', description: 'Rooftop infinity pool with panoramic views' },
          { icon: 'building', title: 'Multi-Purpose Hall', description: 'Community space for events and gatherings' },
          { icon: 'dumbbell', title: 'Fully Equipped Gym', description: 'State-of-the-art fitness center' }
        ],
        images: {
          main: '/projects/h1-tower/main.jpg',
          gallery: [
            '/projects/h1-tower/feature1.jpg',
            '/projects/h1-tower/feature2.jpg',
            '/projects/h1-tower/feature3.jpg',
            '/projects/h1-tower/feature4.jpg'
          ]
        },
        isFeatured: true,
        sortOrder: 1
      },
      {
        title: 'Saima Tower',
        slug: 'saima-tower',
        description: 'Saima Tower is a Ground + 40 storey residential project of iconic significance positioned right in front of the Arabian Sea at HMR Waterfront. Ultra-luxury apartments with unobstructed sea views and every conceivable modern amenity.',
        shortDescription: 'Ultra-luxury tower with unobstructed sea views',
        location: {
          address: 'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi',
          city: 'Karachi',
          state: 'Sindh',
          country: 'Pakistan',
          coordinates: {
            latitude: 24.8607,
            longitude: 67.0011
          }
        },
        propertyType: 'residential',
        projectType: 'ultra-luxury',
        status: 'coming-soon',
        construction: {
          floors: 'Ground + 40',
          totalUnits: 180,
          constructionProgress: 0,
          startDate: new Date('2024-06-01'),
          expectedCompletion: new Date('2026-12-31'),
          handoverDate: new Date('2026-12-31')
        },
        pricing: {
          totalValue: 'PKR 7.50 - 28.50 Cr',
          marketValue: 'PKR 9.00 - 34.20 Cr',
          appreciation: '20.8%',
          expectedROI: '17-21%',
          minInvestment: 'PKR 75,000 - 285,000'
        },
        tokenization: {
          totalTokens: 1000,
          availableTokens: 1000,
          pricePerToken: 'PKR 75,000 - 285,000',
          tokenPrice: 'PKR 85,000'
        },
        unitTypes: [
          {
            type: '1-Bedroom Apartment',
            area: '1,200-1,500 sq ft',
            price: 'PKR 7.50 Cr',
            bedrooms: 1,
            bathrooms: 1,
            tokens: 1000,
            tokenPrice: 'PKR 75,000'
          },
          {
            type: '2-Bedroom Apartment',
            area: '2,200-2,800 sq ft',
            price: 'PKR 9.50-12.00 Cr',
            bedrooms: 2,
            bathrooms: 2,
            tokens: 1000,
            tokenPrice: 'PKR 95,000-120,000'
          },
          {
            type: '3-Bedroom Apartment',
            area: '3,000-3,500 sq ft',
            price: 'PKR 15.00-18.00 Cr',
            bedrooms: 3,
            bathrooms: 3,
            tokens: 1000,
            tokenPrice: 'PKR 150,000-180,000'
          },
          {
            type: '4-Bedroom Apartment',
            area: '4,000-4,500 sq ft',
            price: 'PKR 22.00-25.00 Cr',
            bedrooms: 4,
            bathrooms: 4,
            tokens: 1000,
            tokenPrice: 'PKR 220,000-250,000'
          },
          {
            type: 'Penthouse',
            area: '6,000-7,000 sq ft',
            price: 'PKR 28.50 Cr',
            bedrooms: 4,
            bathrooms: 5,
            tokens: 1000,
            tokenPrice: 'PKR 285,000'
          }
        ],
        features: [
          { icon: 'home', title: '24 ft Height Grand Lobby', description: 'Luxurious grand lobby with impressive height' },
          { icon: 'users', title: 'Luxury Lounge Area', description: 'Exclusive resident lounge' },
          { icon: 'users', title: '24/7 Concierge Service', description: 'Round-the-clock concierge service' },
          { icon: 'waves', title: 'West-Open Seafront Apartments', description: 'Apartments with direct sea views' },
          { icon: 'waves', title: 'Exclusive Swimming Pool', description: 'Private swimming pool for residents' },
          { icon: 'dumbbell', title: 'State-of-the-Art Gym', description: 'Premium fitness center' }
        ],
        images: {
          main: '/projects/saima-tower/main.jpg',
          gallery: [
            '/projects/saima-tower/feature1.jpg',
            '/projects/saima-tower/feature2.jpg',
            '/projects/saima-tower/feature3.jpg',
            '/projects/saima-tower/feature4.jpg'
          ]
        },
        isFeatured: true,
        sortOrder: 2
      },
      {
        title: 'AA Waterfront',
        slug: 'aa-waterfront',
        description: 'AA Waterfront embodies extraordinary living at HMR Waterfront. The Ground + 37 storey project features stunning apartments with expensive sea views, smart luxurious apartments, and smart duplex penthouses that redefine comfortable coastal lifestyles.',
        shortDescription: 'Smart luxury apartments with sea views',
        location: {
          address: 'Abdul Sattar Edhi Ave, D.H.A. Phase 8 Zone D, Karachi',
          city: 'Karachi',
          state: 'Sindh',
          country: 'Pakistan',
          coordinates: {
            latitude: 24.8607,
            longitude: 67.0011
          }
        },
        propertyType: 'residential',
        projectType: 'smart-luxury',
        status: 'coming-soon',
        construction: {
          floors: 'Ground + 37',
          totalUnits: 160,
          constructionProgress: 0,
          startDate: new Date('2024-09-01'),
          expectedCompletion: new Date('2027-06-30'),
          handoverDate: new Date('2027-06-30')
        },
        pricing: {
          totalValue: 'PKR 6.80 - 25.20 Cr',
          marketValue: 'PKR 8.16 - 30.24 Cr',
          appreciation: '22.0%',
          expectedROI: '16-20%',
          minInvestment: 'PKR 68,000 - 252,000'
        },
        tokenization: {
          totalTokens: 1000,
          availableTokens: 1000,
          pricePerToken: 'PKR 68,000 - 252,000',
          tokenPrice: 'PKR 75,000'
        },
        unitTypes: [
          {
            type: '1-Bedroom Smart Apartment',
            area: '1,000-1,300 sq ft',
            price: 'PKR 6.80 Cr',
            bedrooms: 1,
            bathrooms: 1,
            tokens: 1000,
            tokenPrice: 'PKR 68,000'
          },
          {
            type: '2-Bedroom Sea View Apartment',
            area: '2,000-2,500 sq ft',
            price: 'PKR 8.50-10.50 Cr',
            bedrooms: 2,
            bathrooms: 2,
            tokens: 1000,
            tokenPrice: 'PKR 85,000-105,000'
          },
          {
            type: '3-Bedroom Premium Apartment',
            area: '2,800-3,200 sq ft',
            price: 'PKR 12.00-15.00 Cr',
            bedrooms: 3,
            bathrooms: 3,
            tokens: 1000,
            tokenPrice: 'PKR 120,000-150,000'
          },
          {
            type: '4-Bedroom Elite Apartment',
            area: '3,500-4,000 sq ft',
            price: 'PKR 18.00-22.00 Cr',
            bedrooms: 4,
            bathrooms: 4,
            tokens: 1000,
            tokenPrice: 'PKR 180,000-220,000'
          },
          {
            type: '6-Bedroom Penthouse with Private Pool',
            area: '5,500-6,500 sq ft',
            price: 'PKR 25.20 Cr',
            bedrooms: 6,
            bathrooms: 6,
            tokens: 1000,
            tokenPrice: 'PKR 252,000'
          }
        ],
        features: [
          { icon: 'home', title: 'Grand Reception Area', description: 'Elegant reception with modern design' },
          { icon: 'home', title: 'Smart Home Apartments', description: 'Fully automated smart home features' },
          { icon: 'users', title: 'Luxury Lounge Area', description: 'Exclusive resident lounge' },
          { icon: 'building', title: 'Community Hall', description: 'Multi-purpose community space' },
          { icon: 'waves', title: 'Infinity Swimming Pool', description: 'Rooftop infinity pool' },
          { icon: 'building', title: 'Premium Retail Showrooms', description: 'Ground floor retail spaces' }
        ],
        images: {
          main: '/projects/aa-waterfront/main.jpg',
          gallery: [
            '/projects/aa-waterfront/feature1.jpg',
            '/projects/aa-waterfront/feature2.jpg',
            '/projects/aa-waterfront/feature3.jpg',
            '/projects/aa-waterfront/feature4.jpg'
          ]
        },
        isFeatured: true,
        sortOrder: 3
      }
    ];

    await Property.insertMany(properties);
    console.log('✅ Properties seeded successfully');
    return properties;
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    throw error;
  }
};

const seedInvestments = async (users, properties) => {
  try {
    // Clear existing investments
    await Investment.deleteMany({});

    const investments = [
      {
        user: users[1]._id, // John Doe
        property: properties[0]._id, // H1 Tower
        investmentAmount: 950000,
        tokensPurchased: 10,
        pricePerToken: 95000,
        payment: {
          method: 'bank_transfer',
          transactionId: 'TXN001',
          paymentStatus: 'completed',
          paymentDate: new Date()
        },
        status: 'active',
        confirmedAt: new Date(),
        activatedAt: new Date(),
        returns: {
          totalEarned: 50000,
          lastDividendDate: new Date(),
          nextDividendDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        user: users[2]._id, // Jane Smith
        property: properties[0]._id, // H1 Tower
        investmentAmount: 475000,
        tokensPurchased: 5,
        pricePerToken: 95000,
        payment: {
          method: 'credit_card',
          transactionId: 'TXN002',
          paymentStatus: 'completed',
          paymentDate: new Date()
        },
        status: 'active',
        confirmedAt: new Date(),
        activatedAt: new Date(),
        returns: {
          totalEarned: 25000,
          lastDividendDate: new Date(),
          nextDividendDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    await Investment.insertMany(investments);
    console.log('✅ Investments seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding investments:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    const properties = await seedProperties();
    await seedInvestments(users, properties);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log(`- ${users.length} users (including admin)`);
    console.log(`- ${properties.length} properties`);
    console.log(`- 2 sample investments`);
    console.log('\n🔑 Admin credentials:');
    console.log('Email: admin@hmrbuilders.com');
    console.log('Password: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
