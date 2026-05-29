---
name: audit
description: VSP Slides 命名空间子技能。对单个 Marp Markdown/HTML/PPT 产物进行多角色多维度排版审计，输出评分报告和改进路线图。当用户提到 audit、审计 PPT、检查排版质量、audit slides、检查越界/拉伸/漏图时务必使用此 skill。
---

# VSP Slides Audit（audit）

输入一个 Marp 格式的 `.md` 文件，多角色独立评审，输出结构化的评分报告和改进建议。

## 输入

一个 Marp Markdown 文件（含 frontmatter、`<!-- _class: ... -->` 指令、`---` 分页）。

## 审计角色（独立评审，互不干扰）

| 角色 | 职责 | 权重 | 方式 |
|------|------|------|------|
| 🔧 Layout Auditor | 排版合规：越界、拉伸、布局方向、图片尺寸驱动的 cols/rows 比例 | 40% | 硬规则 + Playwright C17 溢出检测 |
| 📋 Content Auditor | 内容完整：封面、目录、过渡、尾页、演讲人信息 | 25% | 硬规则 grep/metric |
| 🎨 Visual Reviewer | 视觉质量：留白、字体、信息密度、图片可读性、图片尺寸是否匹配内容密度 | 20% | subagent 多模态审阅（Playwright 截图 → Read） |
| 📐 Practice Reviewer | 标答相似度：class 分布、结构、页数对标 | 15% | 特征统计 + subagent 主观 |

每个角色独立给出评分和意见，最后综合为最终报告。

## 严重度分级

| 级别 | 含义 | 示例 |
|------|------|------|
| **[Major]** | 阻断性问题，必须修 | 图片渲染失败(-50)、封面缺失(-25)、溢出(-15) |
| **[Minor]** | 影响质量，建议修 | 单目录(-10)、过渡页缺失(-5)、字体偏大 |
| **[Suggestion]** | 可选优化 | 换一种 cols 比例、bq-yellow 用太多 |

## 输出：结构化审计报告

1. **Summary**（2-3 句整体评价）
2. **Strengths**（做得好的方面）
3. **Weaknesses**（标注 `[Major]` / `[Minor]`，每条必须引用具体页面）
4. **Score Breakdown**（4 维度分项得分 + 加权总分）
5. **Improvement Roadmap**（按优先级排序的修改建议 + 预估工作量）
6. **Decision**: Excellent / Good / Acceptable / Needs Revision / Reject
7. **Confidence**: X/5

```markdown
# Audit Report — <filename>

## Summary
整体排版质量良好，cols-first 策略执行到位，图片无拉伸。存在 2 个 Major 问题需修复。

## Score Breakdown
| 维度 | 得分 | 权重 | 加权 |
|------|------|------|------|
| Layout | 92 | 40% | 36.8 |
| Content | 95 | 25% | 23.8 |
| Visual | 85 | 20% | 17.0 |
| Practice | 80 | 15% | 12.0 |
| **Total** | | | **89.6** |

## Weaknesses
### Major
- [ ] **图片渲染失败** [第 5 页]：`img/fig_03.png` 路径不可访问 → 修正路径
### Minor
- [ ] **cols 比例建议** [第 12 页]：改用 cols-2-46 替代 cols-2-64，图占比更高
### Strengths
- ✓ 25/25 图片全覆盖，0 拉伸
- ✓ 双目录 + trans 过渡结构完整

## Improvement Roadmap
1. [Major] 修正 fig_03.png 路径 — 1min
2. [Minor] 第 12 页换 cols-2-46 — 2min

## Decision: Good
## Confidence: 4/5
```

## 一致性检查（始终执行）

- 视觉判断必须以渲染截图为准；Markdown/class 名只能作为辅助定位，不能替代截图证据
- 所有含图页面必须经过多模态截图审阅，判断图中信息密度、可读性、裁切、拉伸、遮挡和实际显示面积
- 图片尺寸必须参与排版判断：高信息密度图应给更大面积或拆页，低信息密度图可压缩；宽高比应决定 rows/cols/全宽图选择
- 硬规则检测 FAIL 的项目，Visual Reviewer 是否也观察到异常
- 各角色评分是否存在矛盾
- 未引用具体页面的意见标记为 `[Insufficient Evidence]`

## 执行流程

输入一个 `.md` → 中间产出一个临时 HTML → 最终输出一份审计报告。

```bash
node --import tsx scripts/audit.ts <slides.md> --practice-ref <practice-dir>/ -o <report.md>
```

可选 `--severity`：`standard`（默认）/ `harsh`（扣分加倍）/ `gentle`（仅 Major）。

流程细节：

1. **渲染为 HTML**（中间产物，临时文件）：尝试 `npx @marp-team/marp-cli` 渲染。若图片路径错误导致渲染失败/图片不显示，自动修正路径重试：按 `.md` 所在目录 → `./img/` → `../img/` → 源文档目录 顺序查找每张图片，找到后更新路径重新渲染。仍失败 → Major
2. **硬规则扫描**：对 `.md` 源码执行 grep/metric 检测
3. **Playwright 截图**（中间产物）：对 HTML 逐页截图 1280x720，检测溢出、图片 404、重叠、拉伸。图片未渲染 → Major -50/张。后续视觉审计必须看这些截图，而不是只看 Markdown。
4. **subagent 多模态审阅**：截图传 subagent（Read 工具），逐页评估视觉和标答相似度。含图页面必须记录图片信息密度（高/中/低）、当前显示尺寸是否足够、宽高比是否适配布局，以及是否需要增大图占比、拆页、裁切局部、改 rows/cols 或改全宽图。
5. **输出审计报告**：最终产物，一份 Markdown 文件

## 关键模块（随 skill 打包）

- `scripts/lib/audit-rules.ts` — 硬规则 + C17 Playwright 溢出
- `scripts/lib/audit-engine.ts` — 加权评分引擎
- `scripts/lib/practice-compare.ts` — 标答特征比对
- `scripts/lib/screenshot.ts` — Playwright 逐页截图
- `scripts/lib/visual-review.ts` / `scripts/lib/content-review.ts` — subagent 审阅 prompt
- `scripts/audit.ts` — CLI 入口
