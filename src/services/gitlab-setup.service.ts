import { HttpUtil } from '../utils/http.util.js';
import { z } from 'zod';
import { UrlParser } from '../utils/url.util.js';
import { DisplayUtil } from '../utils/display.util.js';
import { Prompt } from '../utils/prompt.util.js';
import { GitlabClient } from '../api/gitlab/gitlab.client.js';
import type { MosesConfig } from '../types/moses-config.type.js';
import type { GitlabSetupData } from '../types/gitlab-setup-data.type.js';

export class GitlabSetupWizard {
  static async promptGitlabSetup(existingConfig: MosesConfig | null): Promise<GitlabSetupData> {
    GitlabSetupWizard.displayIntro();
    const name = await GitlabSetupWizard.promptInstanceName(existingConfig);
    const url = await GitlabSetupWizard.chooseGitlabBaseUrl();
    GitlabSetupWizard.displayTokenHelp(url);
    const token = await GitlabSetupWizard.promptValidatedToken(url);

    return { name, url, token };
  }

  static async chooseGitlabBaseUrl(): Promise<string> {
    const gitlabType = await GitlabSetupWizard.promptGitlabType();

    if (gitlabType === 'default') {
      return 'https://gitlab.com';
    }

    return GitlabSetupWizard.promptSelfHostedGitlabUrl();
  }

  static async validateGitlabToken(gitlabUrl: string, token: string) {
    const tokenSpinner = DisplayUtil.spinner('Validating token...');
    try {
      const gitlab = new GitlabClient(gitlabUrl, token);
      const user = await gitlab.users.getCurrentUser();
      tokenSpinner.succeed(`Valid token! User: @${user.username}`);
      return user;
    } catch (error: unknown) {
      const status = HttpUtil.getStatus(error);
      const message = status ? `Failed (Status ${status})` : 'Invalid or expired token.';
      tokenSpinner.fail(message);
      const settingsBase = UrlParser.normalizeBaseUrl(gitlabUrl);
      DisplayUtil.link(`   ${settingsBase}/-/user_settings/personal_access_tokens`);
      throw error;
    }
  }

  private static displayIntro(): void {
    DisplayUtil.section('📋 GITLAB CONFIGURATION');
    DisplayUtil.info(
      '💡 TIP: Use a nickname to Identify this GitLab config (e.g. "work", "gitlab-org").',
    );
    DisplayUtil.info('   You can run "init" again later to add more instances.');
  }

  private static async promptInstanceName(existingConfig: MosesConfig | null): Promise<string> {
    return Prompt.ask<string>({
      message: 'Instance nickname (e.g., "work", "gitlab-com" - to identify this GitLab config):',
      default: existingConfig?.defaultGitlab ?? 'gitlab-main',
      schema: z.string().min(1, 'Nickname is required'),
    });
  }

  private static async promptGitlabType(): Promise<'default' | 'self'> {
    return Prompt.select<'default' | 'self'>({
      message: 'Which GitLab do you want to use?',
      choices: [
        { name: 'GitLab.com (gitlab.com) — Default', value: 'default' },
        { name: 'Self-Hosted GitLab (provide a custom URL)', value: 'self' },
      ],
    });
  }

  private static async promptSelfHostedGitlabUrl(): Promise<string> {
    return Prompt.ask<string>({
      message: 'GitLab URL:',
      default: 'https://gitlab.your-domain.com',
      schema: z.string().refine((val) => UrlParser.isValidGitlabUrl(val), {
        message: 'Invalid URL. Use https:// and a valid domain.',
      }),
    });
  }

  private static displayTokenHelp(url: string): void {
    const settingsBase = UrlParser.normalizeBaseUrl(url);
    DisplayUtil.info('💡 Create a new Personal Access Token with "api" scope here:');
    DisplayUtil.link(`${settingsBase}/-/user_settings/personal_access_tokens`);
  }

  private static async promptValidatedToken(url: string): Promise<string> {
    while (true) {
      const token = await Prompt.password({
        message: 'Personal Access Token (scope: api):',
      });

      try {
        await GitlabSetupWizard.validateGitlabToken(url, token);
        return token;
      } catch {
        // Just loop back on invalid token
      }
    }
  }
}
