import { input, select } from '@inquirer/prompts';
import { validateGitlabUrl } from '../../utils/url-parser.js';
import * as display from '../../utils/display.js';
import { validateToken } from '../../services/gitlab.js';

export async function chooseGitlabBaseUrl(): Promise<string> {
  const gitlabType = await select({
    message: 'Which GitLab do you want to use?',
    choices: [
      { name: 'GitLab.com (gitlab.com) — Default', value: 'default' },
      { name: 'Self-Hosted GitLab (provide a custom URL)', value: 'self' },
    ],
  });

  if (gitlabType === 'default') {
    return 'https://gitlab.com';
  }

  while (true) {
    const url = await input({ message: 'GitLab URL:', default: 'https://gitlab.your-domain.com' });
    if (validateGitlabUrl(url)) return url;
    display.error('Invalid URL. Use https:// and a valid domain.');
  }
}

export async function validateGitlabToken(gitlabUrl: string, token: string) {
  const tokenSpinner = display.spinner('Validating token...');
  try {
    const user = await validateToken(gitlabUrl, token);
    tokenSpinner.succeed(`Valid token! User: @${user.username}`);
    return user;
  } catch (error: unknown) {
    tokenSpinner.fail('Invalid or expired token.');
    display.info('See: https://docs.gitlab.com/user/profile/personal_access_tokens/');
    throw error;
  }
}
