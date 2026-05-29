---
name: generate
description: VSP Slides 生成子技能。只负责把 Markdown/PDF/讲稿/论文材料重排为符合 VSP Slides 规范的 Marp Markdown，不负责完整流水线。触发条件：用户说只生成 md、生成 Marp Markdown、内容重排、generate。
---

# VSP Slides Generate

把输入材料转换为 `slides.md`。

## 输入

- 源材料
- 已确认的主题、标题、speaker、场景
- 规划结果或用户给出的结构要求

## 生成规则

1. 必须包含 frontmatter、主题、`math: mathjax`。
2. 封面、双目录、章节过渡、总结、尾页结构完整。
3. 图片按实际宽高比选择 cols/rows 布局，不靠文件名猜测。
4. 图片不得同时指定宽高，不得拉伸。
5. 公式保留为 MathJax，不截图替代。
6. 每页 3-6 个要点，复杂内容拆页。

## 参考

按主题读取 `skills/vsp-slides/references/templates/<theme>.md`；需要质量对标时读取相关 `references/practice/<example>/README.md`。

## 输出

- Marp Markdown 文件路径
- 图片引用清单
- 后续建议：通常进入 `render`
