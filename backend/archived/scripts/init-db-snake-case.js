/**
 * Initialize Database with Snake Case Naming
 * Uses TypeORM synchronize to auto-create tables with snake_case
 */

require('dotenv').config();
const { DataSource } = require('typeorm');
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');
const glob = require('glob');
const path = require('path');

// Register ts-node for TypeScript support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

async function initializeDatabase() {
  // Load entity files
  const entityFiles = glob.sync(path.join(__dirname, '../src/**/*.entity.ts'));
  const entities = entityFiles.map(file => require(file)).flatMap(m => Object.values(m));

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
    entities: entities,
    synchronize: true, // Auto-create tables with snake_case
    namingStrategy: new SnakeNamingStrategy(),
    logging: true,
  });

  try {
    console.log('🔄 Initializing database with snake_case naming...\n');
    await dataSource.initialize();
    console.log('\n✅ Database initialized successfully with snake_case!');
    console.log('📊 All table columns are now in snake_case format\n');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

initializeDatabase();
