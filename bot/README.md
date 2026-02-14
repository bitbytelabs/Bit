# Bit Maintainer Bot

A GitHub bot (Probot app) that helps maintain this repository by:

- Enforcing release-safe commit naming for pull requests:
  - `fix: something` → patch
  - `feat: something` → minor
  - `feat!: something` → major
- Checking both PR title and commit subjects.
- Auto-labeling issues (`bug`, `enhancement`, `documentation`) based on issue text.

## Run locally

```bash
cd bot
npm install
npm test
```

To run as a Probot app, wire this folder into your preferred Probot runtime/deployment.
