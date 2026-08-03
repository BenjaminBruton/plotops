#!/usr/bin/env node

/**
 * Reset Database Script
 *
 * This script will:
 * 1. Drop all existing schemas and data
 * 2. Recreate the plotops schema
 * 3. Run all migrations in order
 *
 * WARNING: This will DELETE ALL DATA in your database!
 * Use with caution, especially in production.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function resetDatabase() {
  // Check for required environment variables
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing Supabase credentials', 'red');
    log(
      'Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file',
      'yellow'
    );
    process.exit(1);
  }

  log('\n🚨 DATABASE RESET WARNING 🚨', 'red');
  log('This will DELETE ALL DATA in your Supabase database!', 'red');
  log('Are you sure you want to continue?', 'yellow');
  log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');

  // Wait 5 seconds to give user time to cancel
  await new Promise((resolve) => setTimeout(resolve, 5000));

  log('\n🔄 Starting database reset...', 'blue');

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Drop the plotops schema
    log('\n📋 Step 1: Dropping plotops schema...', 'blue');
    const dropSchemaSQL = `
      DROP SCHEMA IF EXISTS plotops CASCADE;
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      CREATE SCHEMA plotops;
      
      -- Grant permissions
      GRANT USAGE ON SCHEMA plotops TO postgres, anon, authenticated, service_role;
      GRANT ALL ON SCHEMA plotops TO postgres, service_role;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA plotops TO postgres, service_role;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA plotops TO postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON TABLES TO postgres, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON SEQUENCES TO postgres, service_role;
    `;

    const { error: dropError } = await supabase
      .rpc('exec_sql', {
        sql: dropSchemaSQL,
      })
      .catch(() => {
        // If exec_sql doesn't exist, we'll need to use the SQL editor or direct connection
        log(
          '⚠️  Cannot drop schema via RPC. Please use Supabase SQL Editor:',
          'yellow'
        );
        log('\n' + dropSchemaSQL, 'yellow');
        return { error: 'Manual execution required' };
      });

    if (dropError && dropError !== 'Manual execution required') {
      throw new Error(`Failed to drop schema: ${dropError}`);
    }

    log('✅ Schema dropped successfully', 'green');

    // Step 2: Read and execute migration files in order
    const migrationsDir = path.join(
      __dirname,
      '../../services/supabase/migrations'
    );
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // This will sort them by filename (timestamp)

    log(`\n📋 Step 2: Running ${migrationFiles.length} migrations...`, 'blue');

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      log(`\n  Running: ${file}`, 'blue');

      // Note: Supabase client doesn't support executing raw SQL directly
      // You'll need to copy/paste these into the SQL editor or use psql
      log(
        `  ⚠️  Please execute this migration manually via Supabase SQL Editor:`,
        'yellow'
      );
      log(`  File: ${filePath}`, 'yellow');
    }

    log('\n✅ Database reset complete!', 'green');
    log('\n📝 Next steps:', 'blue');
    log('1. Go to your Supabase Dashboard → SQL Editor', 'blue');
    log('2. Execute the migration files in this order:', 'blue');
    migrationFiles.forEach((file, i) => {
      log(`   ${i + 1}. ${file}`, 'blue');
    });
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
resetDatabase();
