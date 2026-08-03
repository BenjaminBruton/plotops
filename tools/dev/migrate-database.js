#!/usr/bin/env node

/**
 * PlotOps Database Migration Script
 *
 * Runs database migrations to set up the PlotOps schema and tables.
 */

const { Client } = require('pg');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

class DatabaseMigrator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.migrationsDir = path.join(
      this.rootDir,
      'services/supabase/migrations'
    );
    this.initDir = path.join(this.rootDir, 'services/supabase/init');

    this.dbConfig = {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password:
        process.env.POSTGRES_PASSWORD ||
        'your-super-secret-and-long-postgres-password',
      database: 'postgres',
    };
  }

  async run() {
    console.log(chalk.blue.bold('\n🗄️  PlotOps Database Migration\n'));

    try {
      await this.checkConnection();
      await this.runInitScripts();
      await this.runMigrations();
      await this.setupRLS();

      console.log(
        chalk.green.bold('\n✅ Database migration completed successfully!\n')
      );
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Migration failed:'), error.message);
      process.exit(1);
    }
  }

  async checkConnection() {
    const spinner = ora('Checking database connection...').start();

    try {
      const client = new Client(this.dbConfig);
      await client.connect();
      await client.query('SELECT version()');
      await client.end();

      spinner.succeed('Database connection established');
    } catch (error) {
      spinner.fail('Database connection failed');
      throw new Error(`Cannot connect to database: ${error.message}`);
    }
  }

  async runInitScripts() {
    const spinner = ora('Running initialization scripts...').start();

    try {
      if (!fs.existsSync(this.initDir)) {
        spinner.warn('No initialization scripts found');
        return;
      }

      const client = new Client(this.dbConfig);
      await client.connect();

      const initFiles = fs
        .readdirSync(this.initDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of initFiles) {
        const filePath = path.join(this.initDir, file);
        const sql = await fs.readFile(filePath, 'utf8');

        spinner.text = `Running ${file}...`;
        await client.query(sql);
      }

      await client.end();
      spinner.succeed(
        `Initialization scripts completed (${initFiles.length} files)`
      );
    } catch (error) {
      spinner.fail('Initialization scripts failed');
      throw error;
    }
  }

  async runMigrations() {
    const spinner = ora('Running database migrations...').start();

    try {
      if (!fs.existsSync(this.migrationsDir)) {
        spinner.warn('No migration files found');
        return;
      }

      const client = new Client(this.dbConfig);
      await client.connect();

      // Create migrations tracking table
      await this.createMigrationsTable(client);

      // Get migration files
      const migrationFiles = fs
        .readdirSync(this.migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations(client);

      let appliedCount = 0;
      for (const file of migrationFiles) {
        if (appliedMigrations.includes(file)) {
          continue; // Skip already applied migrations
        }

        const filePath = path.join(this.migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');

        spinner.text = `Applying migration ${file}...`;

        try {
          await client.query('BEGIN');
          await client.query(sql);
          await this.recordMigration(client, file);
          await client.query('COMMIT');
          appliedCount++;
        } catch (error) {
          await client.query('ROLLBACK');
          throw new Error(`Migration ${file} failed: ${error.message}`);
        }
      }

      await client.end();

      if (appliedCount > 0) {
        spinner.succeed(
          `Database migrations completed (${appliedCount} new migrations applied)`
        );
      } else {
        spinner.succeed('Database is up to date (no new migrations to apply)');
      }
    } catch (error) {
      spinner.fail('Database migrations failed');
      throw error;
    }
  }

  async createMigrationsTable(client) {
    const sql = `
      CREATE TABLE IF NOT EXISTS plotops_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(sql);
  }

  async getAppliedMigrations(client) {
    try {
      const result = await client.query(
        'SELECT filename FROM plotops_migrations ORDER BY applied_at'
      );
      return result.rows.map((row) => row.filename);
    } catch (error) {
      // Table doesn't exist yet
      return [];
    }
  }

  async recordMigration(client, filename) {
    await client.query(
      'INSERT INTO plotops_migrations (filename) VALUES ($1)',
      [filename]
    );
  }

  async setupRLS() {
    const spinner = ora('Setting up Row Level Security...').start();

    try {
      const client = new Client(this.dbConfig);
      await client.connect();

      // Enable RLS on all plotops tables
      const rlsSQL = `
        -- Enable RLS on all plotops tables
        ALTER TABLE plotops.organizations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.project_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.scenes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.characters ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.scene_characters ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.props ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.scene_props ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.locations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.scene_locations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.casting_calls ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.actors ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.auditions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE plotops.character_casting ENABLE ROW LEVEL SECURITY;

        -- Create basic RLS policies
        -- Users can only access data from their organization
        CREATE POLICY "Users can access their organization's data" ON plotops.organizations
          FOR ALL USING (
            id IN (
              SELECT organization_id 
              FROM plotops.user_profiles 
              WHERE id = auth.uid()
            )
          );

        CREATE POLICY "Users can access their own profile" ON plotops.user_profiles
          FOR ALL USING (id = auth.uid());

        CREATE POLICY "Users can access their organization's projects" ON plotops.projects
          FOR ALL USING (
            organization_id IN (
              SELECT organization_id 
              FROM plotops.user_profiles 
              WHERE id = auth.uid()
            )
          );

        -- Project members can access project data
        CREATE POLICY "Project members can access project data" ON plotops.project_members
          FOR ALL USING (
            project_id IN (
              SELECT project_id 
              FROM plotops.project_members 
              WHERE user_id = auth.uid()
            )
          );

        -- Similar policies for other tables (simplified for brevity)
        CREATE POLICY "Project access for scenes" ON plotops.scenes
          FOR ALL USING (
            project_id IN (
              SELECT project_id 
              FROM plotops.project_members 
              WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Project access for characters" ON plotops.characters
          FOR ALL USING (
            project_id IN (
              SELECT project_id 
              FROM plotops.project_members 
              WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Project access for locations" ON plotops.locations
          FOR ALL USING (
            project_id IN (
              SELECT project_id 
              FROM plotops.project_members 
              WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Project access for casting calls" ON plotops.casting_calls
          FOR ALL USING (
            project_id IN (
              SELECT project_id 
              FROM plotops.project_members 
              WHERE user_id = auth.uid()
            )
          );

        -- Public access for casting calls (for public casting board)
        CREATE POLICY "Public can view open casting calls" ON plotops.casting_calls
          FOR SELECT USING (is_public = true AND status = 'open');

        -- Actors table - public read access for casting
        CREATE POLICY "Public read access for actors" ON plotops.actors
          FOR SELECT USING (true);

        -- Auditions - project members and actors can access
        CREATE POLICY "Project members and actors can access auditions" ON plotops.auditions
          FOR ALL USING (
            casting_call_id IN (
              SELECT id FROM plotops.casting_calls 
              WHERE project_id IN (
                SELECT project_id 
                FROM plotops.project_members 
                WHERE user_id = auth.uid()
              )
            )
            OR actor_id IN (
              SELECT id FROM plotops.actors 
              WHERE email = auth.email()
            )
          );
      `;

      await client.query(rlsSQL);
      await client.end();

      spinner.succeed('Row Level Security configured');
    } catch (error) {
      spinner.fail('RLS setup failed');
      // Don't throw here as RLS might already be set up
      console.warn(chalk.yellow(`RLS warning: ${error.message}`));
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.run().catch(console.error);
}

module.exports = DatabaseMigrator;
