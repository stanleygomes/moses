#!/usr/bin/env node

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };
import { ConfigCommand } from './commands/config.command.js';
import { GitlabInstanceCommand } from './commands/gitlab-instance.command.js';
import { InitCommand } from './commands/init.command.js';
import { ValidateCommand } from './commands/validate.command.js';

const program = new Command();

program
  .name('moses')
  .description(
    'CLI buddy to help you with code review of GitLab Merge Requests, by using AI tools.',
  )
  .version(packageJson.version);

const commands = [
  new GitlabInstanceCommand(program),
  new InitCommand(program),
  new ValidateCommand(program),
  new ConfigCommand(program),
];

commands.forEach((cmd) => cmd.register());

void program.parseAsync(process.argv);
