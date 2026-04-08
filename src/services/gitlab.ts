import axios, { type AxiosInstance } from 'axios';
import type { MergeRequestBundle } from '../types/MergeRequestBundle.js';

interface GitlabUser {
  username: string;
}

export class GitlabService {
  private static createClient(baseURL: string, token: string): AxiosInstance {
    return axios.create({
      baseURL,
      headers: {
        'PRIVATE-TOKEN': token,
      },
      timeout: 15000,
    });
  }

  private static async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i <= retries; i += 1) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown request error');
        if (i === retries) break;
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('Unexpected retry failure');
  }

  static async validateToken(baseURL: string, token: string): Promise<GitlabUser> {
    const client = GitlabService.createClient(baseURL, token);
    const response = await GitlabService.withRetry(() => client.get<GitlabUser>('/api/v4/user'));
    return response.data;
  }

  static async getMergeRequestData(
    baseURL: string,
    token: string,
    projectId: string,
    mrIid: string,
  ): Promise<MergeRequestBundle> {
    const client = GitlabService.createClient(baseURL, token);
    const [mr, diffs, commits] = await Promise.all([
      GitlabService.withRetry(() =>
        client.get<MergeRequestBundle['mr']>(
          `/api/v4/projects/${projectId}/merge_requests/${mrIid}`,
        ),
      ),
      GitlabService.withRetry(() =>
        client.get<MergeRequestBundle['diffs']>(
          `/api/v4/projects/${projectId}/merge_requests/${mrIid}/diffs`,
        ),
      ),
      GitlabService.withRetry(() =>
        client.get<MergeRequestBundle['commits']>(
          `/api/v4/projects/${projectId}/merge_requests/${mrIid}/commits`,
        ),
      ),
    ]);
    return {
      mr: mr.data,
      diffs: diffs.data,
      commits: commits.data,
    };
  }
}
