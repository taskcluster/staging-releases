import taskcluster from '@taskcluster/client';

/** Read the release context that src/transforms/release.py sets on every release task. */
export const loadContext = env => {
  const version = env.RELEASE_VERSION;
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`RELEASE_VERSION must be X.Y.Z; got ${JSON.stringify(version)}`);
  }
  const match = /^([^/]+)\/([^/]+)$/.exec(env.RELEASE_REPO || '');
  if (!match) {
    throw new Error(`RELEASE_REPO must be owner/repo; got ${JSON.stringify(env.RELEASE_REPO)}`);
  }
  const staging = env.STAGING === '1';
  if ((match[2] === 'staging-releases') !== staging) {
    throw new Error(
      `STAGING (${JSON.stringify(env.STAGING)}) does not match RELEASE_REPO ${JSON.stringify(env.RELEASE_REPO)}; ` +
        'staging-releases must be used with STAGING=1 and only with it'
    );
  }
  return {
    version,
    tag: `v${version}`,
    owner: match[1],
    repo: match[2],
    staging,
    taskId: env.TASK_ID,
  };
};

/** Load publishing credentials from the release secret via taskcluster-proxy. */
export const loadCredentials = async ({ staging, proxyUrl }) => {
  const secretName = `project/taskcluster/${staging ? 'staging-' : ''}release`;
  const secrets = new taskcluster.Secrets({ rootUrl: proxyUrl });
  const { secret } = await secrets.get(secretName);
  return {
    ghToken: secret.GH_TOKEN,
    dockerUsername: secret.DOCKER_USERNAME,
    dockerPassword: secret.DOCKER_PASSWORD,
  };
};
