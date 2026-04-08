#!/usr/bin/env node

import { Command } from 'commander';
import { InitCommand } from '../src/commands/init/index.js';
import { ValidateCommand } from '../src/commands/validate/index.js';
import {
  SetDiffLimitCommand,
  SetFeedbackStyleCommand,
} from '../src/commands/update-config/index.js';
import { ListGitlabsCommand } from '../src/commands/gitlab/list.js';
import { SwitchGitlabCommand } from '../src/commands/gitlab/switch.js';
import type { ValidateOptions } from '../src/types/index.js';
import packageJson from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('moses')
  .description(
    'CLI buddy to help you with code review of GitLab Merge Requests, by using AI tools.',
  )
  .version(packageJson.version);

program
  .command('init')
  .description('Interactive initial setup')
  .action(() => InitCommand.run());

program
  .command('validate')
  .description('Validate a GitLab Merge Request with an AI tool')
  .argument('<url>', 'GitLab Merge Request URL')
  .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
  .action((url: string, options: ValidateOptions) => ValidateCommand.execute(url, options));

const config = program.command('config').description('Manage Moses configuration');

config
  .command('feedback-style')
  .description('Update AI feedback style on Merge Requests')
  .action(() => SetFeedbackStyleCommand.run());

config
  .command('diff-limit')
  .description('Update maximum allowed diff changes limit')
  .action(() => SetDiffLimitCommand.run());

const gitlab = program.command('gitlab').description('Manage GitLab instances');

gitlab
  .command('list')
  .description('List all configured GitLab instances')
  .action(() => ListGitlabsCommand.run());

gitlab
  .command('default')
  .description('Change the default GitLab instance')
  .action(() => SwitchGitlabCommand.run());

void program.parseAsync(process.argv);
