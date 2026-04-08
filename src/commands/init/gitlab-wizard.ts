import axios from 'axios';
import { input, password, select } from '@inquirer/prompts';
import { UrlParser } from '../../utils/url-parser.js';
import { Display } from '../../utils/display.js';
import { GitlabService } from '../../services/gitlab.js';
import type { MosesConfig } from '../../types/MosesConfig.js';

export interface GitlabSetupData {
  name: string;
  url: string;
  token: string;
}

export class GitlabWizard {
  static async promptGitlabSetup(existingConfig: MosesConfig | null): Promise<GitlabSetupData> {
    Display.section('📋 GITLAB CONFIGURATION');
    Display.info(
      '💡 TIP: Use a nickname to Identify this GitLab config (e.g. "work", "gitlab-org").',
    );
    Display.info('   You can run "init" again later to add more instances.');

    const name = await input({
      message: 'Instance nickname (e.g., "work", "gitlab-com" - to identify this GitLab config):',
      default: existingConfig?.defaultGitlab ?? 'gitlab-main',
    });

    const url = await GitlabWizard.chooseGitlabBaseUrl();
    const settingsBase = url.replace(/\/$/, '');
    Display.info(`💡 Create a new Personal Access Token with "api" scope here:`);
    Display.link(`${settingsBase}/-/user_settings/personal_access_tokens`);

    let token = '';
    while (true) {
      token = await password({
        message: 'Personal Access Token (scope: api):',
        mask: '*',
      });

      try {
        await GitlabWizard.validateGitlabToken(url, token);
        break;
      } catch {
        // Just loop back on invalid token
      }
    }

    return { name, url, token };
  }

  static async chooseGitlabBaseUrl(): Promise<string> {
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
      const url = await input({
        message: 'GitLab URL:',
        default: 'https://gitlab.your-domain.com',
      });
      if (UrlParser.validateGitlabUrl(url)) return url;
      Display.error('Invalid URL. Use https:// and a valid domain.');
    }
  }

  static async validateGitlabToken(gitlabUrl: string, token: string) {
    const tokenSpinner = Display.spinner('Validating token...');
    try {
      const user = await GitlabService.validateToken(gitlabUrl, token);
      tokenSpinner.succeed(`Valid token! User: @${user.username}`);
      return user;
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = status ? `Failed (Status ${status})` : 'Invalid or expired token.';
      tokenSpinner.fail(message);
      const settingsBase = gitlabUrl.replace(/\/$/, '');
      Display.link(`   ${settingsBase}/-/user_settings/personal_access_tokens`);
      throw error;
    }
  }
}
