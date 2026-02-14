import {
  BOT_MARKER,
  buildPrFeedback,
  buildSecurityFixComment,
  findInvalidMessages,
  inferIssueLabels,
  isSecurityUpdatePullRequest
} from './rules.js';

async function upsertBotComment(github, params, body) {
  const comments = await github.paginate(github.rest.issues.listComments, params);
  const existing = comments.find((comment) => comment.body?.includes(BOT_MARKER));

  if (!body && existing) {
    await github.rest.issues.deleteComment({
      owner: params.owner,
      repo: params.repo,
      comment_id: existing.id
    });
    return;
  }

  if (!body) {
    return;
  }

  if (existing) {
    await github.rest.issues.updateComment({
      owner: params.owner,
      repo: params.repo,
      comment_id: existing.id,
      body
    });
    return;
  }

  await github.rest.issues.createComment({
    ...params,
    body
  });
}

async function handleSecurityAutoFix(context) {
  const pullRequest = context.payload.pull_request;
  if (!isSecurityUpdatePullRequest(pullRequest)) {
    return;
  }

  const { owner, repo } = context.repo();
  const pull_number = pullRequest.number;

  try {
    await context.octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number,
      event: 'APPROVE',
      body: 'Auto-approved by Bit maintainer bot for Dependabot security update.'
    });

    await context.octokit.graphql(
      `mutation EnableAutoMerge($pullRequestId: ID!) {
        enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: SQUASH }) {
          pullRequest { id number }
        }
      }`,
      { pullRequestId: pullRequest.node_id }
    );

    await upsertBotComment(context.octokit, { owner, repo, issue_number: pull_number }, buildSecurityFixComment());
  } catch (error) {
    context.log.warn({ err: error, pull_number }, 'Unable to auto-approve or auto-merge security update PR.');
  }
}

export default (app) => {
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async (context) => {
    const { owner, repo } = context.repo();
    const pull_number = context.payload.pull_request.number;

    const commits = await context.octokit.paginate(context.octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number,
      per_page: 100
    });

    const commitMessages = commits.map((commit) => commit.commit.message.split('\n')[0]);
    const invalidCommitMessages = findInvalidMessages(commitMessages);

    const feedback = buildPrFeedback({
      title: context.payload.pull_request.title,
      invalidCommitMessages
    });

    await upsertBotComment(context.octokit, { owner, repo, issue_number: pull_number }, feedback);
    await handleSecurityAutoFix(context);
  });

  app.on('issues.opened', async (context) => {
    const labels = inferIssueLabels(context.payload.issue.title, context.payload.issue.body ?? '');
    if (labels.length === 0) {
      return;
    }

    await context.octokit.rest.issues.addLabels({
      ...context.repo(),
      issue_number: context.payload.issue.number,
      labels
    });
  });
};
