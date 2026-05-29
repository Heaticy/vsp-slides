---
name: polish
description: VSP Slides 回修子技能。根据审计报告、截图问题或用户反馈修改 Marp Markdown，修复越界、漏图、拉伸、结构缺失、文字过密和主题不一致。触发条件：用户说修改、润色、修一下、根据审计报告改、polish。
---

# VSP Slides Polish

根据反馈回修已有 PPT。

## 输入

- Marp Markdown
- 审计报告、截图或用户反馈
- 可选 HTML/PDF 产物

## 流程

1. 将问题按 Major/Minor/Suggestion 分类。
2. 优先修复 Major：图片失败、越界、拉伸、缺封面/尾页、公式截断。
3. 再修复 Minor：信息密度、cols/rows 比例、过渡页、目录完整性。
4. 修改源 Markdown 后重新运行 `render`。
5. 对关键问题重新运行 `audit`。

## 输出

- 修改摘要
- 重新渲染产物路径
- 剩余风险
