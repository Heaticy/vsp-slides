import { writeFileSync } from 'node:fs'
import type { ScoreEntry } from './types'

export const WEIGHTS = {
  layout: 0.40,
  content: 0.25,
  visual: 0.20,
  similarity: 0.15,
}

export function computeTotal(entry: ScoreEntry): number {
  return Math.round(
    entry.layout * WEIGHTS.layout
    + entry.content * WEIGHTS.content
    + entry.visual * WEIGHTS.visual
    + entry.similarity * WEIGHTS.similarity,
  )
}

export function decisionFromScore(total: number, majorCount: number): string {
  if (total >= 90 && majorCount === 0) return 'Excellent'
  if (total >= 80) return 'Good'
  if (total >= 65) return 'Acceptable'
  if (total >= 50) return 'Needs Revision'
  return 'Reject'
}

export function saveReport(report: string, outputPath: string): void {
  writeFileSync(outputPath, report, 'utf-8')
}
