# VSP Slides

English | [中文](#中文)

VSP Slides is a Codex skill bundle and lightweight TypeScript toolchain for planning, generating, rendering, auditing, polishing, and exporting Marp-based slide decks.

## Features

- Codex skill namespace for slide planning, generation, rendering, audit, polish, and export.
- Marp Markdown templates for report and tutorial-style decks.
- Asset checking guidance for missing images and path repair.
- Screenshot-based audit workflow with Playwright.
- Visual audit prompts that require rendered screenshot review, multimodal image-density analysis, and image-size-driven layout decisions.
- Short `vs:*` alias namespace for faster invocation.

## Repository Layout

```text
skills/
  vsp-slides/        Main skill bundle and subskills.
  vs/                Short alias namespace for VSP Slides.
src/                 TypeScript modules used by local CLIs.
scripts/             Local CLI entry points.
README.md            Project overview.
LICENSE              MIT license.
NOTICE.md            Third-party and asset notes.
```

Historical experiment scripts, private pipeline state, source slide materials, generated bundles, local caches, and dependency folders are intentionally excluded.

## Install

```bash
pnpm install
npx playwright install chromium
```

## Commands

```bash
pnpm typecheck
pnpm generate -- <input.md> --speaker "Your Name" --email "you@example.com" -o /tmp/slides.html
pnpm audit -- <workers-dir> --practice-ref skills/vsp-slides/references/practice -o /tmp/audit-report.md
pnpm screenshot -- <slides.html> -o /tmp/vsp-slides-review
```

## Skill Usage

Install or copy `skills/vsp-slides/` into your Codex skills directory, then invoke:

- `vsp-slides:plan`
- `vsp-slides:start`
- `vsp-slides:generate`
- `vsp-slides:render`
- `vsp-slides:audit`
- `vsp-slides:polish`
- `vsp-slides:export`

The `skills/vs/` bundle provides short aliases such as `vs:plan`, `vs:start`, and `vs:audit`.

## Release Boundary

The public repository keeps only the skill source, templates, compact practice references, and local helper scripts. It excludes `sourcemd/`, `.pipeline/`, `.plan-state/`, generated `.skill` archives, and local agent configuration.

## License

MIT. See [LICENSE](LICENSE).

---

# 中文

VSP Slides 是一个 Codex 技能包和轻量 TypeScript 工具链，用于规划、生成、渲染、审计、润色和导出基于 Marp Markdown 的 slides。

## 功能

- 提供 `vsp-slides:*` 技能命名空间，覆盖规划、生成、渲染、审计、润色和导出。
- 提供报告类和教程类 Marp Markdown 模板。
- 提供图片缺失、路径错误和资源检查流程。
- 基于 Playwright 截图进行渲染结果审计。
- 视觉审计要求查看真实渲染截图，并结合多模态能力分析图片信息密度、图片尺寸和排版关系。
- 提供 `vs:*` 短命名空间，便于快速调用。

## 仓库结构

```text
skills/
  vsp-slides/        主技能包和子技能。
  vs/                VSP Slides 的短别名技能包。
src/                 本地 CLI 使用的 TypeScript 模块。
scripts/             本地 CLI 入口。
README.md            项目说明。
LICENSE              MIT 许可证。
NOTICE.md            第三方依赖和素材说明。
```

历史实验脚本、私有流水线状态、源材料、生成包、本地缓存和依赖目录都不进入开源仓库。

## 安装

```bash
pnpm install
npx playwright install chromium
```

## 常用命令

```bash
pnpm typecheck
pnpm generate -- <input.md> --speaker "Your Name" --email "you@example.com" -o /tmp/slides.html
pnpm audit -- <workers-dir> --practice-ref skills/vsp-slides/references/practice -o /tmp/audit-report.md
pnpm screenshot -- <slides.html> -o /tmp/vsp-slides-review
```

## 技能使用

将 `skills/vsp-slides/` 安装或复制到 Codex skills 目录后，可以调用：

- `vsp-slides:plan`
- `vsp-slides:start`
- `vsp-slides:generate`
- `vsp-slides:render`
- `vsp-slides:audit`
- `vsp-slides:polish`
- `vsp-slides:export`

`skills/vs/` 提供短别名，例如 `vs:plan`、`vs:start`、`vs:audit`。

## 发布边界

公开仓库只保留技能源码、模板、精简 practice 参考和本地辅助脚本。不包含 `sourcemd/`、`.pipeline/`、`.plan-state/`、生成的 `.skill` 包和本地 agent 配置。

## 许可证

MIT。见 [LICENSE](LICENSE)。
