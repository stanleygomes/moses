#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init.js';
import { runValidate } from '../src/commands/validate.js';
import { runSetDiffLimit, runSetFeedbackStyle } from '../src/commands/update-config.js';
import type { ValidateOptions } from '../src/types.js';

const program = new Command();

program.name('moses').description('Automatic GitLab Merge Request validation with AI').version('1.0.0');

program.command('init').description('Interactive initial setup').action(runInit);

program
  .command('validate')
  .description('Validate a GitLab Merge Request')
  .argument('<url>', 'GitLab Merge Request URL')
  .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
  .action((url: string, options: ValidateOptions) => runValidate(url, options));

program.command('set-feedback-style').description('Update feedback style').action(runSetFeedbackStyle);

program.command('set-diff-limit').description('Update max diff changes limit').action(runSetDiffLimit);

void program.parseAsync(process.argv);
