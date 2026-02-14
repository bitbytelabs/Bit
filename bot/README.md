# Mergify-like Bot Setup

This repository uses a custom Mergify-like bot implemented in `bot/mergify-bot.mjs`.

## Config file

The bot reads settings from:

- `bot/.mergify.yml`

Current keys:

- `required_approvals` (number): minimum approvals needed.
- `ready_label` (string): label to apply when PR is ready.
- `merge_method` (string): merge strategy (`squash`, `merge`, `rebase`).
- `require_combined_status_success` (boolean): require combined status to be `success`.

## How to make it work

1. Ensure GitHub Actions are enabled on the repository.
2. Ensure branch protection allows auto-merge by `GITHUB_TOKEN`.
3. Keep `.github/workflows/mergify-bot.yml` enabled.
4. Open/update a PR and get at least the configured number of approvals.
5. Make sure checks are green.

When conditions pass, the bot will add the ready label and merge the PR.
