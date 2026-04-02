const URL_REGEX =
  /^https:\/\/(?<host>[^/]+)\/(?<projectPath>.+?)\/-\/merge_requests\/(?<mrIid>\d+)(?:\/.*)?$/;

export function parseMergeRequestUrl(url) {
  const match = url.match(URL_REGEX);
  if (!match?.groups) {
    throw new Error(
      'URL inválida. Formato esperado: https://<host>/<group>/<project>/-/merge_requests/<iid>',
    );
  }
  const { host, projectPath, mrIid } = match.groups;
  return {
    host,
    projectPath,
    mrIid,
    projectId: encodeURIComponent(projectPath),
  };
}

export function validateGitlabUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}
