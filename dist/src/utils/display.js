import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { APP_NAME } from '../constants.js';
export function banner() {
    const title = figlet.textSync(APP_NAME, { horizontalLayout: 'default' });
    console.log(boxen(chalk.cyan(title), {
        borderStyle: 'round',
        borderColor: 'cyan',
        padding: 1,
    }));
}
export function section(title) {
    console.log(chalk.bold('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold(title));
    console.log(chalk.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}
export function spinner(text) {
    return ora({ text, color: 'cyan' }).start();
}
export function success(text) {
    console.log(chalk.green(`✅ ${text}`));
}
export function error(text) {
    console.error(chalk.red(`❌ ${text}`));
}
export function info(text) {
    console.log(chalk.blue(text));
}
export function warn(text) {
    console.log(chalk.yellow(`⚠️ ${text}`));
}
export function streamLine(line) {
    process.stdout.write(chalk.gray(line));
}
