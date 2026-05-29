import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface PracticeFeatures {
  classUsage: Record<string, number> // class名称 → 使用次数
  colRatios: Record<string, number> // cols比例 → 次数
  totalSlides: number
  hasCover: boolean
  hasLastpage: boolean
  hasToc: boolean
  hasTrans: boolean
}

export function extractFeatures(mdContent: string): PracticeFeatures {
  const features: PracticeFeatures = {
    classUsage: {},
    colRatios: {},
    totalSlides: (mdContent.match(/^---$/gm) || []).length + 1,
    hasCover: /cover_[a-z]/.test(mdContent),
    hasLastpage: /lastpage/.test(mdContent),
    hasToc: /toc_[a-z]/.test(mdContent),
    hasTrans: /<!-- _class:\s*trans\s*-->/.test(mdContent),
  }

  // Count class usage
  const classMatches = mdContent.matchAll(/<!-- _class:\s*(\S+)\s*-->/g)
  for (const m of classMatches) {
    const cls = m[1]
    features.classUsage[cls] = (features.classUsage[cls] || 0) + 1
  }

  // Count col ratios
  const colMatches = mdContent.matchAll(/cols-2-(\d+)/g)
  for (const m of colMatches) {
    const ratio = m[1]
    features.colRatios[ratio] = (features.colRatios[ratio] || 0) + 1
  }

  return features
}

export function extractReferenceFeatures(practiceDir: string): PracticeFeatures[] {
  const features: PracticeFeatures[] = []
  if (!existsSync(practiceDir))
    return features

  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      }
      else if (entry.name.endsWith('.md') && !entry.name.includes('flat')) {
        try {
          const content = readFileSync(fullPath, 'utf-8')
          if (content.includes('marp: true')) {
            features.push(extractFeatures(content))
          }
        }
        catch { /* skip */ }
      }
    }
  }

  walk(practiceDir)
  return features
}

export function compareWithReference(
  targetMd: string,
  practiceDir: string,
): { score: number, similarity: number, notes: string[] } {
  const targetFeatures = extractFeatures(targetMd)
  const refFeatures = extractReferenceFeatures(practiceDir)

  if (refFeatures.length === 0) {
    return { score: 70, similarity: 70, notes: ['无参考数据，默认评分70'] }
  }

  // Compare target against each reference, take best match
  let bestSimilarity = 0

  for (const ref of refFeatures) {
    let sim = 0
    let totalChecks = 0

    // Slide count similarity
    const slideRatio = Math.min(targetFeatures.totalSlides, ref.totalSlides)
      / Math.max(targetFeatures.totalSlides, ref.totalSlides)
    sim += slideRatio * 20
    totalChecks += 20

    // Structural features
    if (targetFeatures.hasCover === ref.hasCover) { sim += 15; totalChecks += 15 }
    if (targetFeatures.hasLastpage === ref.hasLastpage) { sim += 15; totalChecks += 15 }
    if (targetFeatures.hasToc === ref.hasToc) { sim += 10; totalChecks += 10 }
    if (targetFeatures.hasTrans === ref.hasTrans) { sim += 10; totalChecks += 10 }

    // Col ratio distribution similarity (simplified)
    const allRatios = new Set([...Object.keys(targetFeatures.colRatios), ...Object.keys(ref.colRatios)])
    let ratioSim = 0
    for (const ratio of allRatios) {
      const t = targetFeatures.colRatios[ratio] || 0
      const r = ref.colRatios[ratio] || 0
      const max = Math.max(t, r)
      if (max > 0)
        ratioSim += (1 - Math.abs(t - r) / max) * (30 / allRatios.size)
    }
    sim += ratioSim
    totalChecks += 30

    const similarity = totalChecks > 0 ? Math.round((sim / totalChecks) * 100) : 70
    if (similarity > bestSimilarity)
      bestSimilarity = similarity
  }

  const notes: string[] = []
  if (bestSimilarity >= 80)
    notes.push('与 practice 参考高度相似')
  else if (bestSimilarity >= 60)
    notes.push('与 practice 参考结构接近')
  else notes.push('与 practice 参考结构差异较大')

  return { score: bestSimilarity, similarity: bestSimilarity, notes }
}
