const fs = require('fs');
const path = require('path');
const { query, connectDB } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🏗️  Creating tables and indexes...');
    try {
      await query(schemaSQL);
    } catch (error) {
      if (error.code === '42710' || error.code === '42P07') {
        console.log('⚠️  Some tables/triggers already exist, continuing...');
      } else {
        throw error;
      }
    }
    
    console.log('📄 Reading seed file...');
    const seedPath = path.join(__dirname, '../sql/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding database...');
    try {
      await query(seedSQL);
    } catch (error) {
      if (error.code === '23505') {
        console.log('⚠️  Some data already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    
    // Get counts
    const userCount = await query('SELECT COUNT(*) FROM users');
    const propertyCount = await query('SELECT COUNT(*) FROM properties');
    
    console.log(`   👥 Users: ${userCount.rows[0].count}`);
    console.log(`   🏢 Properties: ${propertyCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
