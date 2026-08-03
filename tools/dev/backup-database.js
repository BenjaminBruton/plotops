#!/usr/bin/env node

/**
 * PlotOps Database Backup Script
 *
 * Creates backups of the PlotOps database for development and testing.
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

class DatabaseBackup {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.backupDir = path.join(this.rootDir, 'backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');

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

  async run(options = {}) {
    console.log(chalk.blue.bold('\n💾 PlotOps Database Backup\n'));

    try {
      await this.ensureBackupDirectory();

      if (options.restore) {
        await this.restoreDatabase(options.restore);
      } else {
        await this.createBackup(options);
      }

      console.log(
        chalk.green.bold('\n✅ Database backup operation completed!\n')
      );
    } catch (error) {
      console.error(
        chalk.red.bold('\n❌ Backup operation failed:'),
        error.message
      );
      process.exit(1);
    }
  }

  async ensureBackupDirectory() {
    await fs.ensureDir(this.backupDir);
  }

  async createBackup(options = {}) {
    const backupName = options.name || `plotops-backup-${this.timestamp}`;
    const backupFile = path.join(this.backupDir, `${backupName}.sql`);

    const spinner = ora('Creating database backup...').start();

    try {
      // Set PGPASSWORD environment variable
      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password,
      };

      // Create full database dump
      const dumpCommand = [
        'pg_dump',
        `-h ${this.dbConfig.host}`,
        `-p ${this.dbConfig.port}`,
        `-U ${this.dbConfig.user}`,
        `-d ${this.dbConfig.database}`,
        '--verbose',
        '--clean',
        '--if-exists',
        '--create',
        '--format=plain',
        `--file="${backupFile}"`,
      ].join(' ');

      execSync(dumpCommand, { env, stdio: 'pipe' });

      // Create metadata file
      const metadataFile = path.join(this.backupDir, `${backupName}.json`);
      const metadata = {
        name: backupName,
        timestamp: new Date().toISOString(),
        database: this.dbConfig.database,
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        size: (await fs.stat(backupFile)).size,
        description: options.description || 'Development database backup',
      };

      await fs.writeJson(metadataFile, metadata, { spaces: 2 });

      spinner.succeed(`Database backup created: ${backupName}`);

      console.log(chalk.white('\nBackup Details:'));
      console.log(chalk.gray(`  File: ${backupFile}`));
      console.log(chalk.gray(`  Size: ${this.formatBytes(metadata.size)}`));
      console.log(chalk.gray(`  Timestamp: ${metadata.timestamp}`));

      // List recent backups
      await this.listRecentBackups();
    } catch (error) {
      spinner.fail('Database backup failed');
      throw error;
    }
  }

  async restoreDatabase(backupName) {
    const backupFile = path.join(this.backupDir, `${backupName}.sql`);
    const metadataFile = path.join(this.backupDir, `${backupName}.json`);

    if (!(await fs.pathExists(backupFile))) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const spinner = ora(`Restoring database from ${backupName}...`).start();

    try {
      // Read metadata if available
      let metadata = {};
      if (await fs.pathExists(metadataFile)) {
        metadata = await fs.readJson(metadataFile);
      }

      // Set PGPASSWORD environment variable
      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password,
      };

      // Restore database
      const restoreCommand = [
        'psql',
        `-h ${this.dbConfig.host}`,
        `-p ${this.dbConfig.port}`,
        `-U ${this.dbConfig.user}`,
        `-d ${this.dbConfig.database}`,
        `--file="${backupFile}"`,
      ].join(' ');

      execSync(restoreCommand, { env, stdio: 'pipe' });

      spinner.succeed(`Database restored from ${backupName}`);

      console.log(chalk.white('\nRestore Details:'));
      console.log(chalk.gray(`  Backup: ${backupName}`));
      console.log(
        chalk.gray(`  Original timestamp: ${metadata.timestamp || 'Unknown'}`)
      );
      console.log(
        chalk.gray(`  Description: ${metadata.description || 'No description'}`)
      );
    } catch (error) {
      spinner.fail('Database restore failed');
      throw error;
    }
  }

  async listRecentBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const metadataFile = path.join(this.backupDir, file);
          const metadata = await fs.readJson(metadataFile);
          backups.push(metadata);
        }
      }

      // Sort by timestamp, newest first
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (backups.length > 0) {
        console.log(chalk.white('\nRecent Backups:'));
        backups.slice(0, 5).forEach((backup) => {
          const age = this.getTimeAgo(new Date(backup.timestamp));
          console.log(chalk.gray(`  • ${backup.name} (${age})`));
        });

        if (backups.length > 5) {
          console.log(chalk.gray(`  ... and ${backups.length - 5} more`));
        }
      }
    } catch (error) {
      // Ignore errors when listing backups
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--restore' && args[i + 1]) {
      options.restore = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--name' && args[i + 1]) {
      options.name = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--description' && args[i + 1]) {
      options.description = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
PlotOps Database Backup Tool

Usage:
  node backup-database.js [options]

Options:
  --name <name>           Custom backup name
  --description <desc>    Backup description
  --restore <backup>      Restore from backup
  --help, -h             Show this help

Examples:
  # Create a backup
  node backup-database.js

  # Create a backup with custom name
  node backup-database.js --name "before-migration" --description "Backup before schema changes"

  # Restore from backup
  node backup-database.js --restore "plotops-backup-2024-03-27T10-00-00-000Z"
      `);
      process.exit(0);
    }
  }

  const backup = new DatabaseBackup();
  backup.run(options).catch(console.error);
}

module.exports = DatabaseBackup;
