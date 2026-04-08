import type { ParsedMergeRequestUrl } from '../types/parsed-merge-request-url.type.js';

const URL_REGEX =
  /^https:\/\/(?<host>[^/]+)\/(?<projectPath>.+?)\/-\/merge_requests\/(?<mrIid>\d+)(?:\/.*)?$/;

export class UrlParser {
  static parseMergeRequestUrl(url: string): ParsedMergeRequestUrl {
    const match = url.match(URL_REGEX);

    if (!match?.groups) {
      throw new Error(
        'Invalid URL. Expected format: https://<host>/<group>/<project>/-/merge_requests/<iid>',
      );
    }

    const { host, projectPath, mrIid } = match.groups;

    if (!host || !projectPath || !mrIid) {
      throw new Error('Invalid URL. Missing host, project path, or merge request ID.');
    }

    return {
      host,
      projectPath,
      mrIid,
      projectId: encodeURIComponent(projectPath),
    };
  }

  static isValidGitlabUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && Boolean(parsed.hostname);
    } catch {
      return false;
    }
  }

  static normalizeBaseUrl(url: string): string {
    return url.replace(/\/$/, '');
  }
}
