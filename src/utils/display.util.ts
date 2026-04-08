import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import ora, { type Ora } from 'ora';
import { APP_NAME } from '../constants/app.constant.js';
import packageJson from '../../package.json' with { type: 'json' };

export class Display {
  static banner(): void {
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

  static section(title: string): void {
    console.log(chalk.bold.cyan('\n' + '━'.repeat(process.stdout.columns || 60)));
    console.log(chalk.bold.white(`  ${title}`));
    console.log(chalk.bold.cyan('━'.repeat(process.stdout.columns || 60) + '\n'));
  }

  static box(content: string, title?: string, color: string = 'cyan'): void {
    console.log(
      boxen(content, {
        padding: 1,
        margin: { top: 1, bottom: 0 },
        borderStyle: 'round',
        borderColor: color,
        title: title ? `${title}` : undefined,
        titleAlignment: 'left',
      }),
    );
  }

  static line(color: string = 'dim'): void {
    const char = '─';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chalkFn = (chalk as any)[color] ?? chalk.dim;
    console.log(chalkFn(char.repeat(process.stdout.columns || 60)));
  }

  static spinner(text: string): Ora {
    return ora({ text, color: 'cyan' }).start();
  }

  static success(text: string): void {
    console.log(chalk.green(`\n${text}`));
  }

  static error(text: string): void {
    console.error(chalk.red(`\n${text}`));
  }

  static info(text: string): void {
    console.log(chalk.blue(text));
  }

  static dim(text: string): void {
    console.log(chalk.dim(text));
  }

  static warn(text: string): void {
    console.log(chalk.yellow(text));
  }

  static link(text: string): void {
    console.log(chalk.cyan.underline(text));
  }

  static stream(chunk: string): void {
    process.stdout.write(chunk);
  }
}
