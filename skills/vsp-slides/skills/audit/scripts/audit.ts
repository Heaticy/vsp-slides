import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { auditContentCompleteness, auditLayoutCompliance } from './lib/audit-rules'
import { compareWithReference } from './lib/practice-compare'

function parseArgs(argv: string[]) {
  let inputFile = ''
  let practiceRef = ''
  let outputPath = ''
  let severity: 'gentle' | 'standard' | 'harsh' = 'standard'
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--practice-ref':
        practiceRef = argv[++i] ?? ''
        break
      case '--severity':
        severity = (argv[++i] ?? 'standard') as 'gentle' | 'standard' | 'harsh'
        break
      case '-o':
      case '--output':
        outputPath = argv[++i] ?? ''
        break
      default:
        if (!arg.startsWith('-'))
          positionals.push(arg)
        break
    }
  }

  inputFile = positionals[0] ?? ''
  if (!outputPath) {
    const base = inputFile.replace(/\.md$/, '')
    outputPath = `${base}-audit-report.md`
  }
  return { inputFile, practiceRef, outputPath, severity }
}

function printUsage() {
  console.log(`
Usage: node --import tsx scripts/audit.ts <slides.md> [options]

Options:
  --practice-ref <dir>  Practice reference directory for similarity scoring
  --severity <level>    standard (default) | harsh | gentle
  -o, --output <file>   Output report path
`)
}

// -- Main --
const args = parseArgs(process.argv.slice(2))

if (!args.inputFile) {
  printUsage()
  process.exit(1)
}

const inputPath = resolve(args.inputFile)
if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`)
  process.exit(1)
}

const mdContent = readFileSync(inputPath, 'utf-8')
const fileName = inputPath.split('/').pop() ?? 'slides.md'

// Step 1: Render verification (check image paths)
console.log(`[audit] Input: ${inputPath}`)
const imageRefs = mdContent.match(/!\[.*\]\(([^)]+)\)/g) || []
console.log(`[audit] Image references: ${imageRefs.length}`)

// Step 2: Run layout/content audits
const layoutResult = auditLayoutCompliance(inputPath, '')
const contentResult = auditContentCompleteness(inputPath, '')

// Severity multiplier
const severityMult = args.severity === 'harsh' ? 2 : args.severity === 'gentle' ? 0.5 : 1
const layoutScore = Math.max(0, 100 - (100 - layoutResult.score) * severityMult)
const contentScore = Math.max(0, 100 - (100 - contentResult.score) * severityMult)

// Step 3: Practice comparison
let practiceScore = 70
const practiceNotes: string[] = []
if (args.practiceRef && existsSync(args.practiceRef)) {
  const result = compareWithReference(inputPath, args.practiceRef)
  practiceScore = result.score
  practiceNotes.push(...result.notes)
}

// Step 4: Build report
const weights = { layout: 0.40, content: 0.25, visual: 0.20, practice: 0.15 }
const visualScore = 70 // placeholder for subagent review
const total = Math.round(
  layoutScore * weights.layout
  + contentScore * weights.content
  + visualScore * weights.visual
  + practiceScore * weights.practice,
)

const majorIssues: string[] = []
const minorIssues: string[] = []
for (const d of layoutResult.deductions) {
  if (d.points <= -15) majorIssues.push(`${d.detail} (-${Math.abs(d.points)})`)
  else minorIssues.push(`${d.detail} (-${Math.abs(d.points)})`)
}
for (const d of contentResult.deductions) {
  if (d.points <= -15) majorIssues.push(`${d.detail} (-${Math.abs(d.points)})`)
  else minorIssues.push(`${d.detail} (-${Math.abs(d.points)})`)
}

let decision = 'Excellent'
if (total < 90) decision = 'Good'
if (total < 80) decision = 'Acceptable'
if (total < 65) decision = 'Needs Revision'
if (total < 50) decision = 'Reject'
if (majorIssues.length > 0) decision = 'Needs Revision'

const report = [
  `# Audit Report — ${fileName}`,
  '',
  '## Summary',
  `整体排版质量${total >= 80 ? '良好' : total >= 60 ? '一般' : '较差'}，${layoutResult.passed.length} 项检查通过。存在 ${majorIssues.length} 个 Major 问题、${minorIssues.length} 个 Minor 问题。`,
  '',
  '## Score Breakdown',
  '| 维度 | 得分 | 权重 | 加权 |',
  '|------|------|------|------|',
  `| Layout | ${layoutScore} | 40% | ${(layoutScore * 0.4).toFixed(1)} |`,
  `| Content | ${contentScore} | 25% | ${(contentScore * 0.25).toFixed(1)} |`,
  `| Visual | ${visualScore} | 20% | ${(visualScore * 0.2).toFixed(1)} |`,
  `| Practice | ${practiceScore} | 15% | ${(practiceScore * 0.15).toFixed(1)} |`,
  `| **Total** | | | **${total}** |`,
  '',
  '## Weaknesses',
]

if (majorIssues.length > 0) {
  report.push('### Major')
  for (const issue of majorIssues) report.push(`- [ ] ${issue}`)
}
if (minorIssues.length > 0) {
  report.push('### Minor')
  for (const issue of minorIssues) report.push(`- [ ] ${issue}`)
}

report.push('', '## Strengths')
for (const p of layoutResult.passed) report.push(`- ✓ ${p}`)
for (const p of contentResult.passed) report.push(`- ✓ ${p}`)
if (practiceNotes.length > 0) {
  for (const n of practiceNotes) report.push(`- ${n}`)
}

report.push(
  '',
  '## Improvement Roadmap',
)
let n = 1
for (const issue of majorIssues) report.push(`${n++}. [Major] ${issue} — 5min`)
for (const issue of minorIssues.slice(0, 5)) report.push(`${n++}. [Minor] ${issue} — 2min`)

report.push(
  '',
  `## Decision: ${decision}`,
  `## Confidence: ${majorIssues.length === 0 ? '4' : '3'}/5`,
  `## Severity: ${args.severity}`,
)

const reportText = report.join('\n')
writeFileSync(args.outputPath, reportText, 'utf-8')
console.log(reportText)
console.log(`\n[audit] Report saved to ${args.outputPath}`)
