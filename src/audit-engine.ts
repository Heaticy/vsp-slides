import type { ScoreEntry } from './types'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { auditContentCompleteness, auditLayoutCompliance, auditOverflowReal } from './audit-rules'

const WEIGHTS = {
  layout: 0.40, // 排版合规
  content: 0.25, // 内容完整
  visual: 0.20, // 视觉信息密度
  similarity: 0.15, // practice 相似度
}

export interface WorkerDir {
  name: string
  path: string
  mdFile: string
  htmlFile: string
}

export function discoverWorkerDirs(baseDir: string): WorkerDir[] {
  const workers: WorkerDir[] = []
  if (!existsSync(baseDir))
    return workers

  const entries = readdirSync(baseDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory() && /^[wg]\d+$/.test(entry.name)) {
      const dir = join(baseDir, entry.name)
      workers.push({
        name: entry.name,
        path: dir,
        mdFile: join(dir, 'slides.md'),
        htmlFile: join(dir, 'output.html'),
      })
    }
  }

  return workers.sort((a, b) => a.name.localeCompare(b.name))
}

export async function auditWorker(
  worker: WorkerDir,
  visualScore: number = 0,
  similarityScore: number = 0,
): Promise<ScoreEntry> {
  const notes: string[] = []

  // Hard rule checks
  const layoutResult = auditLayoutCompliance(worker.mdFile, worker.htmlFile)
  const contentResult = auditContentCompleteness(worker.mdFile, worker.htmlFile)

  // C17: Real overflow detection via Playwright
  let overflowResult = null
  try {
    overflowResult = await auditOverflowReal(worker.htmlFile)
    if (overflowResult.overflowSlides.length > 0) {
      for (const slideNum of overflowResult.overflowSlides) {
        layoutResult.deductions.push({
          rule: 'overflow-c17',
          points: -15,
          detail: `第${slideNum}页内容溢出画布 (超出${overflowResult.perSlide[slideNum - 1]?.overflowPx ?? 0}px)`,
        })
        layoutResult.score -= 15
      }
    }
    else {
      layoutResult.passed.push(`渲染检测通过: ${overflowResult.totalSlides}页无溢出`)
    }
  }
  catch (err) {
    notes.push(`[警告] 溢出检测失败: ${err}`)
  }

  // Collect notes
  for (const d of layoutResult.deductions) notes.push(`[排版] ${d.detail}`)
  for (const d of contentResult.deductions) notes.push(`[内容] ${d.detail}`)
  for (const p of layoutResult.passed) notes.push(`[通过] ${p}`)
  for (const p of contentResult.passed) notes.push(`[通过] ${p}`)

  const layoutScore = Math.max(0, layoutResult.score)
  const contentScore = Math.max(0, contentResult.score)

  const total = Math.round(
    layoutScore * WEIGHTS.layout
    + contentScore * WEIGHTS.content
    + visualScore * WEIGHTS.visual
    + similarityScore * WEIGHTS.similarity,
  )

  return {
    worker: worker.name,
    layout: layoutScore,
    content: contentScore,
    visual: visualScore,
    similarity: similarityScore,
    total,
    notes,
  }
}

export async function auditAllWorkers(
  workers: WorkerDir[],
  visualScores: Record<string, number> = {},
  similarityScores: Record<string, number> = {},
): Promise<ScoreEntry[]> {
  const results = await Promise.all(
    workers.map(w => auditWorker(w, visualScores[w.name] ?? 70, similarityScores[w.name] ?? 70)),
  )
  return results.sort((a, b) => b.total - a.total)
}

export function generateAuditReport(
  rankings: ScoreEntry[],
  round: number,
  elapsed: number = 0,
): string {
  const lines = [
    `# Audit Report — Round ${round}`,
    '',
    `| 排名 | Worker | 排版(40%) | 内容(25%) | 视觉(20%) | 相似度(15%) | 总分 |`,
    `|------|--------|-----------|-----------|-----------|-------------|------|`,
  ]

  for (let i = 0; i < rankings.length; i++) {
    const r = rankings[i]
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
    lines.push(
      `| ${medal} | ${r.worker} | ${r.layout} | ${r.content} | ${r.visual} | ${r.similarity} | **${r.total}** |`,
    )
  }

  lines.push('')
  lines.push('## 最优 PPT')
  const best = rankings[0]
  if (best) {
    lines.push(`- **Worker**: ${best.worker}`)
    lines.push(`- **总分**: ${best.total}`)
    lines.push(`- **亮点**: ${best.notes.filter(n => n.startsWith('[通过]')).join(', ') || '无'}`)
    lines.push(`- **待改进**: ${best.notes.filter(n => !n.startsWith('[通过]')).join(', ') || '无'}`)
  }

  if (elapsed > 0) {
    lines.push('')
    lines.push(`*审计耗时: ${(elapsed / 1000).toFixed(1)}s*`)
  }

  return lines.join('\n')
}

export function saveAuditReport(
  report: string,
  outputPath: string,
) {
  writeFileSync(outputPath, report, 'utf-8')
}
