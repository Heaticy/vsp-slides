---
name: start
description: VSP Slides 启动子技能。用于从已确认计划或用户输入开始执行完整 PPT 生成流程，串联 assets、generate、render、audit、polish、export。触发条件：用户说开始、执行、生成完整 PPT、做这个 PPT、start pipeline、start。
---

# VSP Slides Start

启动完整生成流程。`start` 是编排入口，不替代底层能力模块。

## 前置检查

1. 如果没有明确计划，先加载 `plan`。
2. 确认必要参数：输入路径、标题、speaker 姓名和邮箱、场景、主题、输出目录。
3. 确认是否需要最终审计和导出格式。

## 编排流程

1. `assets`：检查图片、公式、附件路径和缺失资源。
2. `generate`：生成 Marp Markdown。
3. `render`：渲染 HTML，必要时导出 PDF。
4. `audit`：检查排版、漏图、拉伸、越界、结构完整性。
5. 若审计出现 Major：进入 `polish` 回修并重新渲染/审计。
6. `export`：整理最终产物。

## 状态记录

每次执行应记录：

- 输入文件和输出目录
- 当前阶段
- 生成的 Markdown/HTML/PDF 路径
- 审计报告路径
- 下一步建议

如果中断，后续由 `resume` 根据这些产物继续。
