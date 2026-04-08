import { BaseCommand } from './base.command.js';
import { UpdateModule } from '../modules/update.module.js';

export class UpdateCommand extends BaseCommand {
  public register(): void {
    this.program
      .command('update')
      .description('Update moses-cli to the latest version')
      .action(() => UpdateModule.run());
  }
}
