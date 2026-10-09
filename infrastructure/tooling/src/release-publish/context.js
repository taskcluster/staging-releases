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
  return {
    version,
    tag: `v${version}`,
    owner: match[1],
    repo: match[2],
    staging: env.STAGING === '1',
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
    cratesioToken: secret.CRATESIO_TOKEN,
    pypiUsername: secret.PYPI_USERNAME,
    pypiPassword: secret.PYPI_PASSWORD,
    dockerUsername: secret.DOCKER_USERNAME,
    dockerPassword: secret.DOCKER_PASSWORD,
  };
};
