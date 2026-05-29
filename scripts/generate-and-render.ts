import type { LayoutParams, Scenario, ThemeName } from '../src/types'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createConfig } from '../src/config'
import { generateMarpMarkdown } from '../src/generate-slides'
import { listAvailableThemes, renderMarpFromString } from '../src/render-marp'

function parseArgs(argv: string[]) {
  let inputFile = ''
  let outputFile = '/tmp/vsp-marp-output.html'
  let speakerName = ''
  let speakerEmail = ''
  let title = ''
  let scenario: Scenario = '论文汇报'
  let theme: ThemeName = 'report'
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--speaker':
        speakerName = argv[++i] ?? ''
        break
      case '--email':
        speakerEmail = argv[++i] ?? ''
        break
      case '--title':
        title = argv[++i] ?? ''
        break
      case '--scenario':
        scenario = (argv[++i] ?? '论文汇报') as Scenario
        break
      case '--theme':
        theme = (argv[++i] ?? 'report') as ThemeName
        break
      case '-o':
      case '--output':
        outputFile = argv[++i] ?? outputFile
        break
      default:
        if (!arg.startsWith('-'))
          positionals.push(arg)
        break
    }
  }

  inputFile = positionals[0] ?? ''

  return { inputFile, outputFile, speakerName, speakerEmail, title, scenario, theme }
}

function printUsage() {
  console.log(`
Usage: node --import tsx scripts/generate-and-render.ts <input.md> [options]

Options:
  --speaker <name>    Speaker name (required)
  --email <email>     Speaker email (required)
  --title <title>     PPT title (default: extracted from markdown H1)
  --scenario <type>   论文汇报|课程展示|项目展示|其他 (default: 论文汇报)
  --theme <name>      Marp theme (default: report)
  -o, --output <path> Output HTML path (default: /tmp/vsp-marp-output.html)

Available themes: ${listAvailableThemes().join(', ')}
`)
}

// Main
const args = parseArgs(process.argv.slice(2))

if (!args.inputFile || !args.speakerName || !args.speakerEmail) {
  printUsage()
  process.exit(1)
}

const inputPath = resolve(args.inputFile)
let markdown: string
try {
  markdown = readFileSync(inputPath, 'utf-8')
}
catch (err) {
  console.error(`Failed to read input file: ${inputPath}`, err)
  process.exit(1)
}

// Extract title from H1 if not provided
if (!args.title) {
  const match = markdown.match(/^#\s+(.+)$/m)
  args.title = match?.[1]?.trim() ?? 'Untitled'
}

const config = createConfig({
  speakerName: args.speakerName,
  speakerEmail: args.speakerEmail,
  title: args.title,
  scenario: args.scenario,
  theme: args.theme,
  inputPath,
})

const params: LayoutParams = {
  seed: 0,
  preferredColRatio: '46',
  imageSizeBias: 'normal',
  textDensity: 'normal',
  useToc: 'toc_a',
  useTrans: true,
  captionStyle: 'below',
  listStyle: 'cols2_ul_ci',
}

console.log(`[vsp-marp] Generating Marp markdown...`)
const marpMd = generateMarpMarkdown(markdown, config, params)

const outputPath = resolve(args.outputFile)
console.log(`[vsp-marp] Rendering HTML with theme "${args.theme}"...`)
const baseDir = resolve(inputPath, '..')
const htmlPath = renderMarpFromString(marpMd, outputPath, args.theme, baseDir)

console.log(`[vsp-marp] Done: ${htmlPath}`)
