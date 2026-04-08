import axios, { type AxiosInstance } from 'axios';
import type { MergeRequestBundle } from '../types/merge-request-bundle.type.js';

interface GitlabUser {
  username: string;
}

export class GitlabApiService {
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
    const client = GitlabApiService.createClient(baseURL, token);
    const response = await GitlabApiService.withRetry(() => client.get<GitlabUser>('/api/v4/user'));
    return response.data;
  }

  static async getMergeRequestData(
    baseURL: string,
    token: string,
    projectId: string,
    mrIid: string,
  ): Promise<MergeRequestBundle> {
    const client = GitlabApiService.createClient(baseURL, token);
    const [mr, diffs, commits] = await Promise.all([
      GitlabApiService.fetchMergeRequest(client, projectId, mrIid),
      GitlabApiService.fetchMergeRequestDiffs(client, projectId, mrIid),
      GitlabApiService.fetchMergeRequestCommits(client, projectId, mrIid),
    ]);
    return {
      mr: mr.data,
      diffs: diffs.data,
      commits: commits.data,
    };
  }

  private static getMergeRequestBasePath(projectId: string, mrIid: string): string {
    return `/api/v4/projects/${projectId}/merge_requests/${mrIid}`;
  }

  private static fetchMergeRequest(client: AxiosInstance, projectId: string, mrIid: string) {
    const route = GitlabApiService.getMergeRequestBasePath(projectId, mrIid);
    return GitlabApiService.withRetry(() => client.get<MergeRequestBundle['mr']>(route));
  }

  private static fetchMergeRequestDiffs(client: AxiosInstance, projectId: string, mrIid: string) {
    const route = `${GitlabApiService.getMergeRequestBasePath(projectId, mrIid)}/diffs`;
    return GitlabApiService.withRetry(() => client.get<MergeRequestBundle['diffs']>(route));
  }

  private static fetchMergeRequestCommits(client: AxiosInstance, projectId: string, mrIid: string) {
    const route = `${GitlabApiService.getMergeRequestBasePath(projectId, mrIid)}/commits`;
    return GitlabApiService.withRetry(() => client.get<MergeRequestBundle['commits']>(route));
  }
}
