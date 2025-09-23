const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const logger = require('../utils/logger');

const runSeeds = async () => {
  try {
    logger.info('Starting database seeding...');

    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${seedFiles.length} seed files`);

    for (const file of seedFiles) {
      logger.info(`Running seed: ${file}`);
      
      const seedSQL = fs.readFileSync(
        path.join(seedsDir, file), 
        'utf8'
      );

      await db.query(seedSQL);
      logger.info(`✓ Seed ${file} completed successfully`);
    }

    logger.info('All seeds completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Check if this script is being run directly
if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;