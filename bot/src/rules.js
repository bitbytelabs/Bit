const FIX_RE = /^fix:\s.+/;
const FEAT_RE = /^feat:\s.+/;
const FEAT_BREAKING_RE = /^feat!:\s.+/;

export const BOT_MARKER = '<!-- bit-maintainer-bot -->';

export function isValidConventionalMessage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const trimmed = message.trim();
  return FIX_RE.test(trimmed) || FEAT_RE.test(trimmed) || FEAT_BREAKING_RE.test(trimmed);
}

export function findInvalidMessages(messages) {
  return messages.filter((message) => !isValidConventionalMessage(message));
}

export function inferIssueLabels(title = '', body = '') {
  const text = `${title}\n${body}`.toLowerCase();
  const labels = [];

  if (/\bbug\b|\berror\b|\bfail(?:ed|ure)?\b|\bcrash\b/.test(text)) {
    labels.push('bug');
  }

  if (/\bfeature\b|\benhancement\b|\brequest\b|\bidea\b/.test(text)) {
    labels.push('enhancement');
  }

  if (/\bdocs?\b|\breadme\b|\bdocumentation\b/.test(text)) {
    labels.push('documentation');
  }

  return labels;
}

export function buildPrFeedback({ title, invalidCommitMessages }) {
  const invalidTitle = !isValidConventionalMessage(title);

  if (!invalidTitle && invalidCommitMessages.length === 0) {
    return null;
  }

  const lines = [
    BOT_MARKER,
    'Hi! I am the Bit maintainer bot. I noticed commit naming issues that can break automated releases.',
    '',
    'Expected format:',
    '- `fix: something` → patch',
    '- `feat: something` → minor',
    '- `feat!: something` → major',
    ''
  ];

  if (invalidTitle) {
    lines.push(`- ❌ PR title is invalid: \`${title}\``);
  }

  if (invalidCommitMessages.length > 0) {
    lines.push('- ❌ Invalid commit messages:');
    invalidCommitMessages.forEach((message) => {
      lines.push(`  - \`${message}\``);
    });
  }

  lines.push('', 'Please rename the title/commits to match the release workflow requirements.');
  return lines.join('\n');
}

export function isSecurityUpdatePullRequest(pullRequest) {
  const title = (pullRequest.title ?? '').toLowerCase();
  const labels = (pullRequest.labels ?? []).map((label) => (label.name ?? '').toLowerCase());
  const author = (pullRequest.user?.login ?? '').toLowerCase();

  const titleLooksSecurity = /\bsecurity\b|\bvulnerability\b|\bcve-\d{4}-\d+/i.test(title);
  const labelLooksSecurity = labels.some((label) => /\bsecurity\b|\bvulnerability\b/.test(label));
  const isDependabotAuthor = author === 'dependabot[bot]';

  return (titleLooksSecurity || labelLooksSecurity) && isDependabotAuthor;
}

export function buildSecurityFixComment() {
  return [
    BOT_MARKER,
    '🔒 This is a Dependabot security update.',
    '',
    '- I approved this pull request automatically.',
    '- I enabled auto-merge so the fix can land after required checks pass.'
  ].join('\n');
}
