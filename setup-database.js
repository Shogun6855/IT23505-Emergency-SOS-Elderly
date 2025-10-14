const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection string from demo credentials
const DATABASE_URL = 'postgresql://postgres:wTXRhREDHbxiaMRzsgdAoQVuSjYTTCSf@shinkansen.proxy.rlwy.net:55982/railway';

const pool = new Pool({
  connectionString: DATABASE_URL
});

async function setupDatabase() {
  let client;
  
  try {
    console.log('🔄 Setting up PostgreSQL database connection...');
    
    // Test connection
    client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Check current time
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log(`📅 Database time: ${timeResult.rows[0].current_time}`);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tablesResult.rows.length} existing tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // If no tables exist, run the complete schema
    if (tablesResult.rows.length === 0) {
      console.log('🔄 No tables found. Running complete schema...');
      
      const schemaPath = path.join(__dirname, 'backend', 'database', 'complete_schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      await client.query(schemaSQL);
      console.log('✅ Complete schema executed successfully!');
      
      // Check tables again
      const newTablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log(`📋 Created ${newTablesResult.rows.length} tables:`);
      newTablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('✅ Database tables already exist. Skipping schema creation.');
    }
    
    // Test a simple query on users table
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${userCount.rows[0].count}`);
    } catch (error) {
      console.log('ℹ️  Users table not found or empty');
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('🚀 You can now run your application with: npm run dev:alt');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 The database server is not running or not accessible.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   💡 The database hostname could not be resolved.');
    } else if (error.code === '28P01') {
      console.error('   💡 Authentication failed. Check username/password.');
    } else if (error.code === '3D000') {
      console.error('   💡 Database does not exist.');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

setupDatabase();
