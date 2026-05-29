---
name: theme
description: VSP Slides 主题子技能。用于选择、解释、套用或调整 report/tutorial-red/tutorial-red-shtu/tutorial-purple/tutorial-nailong 主题和模板。触发条件：用户问主题、模板、样式、配色、版式、theme。
---

# VSP Slides Theme

负责主题和模板选择，不直接生成完整 PPT。

## 主题选择

- `report`：论文汇报、项目展示、阶段报告
- `tutorial-red`：教学、习题课
- `tutorial-red-shtu`：上科大教学
- `tutorial-purple`：教学或习题课，紫色风格
- `tutorial-nailong`：轻量、活泼、组会或趣味展示

## 流程

1. 根据受众、场景、内容密度推荐主题。
2. 读取对应 `skills/vsp-slides/references/templates/<theme>.md`。
3. 输出该主题的封面、目录、正文、过渡、尾页 class 使用建议。
4. 若用户要应用主题，交给 `generate` 或 `render`。
