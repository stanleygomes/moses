import axios from 'axios';

function createClient(baseURL, token) {
  return axios.create({
    baseURL,
    headers: {
      'PRIVATE-TOKEN': token,
    },
    timeout: 15000,
  });
}

async function withRetry(fn, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === retries) break;
    }
  }
  throw lastError;
}

export async function validateToken(baseURL, token) {
  const client = createClient(baseURL, token);
  const response = await withRetry(() => client.get('/api/v4/user'));
  return response.data;
}

export async function getMergeRequestData(baseURL, token, projectId, mrIid) {
  const client = createClient(baseURL, token);
  const [mr, diffs, commits] = await Promise.all([
    withRetry(() => client.get(`/api/v4/projects/${projectId}/merge_requests/${mrIid}`)),
    withRetry(() => client.get(`/api/v4/projects/${projectId}/merge_requests/${mrIid}/diffs`)),
    withRetry(() => client.get(`/api/v4/projects/${projectId}/merge_requests/${mrIid}/commits`)),
  ]);
  return {
    mr: mr.data,
    diffs: diffs.data,
    commits: commits.data,
  };
}
