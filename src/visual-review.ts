export interface VisualReviewResult {
  totalScore: number
  dimensions: {
    layoutHarmony: number // 图文搭配协调度 1-10
    whitespaceQuality: number // 留白合理性 1-10
    fontSizeComfort: number // 字体大小舒适度 1-10
    infoDensity: number // 每页信息量 1-10
    visualConsistency: number // 整体统一性 1-10
  }
  issues: string[]
  perSlideNotes: Array<{ slide: number, note: string }>
}

export function buildVisualReviewPrompt(screenshots: string[], totalSlides: number): string {
  return `你是一个 PPT 视觉排版评审专家。请逐一检查以下 ${totalSlides} 张 PPT 页面的渲染截图。

审阅原则：
- 只能以渲染截图作为视觉判断依据；不要仅凭 Markdown 源码、class 名或预期模板判断排版是否正确。
- 必须使用多模态能力读取每张截图，观察真实画面中的图、文字、留白、遮挡、裁切和清晰度。
- 对所有包含图片的页面，必须判断图片的信息密度、原始宽高比例在当前画面中的表现，以及当前排版给图片分配的尺寸是否足够。
- 图片尺寸决定排版：高信息密度图、流程图、表格、网络结构图、公式图应获得更大的显示面积；低信息密度装饰图可以缩小。宽图优先横向铺展或上下布局，竖图/方图优先左右布局，除非截图显示另一种布局更清晰。

请按以下 5 个维度评分（每项 1-10 分）：

1. **图文搭配协调度**：图片和文字的比例是否合理，位置是否协调
2. **留白合理性**：页面是否过于拥挤或空旷，留白是否恰当
3. **字体大小舒适度**：标题和正文的字号是否合适，层级是否清晰
4. **每页信息量**：每页的信息密度是否适中；图片是否因太小、太密、裁切或压缩导致信息不可读
5. **整体视觉统一性**：所有页面的视觉风格是否统一

请特别关注以下问题：
- 是否有文字或图片越界（超出 1280x720 画布）？
- 是否有图片被拉伸变形？
- 图片是否过小，导致标注、坐标轴、流程箭头、公式、表格文字无法辨认？
- 图片是否过大，挤压正文或导致页面失衡？
- 高信息密度图片是否需要单图大图页、图上文字精简、局部裁切/拆页，或更高的图文比例？
- 横图是否使用了上下布局（rows-2-*）或大图区域，竖图/方图是否使用了左右布局（cols-2-*）？
- 封面是否包含 speaker-meta 信息区域？
- 尾页格式是否正确（lastpage + Thank You + icons）？

每页 note 必须说明：
- 该页是否有图片；若有，图片是高/中/低信息密度。
- 当前图片显示尺寸是否匹配其信息密度和宽高比。
- 如果不匹配，给出具体排版建议，例如增大图占比、拆页、换 rows/cols、裁切局部、改为全宽图、减少旁边文字。

请输出 JSON 格式的评分结果：
\`\`\`json
{
  "totalScore": 85,
  "dimensions": {
    "layoutHarmony": 8,
    "whitespaceQuality": 9,
    "fontSizeComfort": 8,
    "infoDensity": 9,
    "visualConsistency": 8
  },
  "issues": ["第3页高密度流程图过小，箭头和标签不可读", "第7页正文挤压图片"],
  "perSlideNotes": [
    {"slide": 1, "note": "无图片；封面格式正确"},
    {"slide": 2, "note": "有图片，高信息密度；当前尺寸偏小，建议改为全宽图或拆页"},
    ...
  ]
}
\`\`\`

截图文件路径：
${screenshots.map((s, i) => `- 第${i + 1}页: ${s}`).join('\n')}

请依次使用 Read 工具查看每张截图，然后给出完整的评分 JSON。`
}

export function normalizeVisualScore(result: VisualReviewResult): number {
  // Convert 5 dimensions (1-10 each) to 0-100 scale
  const dims = result.dimensions
  const raw = (
    dims.layoutHarmony
    + dims.whitespaceQuality
    + dims.fontSizeComfort
    + dims.infoDensity
    + dims.visualConsistency
  ) / 5
  return Math.round(raw * 10)
}
