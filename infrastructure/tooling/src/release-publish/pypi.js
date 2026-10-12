import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { exec as realExec } from './exec.js';
import { fatal, withRetry } from './retry.js';

const OUT_DIR = 'release-dist';
const FATAL_PUBLISH_ERROR = /403|401|Forbidden|Unauthorized|invalid/i;

export const publishedFiles = async (version, { sleep, log } = {}) =>
  withRetry(
    async () => {
      const res = await fetch(`https://pypi.org/pypi/taskcluster/${version}/json`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 404) {
        return new Map();
      }
      // 429 is rate limiting, which passes; every other 4xx means the request itself is wrong
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw fatal(`PyPI returned ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`PyPI returned ${res.status}`);
      }
      const { urls } = await res.json();
      return new Map(urls.map(u => [u.filename, u.digests?.sha256]));
    },
    { sleep, log, label: 'query PyPI' }
  );

/**
 * Build the Python client and upload whichever of its files PyPI doesn't have yet.
 * PyPI never accepts a re-upload of an existing filename, so a filename that's
 * already present counts as done even if a rebuild hashes differently.
 */
export const publishPypi = async ({ ctx, creds, clientDir, exec = realExec, sleep, log = console.log }) => {
  const dist = path.join(clientDir, OUT_DIR);
  // never upload anything left over from an earlier build
  fs.rmSync(dist, { recursive: true, force: true });
  const build = await exec(['uv', 'build', '--out-dir', OUT_DIR], { cwd: clientDir });
  if (build.code !== 0) {
    throw new Error(`uv build failed: ${build.stderr}`);
  }
  const built = fs.readdirSync(dist).filter(f => f.endsWith('.whl') || f.endsWith('.tar.gz'));
  const sdist = `taskcluster-${ctx.version}.tar.gz`;
  const wheelPrefix = `taskcluster-${ctx.version}-`;
  const wheels = built.filter(f => f.startsWith(wheelPrefix) && f.endsWith('.whl'));
  if (!built.includes(sdist) || wheels.length !== 1 || built.length !== 2) {
    // typically pyproject.toml's version doesn't match the release version
    throw fatal(
      `built files [${built.join(', ')}] do not match expected [${sdist}, ${wheelPrefix}*.whl] for version ${ctx.version}`
    );
  }
  const files = [sdist, wheels[0]];
  if (ctx.staging) {
    log(`staging: built ${files.join(', ')}; not uploading`);
    return 'dry-run';
  }

  const published = await publishedFiles(ctx.version, { sleep, log });
  const toUpload = [];
  for (const file of files) {
    if (!published.has(file)) {
      toUpload.push(path.join(dist, file));
      continue;
    }
    const local = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(dist, file)))
      .digest('hex');
    if (published.get(file) && published.get(file) !== local) {
      log(
        `warning: ${file} is already on PyPI with a different sha256 (rebuilds are not byte-reproducible); keeping the published file`
      );
    }
  }
  if (toUpload.length === 0) {
    return 'exists';
  }

  // --check-url makes uv skip files already on the index, so a retry after a partial upload succeeds
  await withRetry(
    async () => {
      const r = await exec(
        [
          'uv',
          'publish',
          '--publish-url',
          'https://upload.pypi.org/legacy/',
          '--check-url',
          'https://pypi.org/simple/',
          ...toUpload,
        ],
        {
          cwd: clientDir,
          env: { ...process.env, UV_PUBLISH_USERNAME: creds.pypiUsername, UV_PUBLISH_PASSWORD: creds.pypiPassword },
        }
      );
      if (r.code !== 0) {
        const message = `uv publish failed: ${r.stderr.trim()}`;
        throw FATAL_PUBLISH_ERROR.test(r.stderr) ? fatal(message) : new Error(message);
      }
    },
    { sleep, log, label: 'uv publish' }
  );
  return 'published';
};
