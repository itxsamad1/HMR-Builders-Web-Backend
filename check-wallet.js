const { query, connectDB } = require('./config/database');

async function checkWallet() {
  try {
    await connectDB();
    
    // Check constraints
    const constraints = await query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_wallets'
    `);
    console.log('Constraints:', constraints.rows);
    
    // Check if user_id is unique
    const uniqueCheck = await query(`
      SELECT COUNT(*) as count 
      FROM user_wallets 
      WHERE user_id = '8783c735-c773-42c8-b827-b6ef9f89781a'
    `);
    console.log('User wallet count:', uniqueCheck.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkWallet();
