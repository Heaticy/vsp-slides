import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  auditAllWorkers,
  discoverWorkerDirs,
  generateAuditReport,
  saveAuditReport,
} from '../src/audit-engine'
import { compareWithReference } from '../src/practice-compare'

function parseArgs(argv: string[]) {
  let workersDir = ''
  let practiceRef = ''
  let outputPath = '/tmp/audit-report.md'
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--practice-ref':
        practiceRef = argv[++i] ?? ''
        break
      case '-o':
      case '--output':
        outputPath = argv[++i] ?? outputPath
        break
      default:
        if (!arg.startsWith('-'))
          positionals.push(arg)
        break
    }
  }

  workersDir = positionals[0] ?? ''
  return { workersDir, practiceRef, outputPath }
}

function printUsage() {
  console.log(`
Usage: node --import tsx scripts/audit.ts <workers-dir> [options]

Options:
  --practice-ref <dir>  Path to practice references for similarity scoring
  -o, --output <file>   Output report path (default: /tmp/audit-report.md)
`)
}

// Main
const args = parseArgs(process.argv.slice(2))

if (!args.workersDir) {
  printUsage()
  process.exit(1)
}

const workersDir = resolve(args.workersDir)
if (!existsSync(workersDir)) {
  console.error(`Workers directory not found: ${workersDir}`)
  process.exit(1)
}

const workers = discoverWorkerDirs(workersDir)
if (workers.length === 0) {
  console.error(`No worker directories found in: ${workersDir}`)
  process.exit(1)
}

console.log(`[audit] Found ${workers.length} workers in ${workersDir}`)

// Compute practice similarity scores
const similarityScores: Record<string, number> = {}
if (args.practiceRef && existsSync(args.practiceRef)) {
  console.log(`[audit] Comparing with practice reference: ${args.practiceRef}`)
  for (const w of workers) {
    if (existsSync(w.mdFile)) {
      const result = compareWithReference(w.mdFile, args.practiceRef)
      similarityScores[w.name] = result.score
      console.log(`  ${w.name}: practice similarity = ${result.score}`)
    }
    else {
      similarityScores[w.name] = 70 // default
    }
  }
}

// Run audit
const startTime = Date.now()
const rankings = await auditAllWorkers(workers, {}, similarityScores)
const elapsed = Date.now() - startTime

const report = generateAuditReport(rankings, 1, elapsed)
saveAuditReport(report, args.outputPath)

console.log(report)
console.log(`[audit] Report saved to ${args.outputPath}`)
