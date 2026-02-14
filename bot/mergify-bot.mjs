import fs from 'node:fs';
import { areChecksPassing, hasRequiredApproval, parseSimpleYamlConfig, shouldMerge } from './mergify-core.mjs';

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!token || !repo || !eventPath) {
  console.log('Missing required GitHub environment variables, skipping.');
  process.exit(0);
}

const configPath = new URL('./.mergify.yml', import.meta.url);
const rawConfig = fs.readFileSync(configPath, 'utf8');
const config = parseSimpleYamlConfig(rawConfig);

const settings = {
  requiredApprovals: Number(config.required_approvals ?? 1),
  readyLabel: String(config.ready_label ?? 'ready-to-merge'),
  mergeMethod: String(config.merge_method ?? 'squash'),
  requireCombinedStatusSuccess: Boolean(config.require_combined_status_success ?? true),
};

const [owner, repoName] = repo.split('/');
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const pullNumber = event.pull_request?.number;

if (!pullNumber) {
  console.log('No pull request found in this event, skipping.');
  process.exit(0);
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${path}\n${errorBody}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function ensureLabel(label) {
  await githubRequest(`/repos/${owner}/${repoName}/issues/${pullNumber}/labels`, {
    method: 'POST',
    body: JSON.stringify({ labels: [label] }),
  });
}

async function removeLabel(label) {
  try {
    await githubRequest(`/repos/${owner}/${repoName}/issues/${pullNumber}/labels/${encodeURIComponent(label)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (String(error).includes('(404)')) return;
    throw error;
  }
}

async function mergePullRequest() {
  try {
    await githubRequest(`/repos/${owner}/${repoName}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        merge_method: settings.mergeMethod,
      }),
    });
    console.log(`Merged PR #${pullNumber} with ${settings.mergeMethod}.`);
  } catch (error) {
    if (String(error).includes('(405)') || String(error).includes('(409)')) {
      console.log(`PR #${pullNumber} is not mergeable right now: ${error.message}`);
      return;
    }
    throw error;
  }
}

async function run() {
  const pullRequest = await githubRequest(`/repos/${owner}/${repoName}/pulls/${pullNumber}`);

  const [reviews, checkRunsData, statusData] = await Promise.all([
    githubRequest(`/repos/${owner}/${repoName}/pulls/${pullNumber}/reviews`),
    githubRequest(`/repos/${owner}/${repoName}/commits/${pullRequest.head.sha}/check-runs`),
    githubRequest(`/repos/${owner}/${repoName}/commits/${pullRequest.head.sha}/status`),
  ]);

  const approved = hasRequiredApproval(reviews, settings.requiredApprovals);
  const checksPassing = areChecksPassing(
    checkRunsData.check_runs || [],
    statusData.state,
    settings.requireCombinedStatusSuccess,
  );
  const ready = shouldMerge({ pullRequest, approved, checksPassing });

  if (!ready) {
    console.log(`PR #${pullNumber} is not ready (approved=${approved}, checksPassing=${checksPassing}).`);
    await removeLabel(settings.readyLabel);
    return;
  }

  await ensureLabel(settings.readyLabel);
  await mergePullRequest();
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
