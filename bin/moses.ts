#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init/index.js';
import { execute } from '../src/commands/validate/index.js';
import { runSetDiffLimit, runSetFeedbackStyle } from '../src/commands/update-config/index.js';
import type { ValidateOptions } from '../src/types/index.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('moses')
  .description('Automatic GitLab Merge Request validation with AI')
  .version(packageJson.version);

program.command('init').description('Interactive initial setup').action(runInit);

program
  .command('validate')
  .description('Validate a GitLab Merge Request')
  .argument('<url>', 'GitLab Merge Request URL')
  .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
  .action((url: string, options: ValidateOptions) => execute(url, options));

program
  .command('set-feedback-style')
  .description('Update feedback style')
  .action(runSetFeedbackStyle);

program
  .command('set-diff-limit')
  .description('Update max diff changes limit')
  .action(runSetDiffLimit);

void program.parseAsync(process.argv);
