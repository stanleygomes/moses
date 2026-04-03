#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init.js';
import { runSetFeedbackStyle, runSetMaxChanges } from '../src/commands/config.js';
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
  .option('-p, --prompt <text>', 'Additional context prompt to include with diff')
  .action(runValidate);

program
  .command('set-feedback-style')
  .description('Update review feedback style (friendly, pragmatic, offensive)')
  .argument('[style]', 'friendly | pragmatic | offensive')
  .action(runSetFeedbackStyle);

program
  .command('set-max-changes')
  .description('Update max allowed MR changes_count before interrupting validation')
  .argument('<limit>', 'Positive integer')
  .action(runSetMaxChanges);

program.parseAsync(process.argv);
