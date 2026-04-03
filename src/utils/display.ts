import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import ora, { type Ora } from 'ora';
import { APP_NAME } from '../constants.js';

export function banner(): void {
  const title = figlet.textSync(APP_NAME, { horizontalLayout: 'default' });
  console.log(
    boxen(chalk.cyan(title), {
      borderStyle: 'round',
      borderColor: 'cyan',
      padding: 1,
    }),
  );
}

export function section(title: string): void {
  console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold(title));
  console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

export function spinner(text: string): Ora {
  return ora({ text, color: 'cyan' }).start();
}

export function success(text: string): void {
  console.log(chalk.green(`✅ ${text}`));
}

export function error(text: string): void {
  console.error(chalk.red(`❌ ${text}`));
}

export function info(text: string): void {
  console.log(chalk.blue(text));
}

export function warn(text: string): void {
  console.log(chalk.yellow(`⚠️ ${text}`));
}

export function streamLine(line: string): void {
  process.stdout.write(chalk.gray(line));
}
