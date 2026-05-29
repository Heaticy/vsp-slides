---
name: vsp-slides
description: VSP Slides 技能组总入口。将 Markdown、PDF、讲稿、论文、课程材料或项目材料转换为符合 VSP Slides 规范的 PPT，并按意图路由到 plan、start、resume、generate、render、audit、theme、assets、export、polish。触发条件：用户要求做 PPT、生成 slides、Marp 排版、论文汇报、课程展示、项目展示、组会汇报，或提到 vsp-slides 命名空间命令。
---

# VSP Slides

VSP Slides 是 PPT 生成与审计技能组。此 skill 是总入口，只负责判断意图并加载对应子 skill。

## 子 Skill 路由

| 子 skill | 触发意图 | 职责 |
|---|---|---|
| `plan` | 先规划、设计结构、确定参数、做方案 | 分析输入材料，给出主题、页数、章节、图片策略和执行计划 |
| `start` | 开始、执行、做完整 PPT | 串联 plan/assets/generate/render/audit/polish/export 完整流程 |
| `resume` | 继续、恢复、接着上次、从失败处继续 | 识别已有产物和断点，选择下一个子 skill 继续 |
| `generate` | 只生成 Marp Markdown、不渲染 | 将输入材料重排为 `slides.md` |
| `render` | 渲染 HTML/PDF、主题 CSS、Marp CLI | 将 Marp Markdown 渲染为 HTML/PDF |
| `audit` | 审计、检查排版、越界、漏图、拉伸 | 对 Markdown/HTML/PPT 产物评分并输出改进路线图 |
| `theme` | 选主题、对齐模板、主题配置 | 选择和应用 report/tutorial 主题与模板 |
| `assets` | 图片路径、资源收集、缺图、漏图 | 收集图片资源，修复路径，检查可访问性 |
| `export` | 最终导出、归档、命名、交付 | 整理最终 HTML/PDF/Markdown 和报告 |
| `polish` | 根据反馈或审计报告回修 | 修改 Marp Markdown 并重新验证关键问题 |

当用户没有显式命名子 skill 时：

- 参数不完整或只想先讨论方案：加载 `plan`
- 用户说“开始/执行/生成完整 PPT”：加载 `start`
- 用户说“继续/恢复/resume”：加载 `resume`
- 用户要求只产出 Markdown：加载 `generate`
- 用户已有 `.md` 并要求渲染：加载 `render`
- 用户要求检查质量：加载 `audit`
- 用户提到主题、模板或样式：加载 `theme`
- 用户提到图片、资源、路径、漏图：加载 `assets`
- 用户要求最终交付或打包：加载 `export`
- 用户要求按反馈修改：加载 `polish`

## 共享参考

所有子 skill 可以按需读取本目录下的共享参考：

- `references/templates/*.md`：标准主题模板
- `references/practice/<example>/README.md`：高质量实践样例

优先读取与当前任务直接相关的单个参考文件，避免一次性加载全部资料。
