# Contributing

## Development

1. Install dependencies with `pnpm install`.
2. Run `pnpm typecheck` before submitting changes.
3. Run `pnpm lint` when touching TypeScript or Markdown-heavy workflow files.
4. Keep generated output, source slide materials, private runtime state, and local caches out of commits.

## Pull Requests

- Keep changes scoped and explain the user-facing workflow impact.
- Include before/after notes for skill prompt changes.
- For audit or render changes, include the command used to verify the workflow.
- Do not add copyrighted source slides, paper figures, screenshots, or private course materials.

## Skill Changes

When changing a runtime helper under `src/`, also update the corresponding packaged helper under `skills/vsp-slides/skills/*/scripts/` if one exists.
