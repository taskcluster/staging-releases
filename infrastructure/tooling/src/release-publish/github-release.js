import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { withRetry } from './retry.js';

const CLIENT_SHELL_PLATFORMS = [
  'darwin-amd64',
  'darwin-arm64',
  'linux-amd64',
  'linux-arm64',
  'freebsd-amd64',
  'freebsd-arm64',
  'windows-amd64',
  'windows-arm64',
];

/** Assets that every release must have, as a sanity check on the build artifacts. */
export const requiredAssets = version => [
  ...CLIENT_SHELL_PLATFORMS.map(p => `taskcluster-${p}.${p.startsWith('windows') ? 'zip' : 'tar.gz'}`),
  `taskcluster-client-${version}.tgz`,
  `taskcluster-client-web-${version}.tgz`,
];

export const extractChangelog = (text, version) => {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^## v${escaped}\n+(.*?)\n^## v`, 'sm'));
  if (!match) {
    throw new Error(`Could not find version ${version} in CHANGELOG.md`);
  }
  return match[1];
};

// Draft releases are not returned by getReleaseByTag, so find them by listing.
export const findRelease = async ({ octokit, owner, repo, tag }) => {
  const releases = await octokit.paginate(octokit.repos.listReleases, { owner, repo, per_page: 100 });
  return releases.find(r => r.tag_name === tag);
};

const listAssets = (octokit, owner, repo, release_id) =>
  octokit.paginate(octokit.repos.listReleaseAssets, { owner, repo, release_id, per_page: 100 });

/**
 * Create (or reuse) the draft release and make its assets match `files`. Safe to
 * rerun: complete assets are kept, and partial ones are replaced.
 */
export const draftRelease = async ({ ctx, octokit, dir, files, changelog, sleep, log = console.log }) => {
  const { owner, repo, tag } = ctx;
  const names = new Set(files.map(f => f.file));
  const missing = requiredAssets(ctx.version).filter(n => !names.has(n));
  if (missing.length) {
    throw new Error(`build artifacts are missing required release assets: ${missing.join(', ')}`);
  }

  let outcome = 'up-to-date';
  let release = await findRelease({ octokit, owner, repo, tag });
  if (!release) {
    ({ data: release } = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: tag,
      body: changelog,
      draft: true,
      prerelease: false,
    }));
    outcome = 'created';
  } else if (!release.draft) {
    log(`release ${tag} is already published; checking its assets only`);
  }

  const existing = new Map((await listAssets(octokit, owner, repo, release.id)).map(a => [a.name, a]));
  for (const { file, size } of files) {
    const current = existing.get(file);
    // failed uploads linger with state 'starter'/'open'; only 'uploaded' counts
    if (current && current.size === size && current.state === 'uploaded') {
      continue;
    }
    if (outcome === 'up-to-date') {
      outcome = 'updated';
    }
    if (current) {
      log(`replacing incomplete asset ${file} (${current.size}/${size} bytes, state ${current.state})`);
      await octokit.repos.deleteReleaseAsset({ owner, repo, asset_id: current.id });
    }
    const data = fs.readFileSync(path.join(dir, file));
    await withRetry(
      () =>
        octokit.repos.uploadReleaseAsset({
          owner,
          repo,
          release_id: release.id,
          name: file,
          data,
          headers: { 'content-type': 'application/octet-stream', 'content-length': data.length },
        }),
      { sleep, log, label: `upload ${file}` }
    );
  }

  fs.writeFileSync(
    path.join(dir, 'expected-assets.json'),
    JSON.stringify(
      files.map(({ file, size }) => ({ file, size })),
      null,
      2
    )
  );
  return outcome;
};

/** Make the draft public, which also triggers .github/workflows/publish-npm.yml. */
export const publishRelease = async ({ ctx, octokit, expected, log = console.log }) => {
  const { owner, repo, tag, version } = ctx;
  const releases = await octokit.paginate(octokit.repos.listReleases, { owner, repo, per_page: 100 });
  const release = releases.find(r => r.tag_name === tag);
  if (!release) {
    throw new Error(`no release for ${tag}; rerun github-release-draft`);
  }
  if (!release.draft) {
    return 'already-published';
  }

  const assets = new Map(
    (await listAssets(octokit, owner, repo, release.id)).filter(a => a.state === 'uploaded').map(a => [a.name, a.size])
  );
  const missing = expected.filter(({ file, size }) => assets.get(file) !== size).map(e => e.file);
  if (missing.length) {
    throw new Error(`draft ${tag} is missing or has incomplete assets: ${missing.join(', ')}`);
  }

  const newest = releases
    .filter(r => !r.draft && semver.valid(r.tag_name.replace(/^v/, '')))
    .map(r => r.tag_name.replace(/^v/, ''))
    .sort(semver.rcompare)[0];
  const makeLatest = !newest || semver.gte(version, newest);

  const { data: published } = await octokit.repos.updateRelease({
    owner,
    repo,
    release_id: release.id,
    draft: false,
    make_latest: makeLatest ? 'true' : 'false',
  });
  log(`published ${published.html_url}`);
  return 'published';
};
