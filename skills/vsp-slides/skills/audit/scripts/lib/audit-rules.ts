import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const CANVAS_W = 1280
const CANVAS_H = 720

export interface HardRuleResult {
  score: number
  maxScore: number
  deductions: Array<{ rule: string, points: number, detail: string }>
  passed: string[]
}

// -- Layout Compliance (40% weight, max 100) --

export function auditLayoutCompliance(markdownPath: string, htmlPath: string): HardRuleResult {
  const result: HardRuleResult = { score: 100, maxScore: 100, deductions: [], passed: [] }
  let mdContent = ''
  try { mdContent = readFileSync(markdownPath, 'utf-8') }
  catch { /* ignore */ }
  let htmlContent = ''
  try { htmlContent = readFileSync(htmlPath, 'utf-8') }
  catch { /* ignore */ }

  // Check 1: Image stretch detection (w and h both specified)
  const stretchMatches = mdContent.match(/!\[.*\]\([^)]+\)/g) || []
  for (const imgTag of stretchMatches) {
    const hasW = /\bw:\d+px\b/.test(imgTag) || /\bw:["\d]/.test(imgTag)
    const hasH = /\bh:\d+px\b/.test(imgTag) || /\bh:["\d]/.test(imgTag)
    if (hasW && hasH) {
      result.deductions.push({ rule: 'image-stretch', points: -10, detail: `图片同时指定w和h: ${imgTag.substring(0, 60)}` })
      result.score -= 10
    }
  }
  if (result.deductions.filter(d => d.rule === 'image-stretch').length === 0) {
    result.passed.push('无图片拉伸')
  }

  // Check 2: Layout class usage
  const hasCols2 = /<!-- _class:\s*cols-2/.test(mdContent)
  const hasRows2 = /<!-- _class:\s*rows-2/.test(mdContent)
  if (hasCols2)
    result.passed.push('使用了cols分栏')
  if (hasRows2)
    result.passed.push('使用了rows分栏')
  if (!hasCols2 && !hasRows2) {
    result.deductions.push({ rule: 'no-layout-class', points: -5, detail: '未使用任何分栏布局 class' })
    result.score -= 5
  }

  // Check 3: Cover class
  const hasCover = /<!-- _class:\s*(cover_[a-z])/.test(mdContent)
  if (hasCover) {
    result.passed.push('有封面class')
  }
  else {
    result.deductions.push({ rule: 'no-cover', points: -25, detail: '缺少封面 class (cover_b/cover_e)' })
    result.score -= 25
  }

  // Check 4: Speaker meta
  const hasSpeakerMeta = mdContent.includes('speaker-meta')
  if (hasSpeakerMeta) {
    result.passed.push('有speaker-meta')
  }
  else {
    result.deductions.push({ rule: 'no-speaker-meta', points: -10, detail: '封面缺少 speaker-meta' })
    result.score -= 10
  }

  // Check 5: Last page
  const hasLastpage = mdContent.includes('lastpage')
  if (hasLastpage) {
    result.passed.push('有尾页lastpage')
  }
  else {
    result.deductions.push({ rule: 'no-lastpage', points: -25, detail: '缺少尾页 lastpage class' })
    result.score -= 25
  }

  // Check 6: Last page format
  if (hasLastpage) {
    const hasThankYou = mdContent.includes('Thank You')
    const hasIcons = mdContent.includes('class="icons"') || mdContent.includes('class="icons"'.replace(/"/g, '"'))
    if (!hasThankYou) {
      result.deductions.push({ rule: 'no-thank-you', points: -5, detail: '尾页缺少 Thank You' })
      result.score -= 5
    }
    if (!hasIcons) {
      result.deductions.push({ rule: 'no-icons', points: -5, detail: '尾页缺少 icons 区域' })
      result.score -= 5
    }
  }

  // Check 7: Image without size in img containers
  const imgInContainer = mdContent.match(/<div class="[^"]*img[^"]*">[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*!\[.*\]\(([^)]+)\)/g) || []
  for (const match of imgInContainer) {
    if (/\b[wh]:\d+px\b/.test(match)) {
      result.deductions.push({ rule: 'sized-in-img-container', points: -5, detail: `img容器内图片带尺寸: ${match.substring(0, 60)}` })
      result.score -= 5
    }
  }

  return result
}

// -- Content Completeness (25% weight, max 100) --

export function auditContentCompleteness(markdownPath: string, htmlPath: string): HardRuleResult {
  const result: HardRuleResult = { score: 100, maxScore: 100, deductions: [], passed: [] }
  let mdContent = ''
  try { mdContent = readFileSync(markdownPath, 'utf-8') }
  catch { return result }
  let htmlContent = ''
  try { htmlContent = readFileSync(htmlPath, 'utf-8') }
  catch { /* ignore */ }

  // Cover page
  const hasCover = /cover_[a-z]/.test(mdContent)
  if (hasCover) {
    result.passed.push('封面完整')
  }
  else { result.deductions.push({ rule: 'missing-cover', points: -25, detail: '缺少封面' }); result.score -= 25 }

  // TOC
  const hasToc = /toc_[a-z]/.test(mdContent)
  if (hasToc) {
    result.passed.push('有目录页')
  }
  else { result.deductions.push({ rule: 'missing-toc', points: -10, detail: '缺少目录页' }); result.score -= 10 }

  // Trans pages
  const transCount = (mdContent.match(/<!-- _class:\s*trans\s*-->/g) || []).length
  if (transCount > 0)
    result.passed.push(`${transCount}个过渡页`)
  // No deduction for missing trans (optional)

  // Lastpage
  const hasLastpage = mdContent.includes('lastpage')
  if (hasLastpage) {
    result.passed.push('尾页完整')
  }
  else { result.deductions.push({ rule: 'missing-lastpage', points: -25, detail: '缺少尾页' }); result.score -= 25 }

  // Section count
  const sectionCount = (mdContent.match(/^##\s+(?:\S.*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF])$/gm) || []).length
  if (sectionCount >= 3) {
    result.passed.push(`${sectionCount}个章节`)
  }
  else { result.deductions.push({ rule: 'few-sections', points: -10, detail: `章节过少(${sectionCount})` }); result.score -= 10 }

  // Slide count from HTML
  const slideCount = (htmlContent.match(/<section[^>]*>/g) || []).length
  if (slideCount >= 5) {
    result.passed.push(`${slideCount}页PPT`)
  }
  else { result.deductions.push({ rule: 'few-slides', points: -10, detail: `页数过少(${slideCount})` }); result.score -= 10 }

  return result
}

// -- Real Overflow Detection (C17) via Playwright Bounding Rect --

export interface OverflowResult {
  totalSlides: number
  overflowSlides: number[]
  maxOverflowPx: number
  perSlide: Array<{ slide: number, bottomPx: number, overflowPx: number, status: 'ok' | 'review' | 'fail' }>
}

export async function auditOverflowReal(htmlPath: string): Promise<OverflowResult> {
  const { resolve } = await import('node:path')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: CANVAS_W, height: CANVAS_H })

  const fileUrl = `file://${resolve(htmlPath)}`
  await page.goto(fileUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  const totalSlides = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section')).length
  })

  const perSlide: OverflowResult['perSlide'] = []
  const overflowSlides: number[] = []

  for (let i = 0; i < totalSlides; i++) {
    if (i > 0) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(500)
    }

    const bounds = await page.evaluate((canvasH) => {
      const allElements = Array.from(document.querySelectorAll('section *'))
      let maxBottom = 0
      for (const el of allElements) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom > maxBottom && rect.bottom > 0)
          maxBottom = rect.bottom
      }
      const sections = document.querySelectorAll('section')
      if (sections.length > 0) {
        const sb = sections[sections.length - 1].getBoundingClientRect().bottom
        if (sb > maxBottom)
          maxBottom = sb
      }
      return { maxBottom }
    }, CANVAS_H)

    const bottomPx = Math.round(bounds.maxBottom)
    const overflowPx = Math.max(0, bottomPx - CANVAS_H)
    let status: 'ok' | 'review' | 'fail' = 'ok'

    if (overflowPx > 50) {
      status = 'fail'
      overflowSlides.push(i + 1)
    }
    else if (overflowPx > 10) {
      status = 'review'
    }

    perSlide.push({ slide: i + 1, bottomPx, overflowPx, status })
  }

  await browser.close()

  return {
    totalSlides,
    overflowSlides,
    maxOverflowPx: Math.max(...perSlide.map(s => s.overflowPx)),
    perSlide,
  }
}
