const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      logger.info(`Running migration: ${file}`);
      
      const migrationSQL = fs.readFileSync(
        path.join(migrationsDir, file), 
        'utf8'
      );

      await db.query(migrationSQL);
      logger.info(`✓ Migration ${file} completed successfully`);
    }

    logger.info('All migrations completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

// Check if this script is being run directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;