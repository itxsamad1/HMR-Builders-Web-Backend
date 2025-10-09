require('dotenv').config();
const { Pool } = require('pg');

let pool;

const connectDB = async () => {
  try {
    // Parse the DATABASE_URL to handle SSL properly
    const url = new URL(process.env.DATABASE_URL);
    
    pool = new Pool({
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false // Required for NeonDB
      },
      max: 10,
      min: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      acquireTimeoutMillis: 10000,
      createTimeoutMillis: 10000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    });

    // Test the connection
    const client = await pool.connect();
    console.log('📊 PostgreSQL Connected: Database connection established');
    client.release();

    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return pool;
};

const query = async (text, params) => {
  const pool = getPool();
  const start = Date.now();
  let retries = 3;
  
  while (retries > 0) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error (retries left:', retries - 1, '):', error.message);
      
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        retries--;
        if (retries > 0) {
          console.log('Retrying query in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
      
      throw error;
    }
  }
};

const getClient = async () => {
  const pool = getPool();
  return await pool.connect();
};

module.exports = {
  connectDB,
  getPool,
  query,
  getClient
};