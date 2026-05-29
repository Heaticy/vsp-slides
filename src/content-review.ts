export interface ContentReviewResult {
  totalScore: number
  dimensions: {
    coverCompleteness: number // 封面完整度 1-10
    tocPresence: number // 目录存在性 1-10
    sectionStructure: number // 章节结构 1-10
    lastpageCorrectness: number // 尾页正确性 1-10
    contentIntegrity: number // 内容完整性 1-10
  }
  missing: string[]
  notes: string[]
}

export function buildContentReviewPrompt(htmlContent: string): string {
  const truncated = htmlContent.length > 8000
    ? `${htmlContent.substring(0, 8000)}\n...(truncated)`
    : htmlContent

  return `你是一个 PPT 内容结构评审专家。请检查以下 Marp PPT 的 HTML 源码，从内容角度评分。

请按以下 5 个维度评分（每项 1-10 分）：

1. **封面完整度**：封面是否包含标题、演讲人信息（speaker-meta）、是否有 cover_b 或 cover_e class
2. **目录存在性**：是否有目录页（toc_a 或 toc_b class）
3. **章节结构**：是否有章节过渡页（trans class），标题层级是否清晰
4. **尾页正确性**：尾页是否有 lastpage class、Thank You 标题、icons 区域
5. **内容完整性**：原始文档的关键内容是否都被覆盖，是否有缺失

请特别检查：
- 封面是否有 speaker-meta div？
- 是否有 cover_b 或 cover_e class？
- 尾页格式是否完整（lastpage + Thank You + icons）？
- 是否出现内容缺失或明显遗漏？

HTML 源码：
\`\`\`html
${truncated}
\`\`\`

请输出 JSON 格式：
\`\`\`json
{
  "totalScore": 90,
  "dimensions": {
    "coverCompleteness": 10,
    "tocPresence": 9,
    "sectionStructure": 8,
    "lastpageCorrectness": 10,
    "contentIntegrity": 8
  },
  "missing": ["缺少章节过渡页"],
  "notes": ["封面格式正确", "目录完整", "建议增加2-3个过渡页"]
}
\`\`\``
}

export function normalizeContentScore(result: ContentReviewResult): number {
  const dims = result.dimensions
  const raw = (
    dims.coverCompleteness
    + dims.tocPresence
    + dims.sectionStructure
    + dims.lastpageCorrectness
    + dims.contentIntegrity
  ) / 5
  return Math.round(raw * 10)
}
