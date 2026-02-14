# Bit Maintainer Bot

A GitHub bot (Probot app) that helps maintain this repository by:

- Enforcing release-safe commit naming for pull requests:
  - `fix: something` → patch
  - `feat: something` → minor
  - `feat!: something` → major
- Checking both PR title and commit subjects.
- Auto-labeling issues (`bug`, `enhancement`, `documentation`) based on issue text.
- Auto-fixing security updates by approving Dependabot security PRs and enabling auto-merge (after required checks pass).

## 1) Install dependencies

```bash
cd bot
npm install
```

## 2) Configure environment variables

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` with your real values.

- `APP_ID`: GitHub App ID
- `PRIVATE_KEY`: GitHub App private key content (single-line with `\n` escapes)
- `WEBHOOK_SECRET`: same secret configured in the GitHub App webhook settings

## 3) Run locally

```bash
npm run start
```

This starts Probot and loads `src/index.js`.

## 4) Connect GitHub webhooks to local machine (recommended for local testing)

Use [smee.io](https://smee.io):

```bash
npx smee-client --url https://smee.io/<your-channel> --target http://localhost:3000/api/github/webhooks
```

Then set your GitHub App webhook URL to your smee URL.

## 5) Run tests

```bash
npm test
```

## Notes

- The bot reacts to `pull_request` and `issues` events.
- For security auto-fix features (approve + auto-merge), the GitHub App needs pull request write/admin permissions required by those APIs.
