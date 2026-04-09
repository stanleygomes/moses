import type { ValidateOptions } from '../types/validate-options.type.js';
import { BaseCommand } from './base.command.js';
import { ValidateModule } from '../modules/validate.module.js';

export class ValidateCommand extends BaseCommand {
  public register(): void {
    this.program
      .command('validate')
      .description('Validate a GitLab Merge Request with an AI tool')
      .argument('<url>', 'GitLab Merge Request URL')
      .option('-p, --prompt <text>', 'Additional context prompt to send with MR diff')
      .option('-i, --instruction-file <file>', 'Specific instruction file from skills folder')
      .option('-m, --model <name>', 'Provide a specific AI model for the chosen tool')
      .action((url: string, options: ValidateOptions) => ValidateModule.run(url, options));
  }
}
