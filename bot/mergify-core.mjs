export function getLatestReviewStateByUser(reviews) {
  const latestByUser = new Map();

  for (const review of reviews) {
    if (!review?.user?.login || !review?.submitted_at) continue;

    const existing = latestByUser.get(review.user.login);
    if (!existing || new Date(review.submitted_at) > new Date(existing.submitted_at)) {
      latestByUser.set(review.user.login, {
        state: review.state,
        submitted_at: review.submitted_at,
      });
    }
  }

  return latestByUser;
}

export function hasRequiredApproval(reviews, requiredApprovals = 1) {
  const latestByUser = getLatestReviewStateByUser(reviews);
  let approvedCount = 0;
  let hasChangesRequested = false;

  for (const { state } of latestByUser.values()) {
    if (state === 'APPROVED') approvedCount += 1;
    if (state === 'CHANGES_REQUESTED') hasChangesRequested = true;
  }

  return approvedCount >= requiredApprovals && !hasChangesRequested;
}

export function areChecksPassing(checkRuns, combinedStatus, requireCombinedStatusSuccess = true) {
  const allowed = new Set(['success', 'neutral', 'skipped']);

  const allCheckRunsPassing = checkRuns.every(checkRun => allowed.has(checkRun.conclusion));
  const combinedPassing = requireCombinedStatusSuccess ? combinedStatus === 'success' : true;

  return allCheckRunsPassing && combinedPassing;
}

export function shouldMerge({ pullRequest, approved, checksPassing }) {
  if (!pullRequest) return false;
  if (pullRequest.state !== 'open') return false;
  if (pullRequest.draft) return false;
  if (pullRequest.mergeable === false) return false;

  return approved && checksPassing;
}

export function parseSimpleYamlConfig(yamlText) {
  const config = {};

  for (const rawLine of yamlText.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf(':');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (value === 'true') {
      config[key] = true;
      continue;
    }

    if (value === 'false') {
      config[key] = false;
      continue;
    }

    const numeric = Number(value);
    if (!Number.isNaN(numeric) && value !== '') {
      config[key] = numeric;
      continue;
    }

    config[key] = value;
  }

  return config;
}
