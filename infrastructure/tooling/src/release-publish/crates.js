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

/** Publish each crate that crates.io doesn't have yet, in dependency order. */
export const publishCrates = async ({ ctx, creds, rustDir, exec = realExec, sleep, log = console.log }) => {
  const result = {};
  for (const { dir, name } of CRATES) {
    if (!ctx.staging && (await crateVersionExists(name, ctx.version, { sleep, log }))) {
      result[name] = 'exists';
      continue;
    }
    const command = ['cargo', 'publish', '--no-verify'];
    if (ctx.staging) {
      command.push('--dry-run');
    }
    await withRetry(
      async () => {
        const r = await exec(command, {
          cwd: path.join(rustDir, dir),
          env: { ...process.env, CARGO_REGISTRY_TOKEN: creds.cratesioToken },
        });
        if (r.code !== 0) {
          throw new Error(`cargo publish ${name} failed: ${r.stderr.trim()}`);
        }
      },
      // cargo >= 1.66 waits for the index after publishing, but a dependent crate can
      // still briefly see "no matching package"; back off long enough to ride that out
      { sleep, log, label: `cargo publish ${name}`, baseMs: 15000 }
    );
    result[name] = ctx.staging ? 'dry-run' : 'published';
  }
  return result;
};
