import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { buildContentReviewPrompt } from '../src/content-review'
import { screenshotHtml } from '../src/screenshot'
import { buildVisualReviewPrompt } from '../src/visual-review'

function parseArgs(argv: string[]) {
  let inputHtml = ''
  let outputDir = '/tmp/vsp-marp-review/'
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '-o':
      case '--output':
        outputDir = argv[++i] ?? outputDir
        break
      default:
        if (!arg.startsWith('-'))
          positionals.push(arg)
        break
    }
  }

  inputHtml = positionals[0] ?? ''
  return { inputHtml, outputDir }
}

function printUsage() {
  console.log(`
Usage: node --import tsx scripts/screenshot-and-review.ts <input.html> [options]

Options:
  -o, --output <dir>  Output directory for screenshots and review (default: /tmp/vsp-marp-review/)
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.inputHtml) {
    printUsage()
    process.exit(1)
  }

  const inputPath = resolve(args.inputHtml)
  if (!existsSync(inputPath)) {
    console.error(`Input HTML not found: ${inputPath}`)
    process.exit(1)
  }

  if (!existsSync(args.outputDir)) {
    mkdirSync(args.outputDir, { recursive: true })
  }

  const baseName = basename(inputPath, '.html')

  // Step 1: Screenshot
  console.log(`[screenshot] Capturing screenshots from ${inputPath}...`)
  const screenshotDir = resolve(args.outputDir, `${baseName}-screenshots`)
  const result = await screenshotHtml(inputPath, screenshotDir)

  console.log(`[screenshot] ${result.totalSlides} slides captured to ${screenshotDir}`)

  // Step 2: Build review prompts
  const visualPrompt = buildVisualReviewPrompt(result.screenshots, result.totalSlides)
  const visualPromptPath = resolve(args.outputDir, `${baseName}-visual-review-prompt.md`)
  writeFileSync(visualPromptPath, visualPrompt, 'utf-8')
  console.log(`[review] Visual review prompt saved to ${visualPromptPath}`)

  // Read HTML for content review
  const htmlContent = readFileSync(inputPath, 'utf-8')
  const contentPrompt = buildContentReviewPrompt(htmlContent)
  const contentPromptPath = resolve(args.outputDir, `${baseName}-content-review-prompt.md`)
  writeFileSync(contentPromptPath, contentPrompt, 'utf-8')
  console.log(`[review] Content review prompt saved to ${contentPromptPath}`)

  // Step 3: Output summary
  const summary = {
    inputHtml: inputPath,
    totalSlides: result.totalSlides,
    screenshotDir,
    visualReviewPrompt: visualPromptPath,
    contentReviewPrompt: contentPromptPath,
    instructions: [
      '将 visual-review-prompt.md 的内容发送给 subagent 做视觉审阅',
      '将 content-review-prompt.md 的内容发送给 subagent 做内容审阅',
      'subagent 使用 Read 工具查看截图（传文件路径即可）',
      '将返回的 JSON 结果保存到同目录下的 visual-result.json 和 content-result.json',
    ],
  }

  const summaryPath = resolve(args.outputDir, `${baseName}-review-summary.json`)
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`[review] Summary saved to ${summaryPath}`)
  console.log('[review] Done.')
}

main().catch((err) => {
  console.error('screenshot-and-review failed:', err)
  process.exit(1)
})
