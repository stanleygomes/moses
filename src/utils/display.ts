import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import ora, { type Ora } from 'ora';
import { APP_NAME } from '../constants.js';
import packageJson from '../../package.json' with { type: 'json' };

export function banner(): void {
  const title = figlet.textSync(APP_NAME, { font: 'Slant', horizontalLayout: 'default' });
  const subtitle = '  Thou shalt not break production  ';
  const version = chalk.dim(`v${packageJson?.version || '1.0.0'}`);

  console.log(
    boxen(`${chalk.bold.cyan(title)}\n${chalk.italic.gray(subtitle)}\n${version}`, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      dimBorder: true,
      textAlignment: 'center',
      title: chalk.yellow(' 🤖 MR Review Buddy '),
      titleAlignment: 'right',
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

export function link(text: string): void {
  console.log(chalk.cyan.underline(text));
}

export function stream(chunk: string): void {
  process.stdout.write(chunk);
}
