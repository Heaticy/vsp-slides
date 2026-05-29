import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from 'playwright'

const VIEWPORT = { width: 1280, height: 720 }

export interface ScreenshotResult {
  totalSlides: number
  screenshots: string[]
  outputDir: string
}

export async function screenshotHtml(
  htmlPath: string,
  outputDir: string,
): Promise<ScreenshotResult> {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize(VIEWPORT)

  const fileUrl = `file://${resolve(htmlPath)}`
  await page.goto(fileUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // Count total slides by reading DOM sections
  const totalSlides = await page.evaluate(() => {
    // Try to find sections that are actual slides
    const sections = document.querySelectorAll('section')
    // Filter out the bespoke container section itself
    return sections.length || 0
  })

  const screenshots: string[] = []

  for (let i = 0; i < totalSlides; i++) {
    // Navigate using keyboard (ArrowRight for next)
    if (i > 0) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(600)
    }

    const screenshotPath = join(outputDir, `slide-${String(i + 1).padStart(2, '0')}.png`)
    await page.screenshot({ path: screenshotPath, type: 'png', fullPage: false })
    screenshots.push(screenshotPath)
  }

  await browser.close()

  return {
    totalSlides,
    screenshots,
    outputDir,
  }
}

export async function getSlideCount(htmlPath: string): Promise<number> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const fileUrl = `file://${resolve(htmlPath)}`
  await page.goto(fileUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  const count = await page.evaluate(() => {
    return document.querySelectorAll('section').length
  })

  await browser.close()
  return count
}
