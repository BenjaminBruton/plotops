#!/usr/bin/env node

/**
 * PlotOps Development Environment Setup
 *
 * This script sets up the complete development environment for PlotOps,
 * including Docker services, database initialization, and environment validation.
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

class EnvironmentSetup {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.envFile = path.join(this.rootDir, '.env');
    this.envTemplate = path.join(this.rootDir, '.env.template');
  }

  async run() {
    console.log(
      chalk.blue.bold('\n🎬 PlotOps Development Environment Setup\n')
    );

    try {
      await this.checkPrerequisites();
      await this.setupEnvironmentFile();
      await this.startDockerServices();
      await this.waitForServices();
      await this.initializeDatabase();
      await this.validateSetup();

      console.log(
        chalk.green.bold('\n✅ Development environment setup complete!\n')
      );
      this.printNextSteps();
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    const spinner = ora('Checking prerequisites...').start();

    try {
      // Check Docker
      execSync('docker --version', { stdio: 'pipe' });
      execSync('docker-compose --version', { stdio: 'pipe' });

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion < 18) {
        throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
      }

      // Check pnpm
      execSync('pnpm --version', { stdio: 'pipe' });

      spinner.succeed('Prerequisites check passed');
    } catch (error) {
      spinner.fail('Prerequisites check failed');
      throw new Error(`Missing prerequisite: ${error.message}`);
    }
  }

  async setupEnvironmentFile() {
    if (!fs.existsSync(this.envFile)) {
      const spinner = ora('Setting up environment file...').start();

      try {
        await fs.copy(this.envTemplate, this.envFile);

        // Generate secure keys
        const jwtSecret = this.generateSecureKey(64);
        const n8nEncryptionKey = this.generateSecureKey(32);

        let envContent = await fs.readFile(this.envFile, 'utf8');
        envContent = envContent.replace(
          'JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long',
          `JWT_SECRET=${jwtSecret}`
        );
        envContent = envContent.replace(
          'N8N_ENCRYPTION_KEY=your-super-secret-n8n-encryption-key-32-chars',
          `N8N_ENCRYPTION_KEY=${n8nEncryptionKey}`
        );

        await fs.writeFile(this.envFile, envContent);
        spinner.succeed('Environment file created with secure keys');
      } catch (error) {
        spinner.fail('Failed to setup environment file');
        throw error;
      }
    } else {
      console.log(
        chalk.yellow('⚠️  .env file already exists, skipping creation')
      );
    }
  }

  async startDockerServices() {
    const spinner = ora('Starting Docker services...').start();

    try {
      // Pull latest images
      execSync('docker-compose pull', {
        cwd: this.rootDir,
        stdio: 'pipe',
      });

      // Start services
      execSync('docker-compose up -d', {
        cwd: this.rootDir,
        stdio: 'pipe',
      });

      spinner.succeed('Docker services started');
    } catch (error) {
      spinner.fail('Failed to start Docker services');
      throw error;
    }
  }

  async waitForServices() {
    const spinner = ora('Waiting for services to be ready...').start();

    const services = [
      {
        name: 'Supabase Database',
        url: 'http://localhost:5432',
        timeout: 60000,
      },
      {
        name: 'Supabase API',
        url: 'http://localhost:8000/health',
        timeout: 90000,
      },
      { name: 'n8n', url: 'http://localhost:5678/healthz', timeout: 60000 },
      { name: 'Redis', url: 'redis://localhost:6379', timeout: 30000 },
    ];

    try {
      for (const service of services) {
        await this.waitForService(service.name, service.url, service.timeout);
      }
      spinner.succeed('All services are ready');
    } catch (error) {
      spinner.fail('Service readiness check failed');
      throw error;
    }
  }

  async waitForService(name, url, timeout) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (url.startsWith('redis://')) {
          // Check Redis connection
          const redis = require('redis');
          const client = redis.createClient({ url });
          await client.connect();
          await client.ping();
          await client.disconnect();
        } else if (url.includes(':5432')) {
          // Check PostgreSQL connection
          const { Client } = require('pg');
          const client = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'your-super-secret-and-long-postgres-password',
            database: 'postgres',
          });
          await client.connect();
          await client.end();
        } else {
          // Check HTTP endpoint
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        return; // Service is ready
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error(`${name} failed to start within ${timeout}ms`);
  }

  async initializeDatabase() {
    const spinner = ora('Initializing database...').start();

    try {
      // Run database migrations
      execSync('node tools/dev/migrate-database.js', {
        cwd: this.rootDir,
        stdio: 'pipe',
      });

      // Seed with sample data
      const { seedSampleData } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'seedSampleData',
          message: 'Would you like to seed the database with sample data?',
          default: true,
        },
      ]);

      if (seedSampleData) {
        execSync('node tools/dev/seed-database.js', {
          cwd: this.rootDir,
          stdio: 'pipe',
        });
      }

      spinner.succeed('Database initialized');
    } catch (error) {
      spinner.fail('Database initialization failed');
      throw error;
    }
  }

  async validateSetup() {
    const spinner = ora('Validating setup...').start();

    try {
      execSync('node tools/dev/validate-environment.js', {
        cwd: this.rootDir,
        stdio: 'pipe',
      });
      spinner.succeed('Environment validation passed');
    } catch (error) {
      spinner.fail('Environment validation failed');
      throw error;
    }
  }

  generateSecureKey(length) {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  printNextSteps() {
    console.log(chalk.blue.bold('🚀 Next Steps:\n'));
    console.log(chalk.white('1. Start the web application:'));
    console.log(chalk.gray('   pnpm web:dev\n'));
    console.log(chalk.white('2. Start the mobile application:'));
    console.log(chalk.gray('   pnpm mobile:dev\n'));
    console.log(chalk.white('3. Access development tools:'));
    console.log(chalk.gray('   • Supabase Studio: http://localhost:3001'));
    console.log(chalk.gray('   • n8n Workflows: http://localhost:5678'));
    console.log(chalk.gray('   • PgAdmin: http://localhost:8080'));
    console.log(chalk.gray('   • Redis Commander: http://localhost:8081\n'));
    console.log(chalk.white('4. Check service status:'));
    console.log(chalk.gray('   pnpm dev:status\n'));
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.run().catch(console.error);
}

module.exports = EnvironmentSetup;
