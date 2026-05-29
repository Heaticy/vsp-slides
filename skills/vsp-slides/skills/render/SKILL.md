---
name: render
description: VSP Slides 渲染子技能。将 Marp Markdown 渲染为 HTML/PDF，处理主题 CSS、Marp CLI、输出路径和渲染失败诊断。触发条件：用户说渲染、导出 HTML/PDF、Marp CLI、theme css、render。
---

# VSP Slides Render

将 `.md` 渲染为 HTML/PDF。

## 流程

1. 确认输入 `.md` 存在。
2. 检查主题名称和 CSS 来源。
3. 优先使用项目封装：
   ```bash
   node --import tsx scripts/generate-and-render.ts <input.md> -o <output.html>
   ```
4. 渲染失败时优先检查图片路径、主题 CSS、Marp CLI 依赖。

## 输出

- HTML/PDF 路径
- 渲染日志摘要
- 若失败，给出最小修复步骤

渲染完成后通常进入 `audit`。
