# Release Checklist

## Preflight

```bash
pnpm install
pnpm typecheck
pnpm lint
git status --short
```

Confirm the release does not include:

- `sourcemd/`
- `.pipeline/`
- `.plan-state/`
- `.claude/`
- `.codex`
- `node_modules/`
- `.marp-cache/`
- generated `*.skill` bundles

## GitHub

```bash
git remote add origin git@github.com:Heaticy/vsp-slides.git
git push -u origin master
git tag v1.0.0
git push origin v1.0.0
```

## GitLab

```bash
git remote add gitlab git@gitlab.vsplab.cn:lichf/vsp-slides.git
git push -u gitlab master
git push gitlab v1.0.0
```

If a remote already exists, update it with `git remote set-url`.

## Release Notes

Use the `CHANGELOG.md` entry for the GitHub/GitLab release description and mention that private source materials are excluded from the public repository.
