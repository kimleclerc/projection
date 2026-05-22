# AI Delegation Notes

This project can use NVIDIA NIM as a low-cost external consultant for coding-adjacent work.

## Available Tool

Use the local helper:

```bash
source .env.local
node tools/nvidia-delegate.mjs qwen "your prompt"
```

If the key is stored in the home directory instead:

```bash
source ~/.env.local
node tools/nvidia-delegate.mjs qwen "your prompt"
```

Do not print, inspect, commit, or paste the API key. `.env` and `.env.*` are ignored by git.

## Validated Model

The working default is:

```text
qwen/qwen3-coder-480b-a35b-instruct
```

Validated smoke test:

```bash
node tools/nvidia-delegate.mjs qwen "Tu es connecté? Réponds en une phrase courte."
```

Expected behavior: the model answers normally. MiniMax was observed hanging during the first smoke test, so prefer Qwen until retested.

## Recommended Uses

Use NVIDIA for delegation, not final authority:

- code review of diffs and components;
- accessibility or CSS audits;
- Astro/Vite error analysis;
- translation drafts, especially ES/FR/EN;
- summarizing large files or logs;
- drafting implementation plans or prompts for Claude/Codex.

Do not let NVIDIA directly modify the repo. Codex or Claude should inspect the output, decide what is actually correct, and apply changes locally.

## Handy Commands

Review a diff:

```bash
git diff -- src/layouts/Base.astro > scratch/tmp/nvidia-review.diff
node tools/nvidia-delegate.mjs qwen --file scratch/tmp/nvidia-review.diff
```

Use a prompt file:

```bash
node tools/nvidia-delegate.mjs qwen --file scratch/tmp/prompt.txt
```

Override the model temporarily:

```bash
NVIDIA_MODEL="qwen/qwen2.5-coder-32b-instruct" node tools/nvidia-delegate.mjs qwen "quick review"
```
