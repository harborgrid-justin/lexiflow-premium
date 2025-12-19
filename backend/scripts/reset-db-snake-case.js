#!/usr/bin/env node
/**
 * Complete Database Reset with Snake Case
 * 1. Installs typeorm-naming-strategies
 * 2. Drops all existing tables
 * 3. Runs migrations to recreate with snake_case
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 LexiFlow Database Reset - Snake Case Migration\n');

// Step 1: Install typeorm-naming-strategies
console.log('📦 Step 1: Installing typeorm-naming-strategies...');
try {
  execSync('npm install typeorm-naming-strategies', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Package installed\n');
} catch (error) {
  console.error('❌ Failed to install package');
  process.exit(1);
}

// Step 2: Drop all tables
console.log('🗑️  Step 2: Dropping all existing tables...');
try {
  execSync('node scripts/drop-all-tables.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Tables dropped\n');
} catch (error) {
  console.error('❌ Failed to drop tables');
  process.exit(1);
}

// Step 3: Initialize database with snake_case
console.log('🔄 Step 3: Creating tables with snake_case...');
try {
  execSync('npm run db:init-snake-case', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Tables created\n');
} catch (error) {
  console.error('❌ Failed to create tables');
  process.exit(1);
}

// Step 4: Seed data
console.log('🌱 Step 4: Seeding database...');
try {
  execSync('npm run seed', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('✅ Database seeded\n');
} catch (error) {
  console.warn('⚠️  Seeding failed (this is optional)');
}

console.log('✨ Database reset complete! All tables now use snake_case.\n');
console.log('⚠️  IMPORTANT: Keep synchronize: false in data-source.ts for production!\n');
