import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import taskcluster from '@taskcluster/client';
import { Octokit } from '@octokit/rest';
import { loadContext, loadCredentials } from './context.js';
import { fetchDependencyArtifacts } from './artifacts.js';

// step name -> async ({ ctx, creds, octokit, workDir, fetchArtifacts, name }) => outcome string
const STEPS = {};

export const runStep = async ({ step, name }) => {
  const impl = STEPS[step];
  if (!impl) {
    throw new Error(`unknown --step ${step}; use one of ${Object.keys(STEPS).join(', ')}`);
  }
  const proxyUrl = process.env.TASKCLUSTER_PROXY_URL;
  if (!proxyUrl) {
    throw new Error('release:step must run in a task with taskcluster-proxy enabled');
  }
  const ctx = loadContext(process.env);
  const creds = await loadCredentials({ staging: ctx.staging, proxyUrl });
  const queue = new taskcluster.Queue({ rootUrl: proxyUrl });
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `release-${step}-`));
  const fetchArtifacts = prefix => fetchDependencyArtifacts({ queue, taskId: ctx.taskId, prefix, destDir: workDir });
  const octokit = new Octokit({ auth: creds.ghToken });

  const outcome = await impl({ ctx, creds, octokit, workDir, fetchArtifacts, name });
  console.log(`${step}${name ? ` ${name}` : ''}: ${outcome}`);
};

export { STEPS };
