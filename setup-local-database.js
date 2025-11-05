const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Local database connection
const LOCAL_DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  database: 'emergency_sos', // Connect to default postgres database first
  password: 'Revanth2005',
  port: 5433,
};

const TARGET_DB = 'emergency_sos';

async function setupDatabase() {
  let adminClient;
  let targetClient;

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    
    // Connect to default postgres database
    adminClient = new Pool({
      ...LOCAL_DB_CONFIG,
      database: 'postgres'
    });

    await adminClient.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Check if target database exists
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [TARGET_DB]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📦 Creating database '${TARGET_DB}'...`);
      await adminClient.query(`CREATE DATABASE ${TARGET_DB}`);
      console.log('✅ Database created');
    } else {
      console.log(`✅ Database '${TARGET_DB}' already exists`);
    }

    await adminClient.end();

    // Connect to target database
    targetClient = new Pool({
      ...LOCAL_DB_CONFIG,
      database: TARGET_DB
    });

    await targetClient.query('SELECT NOW()');
    console.log(`✅ Connected to '${TARGET_DB}' database`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'backend', 'database', 'complete_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    console.log('📋 Reading schema file...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Executing schema...');
    await targetClient.query(schemaSQL);

    console.log('✅ Schema executed successfully!');

    // Verify tables were created
    const tablesResult = await targetClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`\n📊 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check for demo users
    const usersResult = await targetClient.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`);

    console.log('\n✅ Local database setup completed successfully!');
    console.log('\n📝 Connection String:');
    console.log(`   postgresql://postgres:1234@localhost:5432/${TARGET_DB}`);
    console.log('\n🚀 You can now start the application with:');
    console.log('   npm run dev:alt');
    console.log('   OR');
    console.log('   cd backend && npm run dev');

    await targetClient.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error('   Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Make sure PostgreSQL is installed');
      console.error('   2. Make sure PostgreSQL service is running');
      console.error('   3. Check if PostgreSQL is on port 5432');
      console.error('   4. Verify username/password are correct');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   1. PostgreSQL username (default: postgres)');
      console.error('   2. PostgreSQL password');
      console.error('\n   You can modify LOCAL_DB_CONFIG in setup-local-database.js');
    }

    if (adminClient) await adminClient.end();
    if (targetClient) await targetClient.end();
    process.exit(1);
  }
}

setupDatabase();

