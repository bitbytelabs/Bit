import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areChecksPassing,
  getLatestReviewStateByUser,
  hasRequiredApproval,
  parseSimpleYamlConfig,
  shouldMerge,
} from './mergify-core.mjs';

test('getLatestReviewStateByUser keeps only latest review for each user', () => {
  const result = getLatestReviewStateByUser([
    { user: { login: 'alice' }, state: 'COMMENTED', submitted_at: '2025-01-01T00:00:00Z' },
    { user: { login: 'alice' }, state: 'APPROVED', submitted_at: '2025-01-02T00:00:00Z' },
    { user: { login: 'bob' }, state: 'CHANGES_REQUESTED', submitted_at: '2025-01-03T00:00:00Z' },
  ]);

  assert.equal(result.size, 2);
  assert.equal(result.get('alice').state, 'APPROVED');
  assert.equal(result.get('bob').state, 'CHANGES_REQUESTED');
});

test('hasRequiredApproval supports configurable minimum approvals', () => {
  const reviews = [
    { user: { login: 'alice' }, state: 'APPROVED', submitted_at: '2025-01-02T00:00:00Z' },
    { user: { login: 'bob' }, state: 'APPROVED', submitted_at: '2025-01-03T00:00:00Z' },
  ];

  assert.equal(hasRequiredApproval(reviews, 1), true);
  assert.equal(hasRequiredApproval(reviews, 2), true);
  assert.equal(hasRequiredApproval(reviews, 3), false);
});

test('areChecksPassing validates both check runs and optional combined status requirement', () => {
  assert.equal(
    areChecksPassing([{ conclusion: 'success' }, { conclusion: 'neutral' }], 'success', true),
    true,
  );

  assert.equal(
    areChecksPassing([{ conclusion: 'success' }], 'pending', false),
    true,
  );

  assert.equal(
    areChecksPassing([{ conclusion: 'failure' }], 'success', true),
    false,
  );
});

test('shouldMerge requires open, non-draft, mergeable PR plus approval and checks', () => {
  const pullRequest = { state: 'open', draft: false, mergeable: true };
  assert.equal(shouldMerge({ pullRequest, approved: true, checksPassing: true }), true);
  assert.equal(shouldMerge({ pullRequest: { ...pullRequest, draft: true }, approved: true, checksPassing: true }), false);
  assert.equal(shouldMerge({ pullRequest, approved: false, checksPassing: true }), false);
});

test('parseSimpleYamlConfig parses strings, numbers and booleans', () => {
  const config = parseSimpleYamlConfig(`
required_approvals: 2
ready_label: ready-to-merge
merge_method: squash
require_combined_status_success: false
`);

  assert.deepEqual(config, {
    required_approvals: 2,
    ready_label: 'ready-to-merge',
    merge_method: 'squash',
    require_combined_status_success: false,
  });
});
