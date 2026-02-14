import { describe, expect, it } from 'vitest';
import {
  buildPrFeedback,
  buildSecurityFixComment,
  findInvalidMessages,
  inferIssueLabels,
  isSecurityUpdatePullRequest,
  isValidConventionalMessage
} from '../src/rules.js';

describe('isValidConventionalMessage', () => {
  it('accepts supported commit formats', () => {
    expect(isValidConventionalMessage('fix: correct typo')).toBe(true);
    expect(isValidConventionalMessage('feat: add login system')).toBe(true);
    expect(isValidConventionalMessage('feat!: change API structure')).toBe(true);
  });

  it('rejects unsupported commit formats', () => {
    expect(isValidConventionalMessage('chore: update deps')).toBe(false);
    expect(isValidConventionalMessage('feat add login')).toBe(false);
    expect(isValidConventionalMessage('fix!: breaking fix')).toBe(false);
  });
});

describe('findInvalidMessages', () => {
  it('returns only invalid commit messages', () => {
    const invalid = findInvalidMessages([
      'fix: one',
      'feat: two',
      'docs: three',
      'feat!: four'
    ]);

    expect(invalid).toEqual(['docs: three']);
  });
});

describe('inferIssueLabels', () => {
  it('infers bug label', () => {
    expect(inferIssueLabels('Crash in app', 'this bug fails hard')).toContain('bug');
  });

  it('infers enhancement and docs labels', () => {
    const labels = inferIssueLabels('Feature request', 'Need better docs in README');
    expect(labels).toContain('enhancement');
    expect(labels).toContain('documentation');
  });
});

describe('buildPrFeedback', () => {
  it('returns null when everything is valid', () => {
    const feedback = buildPrFeedback({
      title: 'feat: add dashboard',
      invalidCommitMessages: []
    });

    expect(feedback).toBeNull();
  });

  it('reports invalid title and commits', () => {
    const feedback = buildPrFeedback({
      title: 'chore: update deps',
      invalidCommitMessages: ['docs: add notes']
    });

    expect(feedback).toContain('PR title is invalid');
    expect(feedback).toContain('docs: add notes');
  });
});

describe('isSecurityUpdatePullRequest', () => {
  it('returns true for dependabot security PRs', () => {
    expect(
      isSecurityUpdatePullRequest({
        title: 'Bump axios from 0.27.2 to 1.8.2 (security)',
        user: { login: 'dependabot[bot]' },
        labels: [{ name: 'dependencies' }]
      })
    ).toBe(true);
  });

  it('returns true when security label is present', () => {
    expect(
      isSecurityUpdatePullRequest({
        title: 'Bump lodash from 4.17.20 to 4.17.21',
        user: { login: 'dependabot[bot]' },
        labels: [{ name: 'security' }]
      })
    ).toBe(true);
  });

  it('returns false for non-dependabot PRs', () => {
    expect(
      isSecurityUpdatePullRequest({
        title: 'Security hardening changes',
        user: { login: 'alice' },
        labels: [{ name: 'security' }]
      })
    ).toBe(false);
  });
});

describe('buildSecurityFixComment', () => {
  it('includes auto-fix details', () => {
    const comment = buildSecurityFixComment();
    expect(comment).toContain('Dependabot security update');
    expect(comment).toContain('enabled auto-merge');
  });
});
