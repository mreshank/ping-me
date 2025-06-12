#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

const packageJson = require('../package.json');

// Create a new command instance
const program = new Command();

// Set up CLI metadata
program
  .name('ping-me')
  .description('CLI tool for keeping your backend services alive')
  .version(packageJson.version);

// Init command - generates a config file
program
  .command('init')
  .description('Initialize ping-me in your project')
  .option('-f, --force', 'Overwrite existing config')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), 'ping-me.config.js');
    
    if (fs.existsSync(configPath) && !options.force) {
      console.log(chalk.yellow('⚠️  ping-me.config.js already exists!'));
      
      const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite it?',
        default: false
      }]);
      
      if (!overwrite) {
        console.log(chalk.blue('ℹ️  No changes made.'));
        return;
      }
    }
    
    const configContent = `/**
 * @type {import('@ping-me/core').PingMeOptions}
 */
module.exports = {
  interval: 300000, // 5 minutes
  route: '/ping-me',
  // apiKey: 'YOUR_API_KEY', // Optional: add your API key to save metrics
  // apiEndpoint: 'https://ping-me-api.vercel.app/api/log', // Optional: custom API endpoint
};
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log(chalk.green('✅ Created ping-me.config.js'));
  });

// Add command - adds a framework adapter
program
  .command('add <framework>')
  .description('Add a ping-me adapter for your framework')
  .action(async (framework) => {
    const validFrameworks = ['express', 'next', 'fastify', 'koa', 'hono'];
    
    if (!validFrameworks.includes(framework)) {
      console.log(chalk.red(`❌ Invalid framework: ${framework}`));
      console.log(chalk.blue(`ℹ️  Available frameworks: ${validFrameworks.join(', ')}`));
      return;
    }
    
    const spinner = ora(`Installing @ping-me/${framework}...`).start();
    
    try {
      // Detect package manager
      const hasYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
      const hasPnpm = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
      
      const packageManager = hasPnpm ? 'pnpm' : (hasYarn ? 'yarn' : 'npm');
      const installCmd = packageManager === 'npm' ? 'install' : 'add';
      
      await execPromise(`${packageManager} ${installCmd} @ping-me/${framework}`);
      
      spinner.succeed(chalk.green(`✅ Installed @ping-me/${framework}`));
      
      // Show example usage
      console.log(chalk.blue('\nExample usage:'));
      
      if (framework === 'express') {
        console.log(`
${chalk.gray('// In your Express app')}
const express = require('express');
const { withPingMe } = require('@ping-me/${framework}');

const app = express();

// Add ping-me to your app
withPingMe(app, {
  route: '/ping-me',
  interval: 300000 // 5 minutes
});

app.listen(3000);
`);
      } else if (framework === 'next') {
        console.log(`
${chalk.gray('// In your Next.js app (pages/api/ping-me.js)')}
import { createPingMeHandler } from '@ping-me/${framework}';

export default createPingMeHandler();

${chalk.gray('// In your _app.js or a component')}
import { usePingMe } from '@ping-me/${framework}';

// This will auto-ping your endpoint
usePingMe();
`);
      } else {
        console.log(`
${chalk.gray(`// Check the docs for ${framework} usage examples`)}
`);
      }
      
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to install @ping-me/${framework}`));
      console.error(error);
    }
  });

// Start command - starts pinging a URL
program
  .command('start <url>')
  .description('Start pinging a URL at regular intervals')
  .option('-i, --interval <ms>', 'Ping interval in milliseconds', '300000')
  .action((url, options) => {
    console.log(chalk.green(`🚀 Starting to ping ${url} every ${options.interval}ms...`));
    console.log(chalk.blue('ℹ️  Press Ctrl+C to stop'));
    
    // Simple ping implementation for the CLI
    setInterval(async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(url);
        const endTime = Date.now();
        const status = response.status;
        const responseTime = endTime - startTime;
        
        console.log(chalk.green(`✅ [${new Date().toISOString()}] ${url}: ${status} (${responseTime}ms)`));
      } catch (error) {
        console.log(chalk.red(`❌ [${new Date().toISOString()}] ${url}: Failed to ping`));
      }
    }, parseInt(options.interval));
  });

// Help command with more info
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(`
${chalk.bold('PING-ME CLI')}
Keep your free tier backends alive with auto-pinging and monitoring

${chalk.bold('USAGE')}
  npx ping-me init
  npx ping-me add express
  npx ping-me start https://my-api.example.com

${chalk.bold('LEARN MORE')}
  Docs: https://github.com/mreshank/ping-me
  Dashboard: https://ping-me-dashboard.vercel.app
    `);
  });

// Helper function to promisify exec
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Parse the command line arguments
program.parse(process.argv);

// If no arguments are provided, show help
if (process.argv.length <= 2) {
  program.help();
}