import path from 'node:path';
import { exec as realExec } from './exec.js';
import { withRetry } from './retry.js';

// publish order matters: download and upload depend on taskcluster
export const CRATES = [
  { dir: 'client', name: 'taskcluster' },
  { dir: 'download', name: 'taskcluster-download' },
  { dir: 'upload', name: 'taskcluster-upload' },
];

const USER_AGENT = 'taskcluster-release (taskcluster-notifications@mozilla.com)';

const crateVersionExists = (name, version, { sleep, log }) =>
  withRetry(
    async () => {
      const res = await fetch(`https://crates.io/api/v1/crates/${name}/${version}`, {
        headers: { 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 404) {
        return false;
      }
      if (!res.ok) {
        throw new Error(`crates.io returned ${res.status} for ${name}`);
      }
      return true;
    },
    { sleep, log, label: `query crates.io for ${name}` }
  );

const ALREADY_PUBLISHED = /already (uploaded|exists)/i;
const AUTH_FAILURE = /401|403|unauthorized|invalid token|token is invalid/i;

/**
 * Run one `cargo publish` invocation with retries. A retry after a partially-successful
 * attempt (upload succeeded, then the connection dropped) sees "already uploaded", which
 * means the crate is published; auth failures are not retried.
 */
const cargoPublish = ({ command, cwd, token, exec, sleep, log, label }) =>
  withRetry(
    async () => {
      const r = await exec(command, { cwd, env: { ...process.env, CARGO_REGISTRY_TOKEN: token } });
      if (r.code === 0) {
        return;
      }
      const stderr = r.stderr.trim();
      if (ALREADY_PUBLISHED.test(stderr)) {
        log(`${label}: crates.io already has this version; treating as published`);
        return;
      }
      throw Object.assign(new Error(`${label} failed: ${stderr}`), {
        retriable: !AUTH_FAILURE.test(stderr),
      });
    },
    // cargo >= 1.66 waits for the index after publishing, but a dependent crate can
    // still briefly see "no matching package"; back off long enough to ride that out
    { sleep, log, label, baseMs: 15000 }
  );

/**
 * Publish each crate that crates.io doesn't have yet, in dependency order.
 *
 * Staging runs a single multi-package dry run from the workspace: the dependent crates
 * require taskcluster@<new version>, which only resolves when packaged together with it.
 */
export const publishCrates = async ({ ctx, creds, rustDir, exec = realExec, sleep, log = console.log }) => {
  const token = creds.cratesioToken;
  if (ctx.staging) {
    const command = ['cargo', 'publish', '--dry-run', '--no-verify', ...CRATES.flatMap(({ name }) => ['-p', name])];
    await cargoPublish({ command, cwd: rustDir, token, exec, sleep, log, label: 'cargo publish --dry-run' });
    return Object.fromEntries(CRATES.map(({ name }) => [name, 'dry-run']));
  }

  const result = {};
  for (const { dir, name } of CRATES) {
    if (await crateVersionExists(name, ctx.version, { sleep, log })) {
      result[name] = 'exists';
      continue;
    }
    await cargoPublish({
      command: ['cargo', 'publish', '--no-verify'],
      cwd: path.join(rustDir, dir),
      token,
      exec,
      sleep,
      log,
      label: `cargo publish ${name}`,
    });
    result[name] = 'published';
  }
  return result;
};
