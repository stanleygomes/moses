#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init/index.js';
import { execute } from '../src/commands/validate/index.js';
import { runSetDiffLimit, runSetFeedbackStyle } from '../src/commands/update-config/index.js';
import { runListGitlabs } from '../src/commands/gitlab/list.js';
import { runSwitchGitlab } from '../src/commands/gitlab/switch.js';
import type { ValidateOptions } from '../src/types/index.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('moses')
  .description(
    'CLI buddy to help you with code review of GitLab Merge Requests, by using AI tools.',
  )
  .version(packageJson.version);

program.command('init').description('Interactive initial setup').action(runInit);

program
  .command('validate')
  .description('Validate a GitLab Merge Request with an AI tool')
  .argument('<url>', 'GitLab Merge Request URL')
  .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
  .action((url: string, options: ValidateOptions) => execute(url, options));

const config = program.command('config').description('Manage Moses configuration');

config
  .command('feedback-style')
  .description('Update AI feedback style on Merge Requests')
  .action(runSetFeedbackStyle);

config
  .command('diff-limit')
  .description('Update maximum allowed diff changes limit')
  .action(runSetDiffLimit);

const gitlab = program.command('gitlab').description('Manage GitLab instances');

gitlab.command('list').description('List all configured GitLab instances').action(runListGitlabs);

gitlab.command('default').description('Change the default GitLab instance').action(runSwitchGitlab);

void program.parseAsync(process.argv);
