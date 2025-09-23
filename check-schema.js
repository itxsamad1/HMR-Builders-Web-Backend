const { query, connectDB } = require('./config/database');

async function checkSchema() {
  try {
    await connectDB();
    
    // Check user_wallets table structure
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_wallets'
    `);
    console.log('User wallets columns:', result.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
