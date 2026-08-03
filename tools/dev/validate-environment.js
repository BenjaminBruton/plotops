#!/usr/bin/env node

/**
 * PlotOps Environment Validation Script
 *
 * Validates that all required services and configurations are properly set up
 * for the PlotOps development environment.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

class EnvironmentValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.envFile = path.join(this.rootDir, '.env');
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: [],
    };
  }

  async run() {
    console.log(chalk.blue.bold('\n🔍 PlotOps Environment Validation\n'));

    try {
      await this.validateEnvironmentFile();
      await this.validateDockerServices();
      await this.validateDatabaseConnection();
      await this.validateSupabaseServices();
      await this.validateN8nService();
      await this.validateRedisConnection();
      await this.validateExternalAPIs();

      this.printResults();

      if (this.results.failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Validation failed:'), error.message);
      process.exit(1);
    }
  }

  async validateEnvironmentFile() {
    const spinner = ora('Validating environment file...').start();

    try {
      if (!fs.existsSync(this.envFile)) {
        this.addResult('fail', 'Environment file (.env) not found');
        spinner.fail('Environment file validation failed');
        return;
      }

      const envContent = await fs.readFile(this.envFile, 'utf8');
      const requiredVars = [
        'POSTGRES_PASSWORD',
        'JWT_SECRET',
        'ANON_KEY',
        'SERVICE_ROLE_KEY',
        'N8N_ENCRYPTION_KEY',
        'REDIS_PASSWORD',
      ];

      for (const varName of requiredVars) {
        const regex = new RegExp(`^${varName}=(.+)$`, 'm');
        const match = envContent.match(regex);

        if (
          !match ||
          !match[1] ||
          match[1].includes('your-') ||
          match[1].includes('change-me')
        ) {
          this.addResult('fail', `${varName} not properly configured`);
        } else {
          this.addResult('pass', `${varName} configured`);
        }
      }

      spinner.succeed('Environment file validation completed');
    } catch (error) {
      this.addResult('fail', `Environment file error: ${error.message}`);
      spinner.fail('Environment file validation failed');
    }
  }

  async validateDockerServices() {
    const spinner = ora('Validating Docker services...').start();

    try {
      const { execSync } = require('child_process');

      // Check if Docker is running
      execSync('docker info', { stdio: 'pipe' });
      this.addResult('pass', 'Docker daemon is running');

      // Check if docker-compose file exists
      const composeFile = path.join(this.rootDir, 'docker-compose.yml');
      if (fs.existsSync(composeFile)) {
        this.addResult('pass', 'docker-compose.yml found');
      } else {
        this.addResult('fail', 'docker-compose.yml not found');
      }

      // Check running containers
      const output = execSync('docker-compose ps --format json', {
        cwd: this.rootDir,
        stdio: 'pipe',
      }).toString();

      const containers = output
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));

      const expectedServices = [
        'plotops-supabase-db',
        'plotops-supabase-kong',
        'plotops-supabase-auth',
        'plotops-supabase-rest',
        'plotops-n8n',
        'plotops-redis',
      ];

      for (const serviceName of expectedServices) {
        const container = containers.find((c) => c.Name === serviceName);
        if (container && container.State === 'running') {
          this.addResult('pass', `${serviceName} is running`);
        } else {
          this.addResult('fail', `${serviceName} is not running`);
        }
      }

      spinner.succeed('Docker services validation completed');
    } catch (error) {
      this.addResult('fail', `Docker validation error: ${error.message}`);
      spinner.fail('Docker services validation failed');
    }
  }

  async validateDatabaseConnection() {
    const spinner = ora('Validating database connection...').start();

    try {
      const { Client } = require('pg');
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password:
          process.env.POSTGRES_PASSWORD ||
          'your-super-secret-and-long-postgres-password',
        database: 'postgres',
      });

      await client.connect();

      // Test basic query
      const result = await client.query('SELECT version()');
      this.addResult('pass', 'PostgreSQL connection successful');

      // Check if PlotOps schema exists
      const schemaResult = await client.query(
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'plotops'"
      );

      if (schemaResult.rows.length > 0) {
        this.addResult('pass', 'PlotOps schema exists');
      } else {
        this.addResult(
          'warning',
          'PlotOps schema not found - run database migrations'
        );
      }

      await client.end();
      spinner.succeed('Database validation completed');
    } catch (error) {
      this.addResult('fail', `Database connection error: ${error.message}`);
      spinner.fail('Database validation failed');
    }
  }

  async validateSupabaseServices() {
    const spinner = ora('Validating Supabase services...').start();

    try {
      const endpoints = [
        { name: 'Kong Gateway', url: 'http://localhost:8000' },
        { name: 'Auth Service', url: 'http://localhost:8000/auth/v1/settings' },
        { name: 'REST API', url: 'http://localhost:8000/rest/v1/' },
        {
          name: 'Storage API',
          url: 'http://localhost:8000/storage/v1/buckets',
        },
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              apikey:
                process.env.ANON_KEY ||
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
            },
          });

          if (response.ok || response.status === 401) {
            // 401 is expected for some endpoints
            this.addResult('pass', `${endpoint.name} is accessible`);
          } else {
            this.addResult(
              'fail',
              `${endpoint.name} returned ${response.status}`
            );
          }
        } catch (error) {
          this.addResult(
            'fail',
            `${endpoint.name} connection failed: ${error.message}`
          );
        }
      }

      spinner.succeed('Supabase services validation completed');
    } catch (error) {
      this.addResult('fail', `Supabase validation error: ${error.message}`);
      spinner.fail('Supabase services validation failed');
    }
  }

  async validateN8nService() {
    const spinner = ora('Validating n8n service...').start();

    try {
      const response = await fetch('http://localhost:5678/healthz');

      if (response.ok) {
        this.addResult('pass', 'n8n service is accessible');

        // Check if n8n is properly configured
        const loginResponse = await fetch('http://localhost:5678/rest/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: process.env.N8N_BASIC_AUTH_USER || 'admin',
            password: process.env.N8N_BASIC_AUTH_PASSWORD || 'plotops123',
          }),
        });

        if (loginResponse.ok || loginResponse.status === 401) {
          this.addResult('pass', 'n8n authentication configured');
        } else {
          this.addResult(
            'warning',
            'n8n authentication may need configuration'
          );
        }
      } else {
        this.addResult('fail', `n8n service returned ${response.status}`);
      }

      spinner.succeed('n8n service validation completed');
    } catch (error) {
      this.addResult('fail', `n8n validation error: ${error.message}`);
      spinner.fail('n8n service validation failed');
    }
  }

  async validateRedisConnection() {
    const spinner = ora('Validating Redis connection...').start();

    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: `redis://:${process.env.REDIS_PASSWORD || 'plotops-redis-password'}@localhost:6379`,
      });

      await client.connect();
      const pong = await client.ping();

      if (pong === 'PONG') {
        this.addResult('pass', 'Redis connection successful');
      } else {
        this.addResult('fail', 'Redis ping failed');
      }

      await client.disconnect();
      spinner.succeed('Redis validation completed');
    } catch (error) {
      this.addResult('fail', `Redis connection error: ${error.message}`);
      spinner.fail('Redis validation failed');
    }
  }

  async validateExternalAPIs() {
    const spinner = ora('Validating external API configurations...').start();

    try {
      const apiKeys = [
        { name: 'Google Maps API', key: process.env.GOOGLE_MAPS_API_KEY },
        { name: 'OpenWeather API', key: process.env.OPENWEATHER_API_KEY },
        { name: 'Twilio Account SID', key: process.env.TWILIO_ACCOUNT_SID },
        { name: 'SendGrid API', key: process.env.SENDGRID_API_KEY },
      ];

      for (const api of apiKeys) {
        if (
          api.key &&
          !api.key.includes('your-') &&
          !api.key.includes('change-me')
        ) {
          this.addResult('pass', `${api.name} key configured`);
        } else {
          this.addResult(
            'warning',
            `${api.name} key not configured (optional for development)`
          );
        }
      }

      spinner.succeed('External API validation completed');
    } catch (error) {
      this.addResult('fail', `External API validation error: ${error.message}`);
      spinner.fail('External API validation failed');
    }
  }

  addResult(type, message) {
    this.results.details.push({ type, message });
    this.results[
      type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings'
    ]++;
  }

  printResults() {
    console.log(chalk.blue.bold('\n📊 Validation Results:\n'));

    // Group results by type
    const passed = this.results.details.filter((r) => r.type === 'pass');
    const failed = this.results.details.filter((r) => r.type === 'fail');
    const warnings = this.results.details.filter((r) => r.type === 'warning');

    if (passed.length > 0) {
      console.log(chalk.green.bold('✅ Passed:'));
      passed.forEach((result) => {
        console.log(chalk.green(`  • ${result.message}`));
      });
      console.log();
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow.bold('⚠️  Warnings:'));
      warnings.forEach((result) => {
        console.log(chalk.yellow(`  • ${result.message}`));
      });
      console.log();
    }

    if (failed.length > 0) {
      console.log(chalk.red.bold('❌ Failed:'));
      failed.forEach((result) => {
        console.log(chalk.red(`  • ${result.message}`));
      });
      console.log();
    }

    // Summary
    console.log(chalk.blue.bold('Summary:'));
    console.log(chalk.green(`  Passed: ${this.results.passed}`));
    console.log(chalk.yellow(`  Warnings: ${this.results.warnings}`));
    console.log(chalk.red(`  Failed: ${this.results.failed}`));
    console.log();

    if (this.results.failed === 0) {
      console.log(chalk.green.bold('🎉 Environment validation successful!'));
    } else {
      console.log(chalk.red.bold('💥 Environment validation failed!'));
      console.log(
        chalk.white('Please fix the failed checks and run validation again.')
      );
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new EnvironmentValidator();
  validator.run().catch(console.error);
}

module.exports = EnvironmentValidator;
