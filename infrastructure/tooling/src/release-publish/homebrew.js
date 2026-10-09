import { withRetry } from './retry.js';

const TAP = { owner: 'taskcluster', repo: 'homebrew-tap', path: 'Casks/taskcluster.rb' };

export const caskUrls = cask => [...cask.matchAll(/url "([^"]+)"/g)].map(m => m[1]);

const waitForUrl = (url, { sleep, log }) =>
  withRetry(
    async () => {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status !== 200) {
        throw new Error(`${url} returned ${res.status}`);
      }
    },
    { attempts: 8, baseMs: 3000, sleep, log, label: `HEAD ${url}` }
  );

/**
 * Commit the cask built by binaries-client-shell to the Homebrew tap, but only once
 * every download URL it names is publicly reachable, so `brew upgrade` never 404s.
 */
export const publishHomebrew = async ({ ctx, octokit, cask, sleep, log = console.log }) => {
  if (ctx.staging) {
    throw Object.assign(new Error('publish-homebrew must never run for staging releases'), { retriable: false });
  }
  if (!cask.includes(`version "${ctx.version}"`)) {
    throw new Error(`cask does not declare version "${ctx.version}" (snapshot build?)`);
  }
  const urls = caskUrls(cask);
  if (urls.length === 0) {
    throw new Error('cask contains no download urls');
  }
  for (const url of urls) {
    await waitForUrl(url, { sleep, log });
  }

  let current;
  try {
    ({ data: current } = await octokit.repos.getContent(TAP));
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }
  if (current && (Array.isArray(current) || current.type !== 'file')) {
    throw Object.assign(new Error(`${TAP.owner}/${TAP.repo}:${TAP.path} is not a regular file`), {
      retriable: false,
    });
  }
  if (current && Buffer.from(current.content, 'base64').toString() === cask) {
    return 'up-to-date';
  }

  await octokit.repos.createOrUpdateFileContents({
    ...TAP,
    message: `Brew cask update for taskcluster version ${ctx.tag}`,
    content: Buffer.from(cask).toString('base64'),
    ...(current ? { sha: current.sha } : {}),
  });
  return 'committed';
};
