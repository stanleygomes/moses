#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init.js';
import { runValidate } from '../src/commands/validate.js';

const program = new Command();

program
  .name('moses')
  .description('Automatic GitLab Merge Request validation with AI')
  .version('1.0.0');

program.command('init').description('Interactive initial setup').action(runInit);

program
  .command('validate')
  .description('Validate a GitLab Merge Request')
  .argument('<url>', 'GitLab Merge Request URL')
  .action(runValidate);

program.parseAsync(process.argv);
