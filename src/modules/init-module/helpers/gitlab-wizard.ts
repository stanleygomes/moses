import axios from 'axios';
import { z } from 'zod';
import { UrlParser } from '../../../utils/url.util.js';
import { Display } from '../../../utils/display.util.js';
import { Prompt } from '../../../utils/prompt.util.js';
import { GitlabService } from '../../../services/gitlab.js';
import type { MosesConfig } from '../../../types/moses-config.type.js';

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

    const name = await Prompt.ask<string>({
      message: 'Instance nickname (e.g., "work", "gitlab-com" - to identify this GitLab config):',
      default: existingConfig?.defaultGitlab ?? 'gitlab-main',
      schema: z.string().min(1, 'Nickname is required'),
    });

    const url = await GitlabWizard.chooseGitlabBaseUrl();
    const settingsBase = url.replace(/\/$/, '');
    Display.info(`💡 Create a new Personal Access Token with "api" scope here:`);
    Display.link(`${settingsBase}/-/user_settings/personal_access_tokens`);

    let token = '';
    while (true) {
      token = await Prompt.password({
        message: 'Personal Access Token (scope: api):',
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
    const gitlabType = await Prompt.select<string>({
      message: 'Which GitLab do you want to use?',
      choices: [
        { name: 'GitLab.com (gitlab.com) — Default', value: 'default' },
        { name: 'Self-Hosted GitLab (provide a custom URL)', value: 'self' },
      ],
    });

    if (gitlabType === 'default') {
      return 'https://gitlab.com';
    }

    return Prompt.ask<string>({
      message: 'GitLab URL:',
      default: 'https://gitlab.your-domain.com',
      schema: z.string().refine((val) => UrlParser.isValidGitlabUrl(val), {
        message: 'Invalid URL. Use https:// and a valid domain.',
      }),
    });
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
