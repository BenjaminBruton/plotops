#!/usr/bin/env node

/**
 * PlotOps Service Status Checker
 *
 * Checks the status of all development services and provides a comprehensive overview.
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

class ServiceChecker {
  constructor() {
    this.services = [
      {
        name: 'Docker Daemon',
        check: () => this.checkDocker(),
        url: null,
        description: 'Container runtime',
      },
      {
        name: 'Supabase Database',
        check: () => this.checkPostgres(),
        url: 'postgresql://localhost:5432',
        description: 'PostgreSQL database',
      },
      {
        name: 'Supabase API Gateway',
        check: () => this.checkHttp('http://localhost:8000'),
        url: 'http://localhost:8000',
        description: 'Kong API gateway',
      },
      {
        name: 'Supabase Studio',
        check: () => this.checkHttp('http://localhost:3001'),
        url: 'http://localhost:3001',
        description: 'Database management UI',
      },
      {
        name: 'n8n Workflows',
        check: () => this.checkHttp('http://localhost:5678/healthz'),
        url: 'http://localhost:5678',
        description: 'Workflow automation',
      },
      {
        name: 'Redis Cache',
        check: () => this.checkRedis(),
        url: 'redis://localhost:6379',
        description: 'In-memory cache',
      },
      {
        name: 'PgAdmin',
        check: () => this.checkHttp('http://localhost:8080'),
        url: 'http://localhost:8080',
        description: 'Database administration',
      },
      {
        name: 'Redis Commander',
        check: () => this.checkHttp('http://localhost:8081'),
        url: 'http://localhost:8081',
        description: 'Redis management UI',
      },
      {
        name: 'MailHog',
        check: () => this.checkHttp('http://localhost:8025'),
        url: 'http://localhost:8025',
        description: 'Email testing',
      },
      {
        name: 'MinIO Storage',
        check: () => this.checkHttp('http://localhost:9001'),
        url: 'http://localhost:9001',
        description: 'S3-compatible storage',
      },
    ];
  }

  async run() {
    console.log(chalk.blue.bold('\n🔍 PlotOps Service Status Check\n'));

    const results = [];

    for (const service of this.services) {
      const spinner = ora(`Checking ${service.name}...`).start();

      try {
        const status = await service.check();
        results.push({
          ...service,
          status: 'healthy',
          details: status,
        });
        spinner.succeed(`${service.name} - ${chalk.green('Healthy')}`);
      } catch (error) {
        results.push({
          ...service,
          status: 'unhealthy',
          error: error.message,
        });
        spinner.fail(`${service.name} - ${chalk.red('Unhealthy')}`);
      }
    }

    this.printSummary(results);
    this.printRecommendations(results);

    const unhealthyCount = results.filter(
      (r) => r.status === 'unhealthy'
    ).length;
    if (unhealthyCount > 0) {
      process.exit(1);
    }
  }

  async checkDocker() {
    try {
      execSync('docker info', { stdio: 'pipe' });
      const containers = execSync('docker-compose ps --format json', {
        stdio: 'pipe',
      }).toString();
      const runningContainers = containers
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line))
        .filter((container) => container.State === 'running');

      return `${runningContainers.length} containers running`;
    } catch (error) {
      throw new Error('Docker daemon not running or docker-compose not found');
    }
  }

  async checkPostgres() {
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
        connectionTimeoutMillis: 5000,
      });

      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();

      return 'Connected successfully';
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async checkRedis() {
    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: `redis://:${process.env.REDIS_PASSWORD || 'plotops-redis-password'}@localhost:6379`,
        socket: {
          connectTimeout: 5000,
        },
      });

      await client.connect();
      const pong = await client.ping();
      await client.disconnect();

      if (pong === 'PONG') {
        return 'Ping successful';
      } else {
        throw new Error('Ping failed');
      }
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async checkHttp(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PlotOps-HealthCheck/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 401 || response.status === 403) {
        return `HTTP ${response.status}`;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  printSummary(results) {
    console.log(chalk.blue.bold('\n📊 Service Summary:\n'));

    const healthy = results.filter((r) => r.status === 'healthy');
    const unhealthy = results.filter((r) => r.status === 'unhealthy');

    console.log(chalk.green(`✅ Healthy: ${healthy.length}`));
    console.log(chalk.red(`❌ Unhealthy: ${unhealthy.length}`));
    console.log(chalk.gray(`📋 Total: ${results.length}`));

    if (healthy.length > 0) {
      console.log(chalk.green.bold('\n🟢 Healthy Services:'));
      healthy.forEach((service) => {
        console.log(chalk.green(`  ✓ ${service.name}`));
        if (service.url) {
          console.log(chalk.gray(`    ${service.url}`));
        }
        console.log(chalk.gray(`    ${service.description}`));
        if (service.details) {
          console.log(chalk.gray(`    ${service.details}`));
        }
        console.log();
      });
    }

    if (unhealthy.length > 0) {
      console.log(chalk.red.bold('\n🔴 Unhealthy Services:'));
      unhealthy.forEach((service) => {
        console.log(chalk.red(`  ✗ ${service.name}`));
        if (service.url) {
          console.log(chalk.gray(`    ${service.url}`));
        }
        console.log(chalk.gray(`    ${service.description}`));
        console.log(chalk.red(`    Error: ${service.error}`));
        console.log();
      });
    }
  }

  printRecommendations(results) {
    const unhealthy = results.filter((r) => r.status === 'unhealthy');

    if (unhealthy.length === 0) {
      console.log(chalk.green.bold('🎉 All services are healthy!\n'));
      console.log(chalk.white('You can now:'));
      console.log(chalk.gray('  • Start the web app: pnpm web:dev'));
      console.log(chalk.gray('  • Start the mobile app: pnpm mobile:dev'));
      console.log(
        chalk.gray('  • Access Supabase Studio: http://localhost:3001')
      );
      console.log(chalk.gray('  • Access n8n: http://localhost:5678'));
      return;
    }

    console.log(chalk.yellow.bold('🔧 Recommendations:\n'));

    // Docker issues
    if (unhealthy.some((s) => s.name === 'Docker Daemon')) {
      console.log(chalk.yellow('• Start Docker Desktop or Docker daemon'));
      console.log(chalk.gray('  macOS: Open Docker Desktop application'));
      console.log(chalk.gray('  Linux: sudo systemctl start docker\n'));
    }

    // Database issues
    if (unhealthy.some((s) => s.name === 'Supabase Database')) {
      console.log(chalk.yellow('• Start database services:'));
      console.log(chalk.gray('  pnpm services:start\n'));
    }

    // General service issues
    if (
      unhealthy.some(
        (s) =>
          s.name.includes('Supabase') ||
          s.name.includes('n8n') ||
          s.name.includes('Redis')
      )
    ) {
      console.log(chalk.yellow('• Restart all services:'));
      console.log(chalk.gray('  pnpm docker:down && pnpm docker:up\n'));
    }

    // Environment issues
    console.log(chalk.yellow('• Check environment configuration:'));
    console.log(chalk.gray('  pnpm dev:validate\n'));

    // Reset option
    console.log(chalk.yellow('• If problems persist, reset environment:'));
    console.log(chalk.gray('  pnpm dev:reset\n'));
  }
}

// Run status check if called directly
if (require.main === module) {
  const checker = new ServiceChecker();
  checker.run().catch(console.error);
}

module.exports = ServiceChecker;
