#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from '../src/commands/init.js';
import { runValidate } from '../src/commands/validate.js';

const program = new Command();

program
  .name('moses')
  .description('Validação automática de Merge Requests do GitLab com IA')
  .version('1.0.0');

program.command('init').description('Setup inicial interativo').action(runInit);

program
  .command('validate')
  .description('Valida um Merge Request do GitLab')
  .argument('<url>', 'URL do Merge Request do GitLab')
  .action(runValidate);

program.parseAsync(process.argv);
