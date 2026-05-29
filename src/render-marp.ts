import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const VSP_MARP = resolve(REPO_ROOT, 'vsp-marp')
const MARP_CLI = resolve(VSP_MARP, 'node_modules/@marp-team/marp-cli/marp-cli.js')
const DIST_THEMES = resolve(VSP_MARP, 'dist/themes')

export function renderMarp(inputMd: string, outputHtml: string, theme: string): string {
  const themeFile = resolve(DIST_THEMES, `${theme}.css`)

  if (!existsSync(themeFile)) {
    throw new Error(
      `Theme CSS not found: ${themeFile}. Available themes: ${
        readdirSync(DIST_THEMES).join(', ')
      }`,
    )
  }

  const outputDir = dirname(outputHtml)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const result = spawnSync(
    process.execPath,
    [MARP_CLI, '--theme', themeFile, inputMd, '-o', outputHtml],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120_000, // 2 minute timeout
    },
  )

  if (result.stdout)
    process.stdout.write(result.stdout)
  if (result.stderr)
    process.stderr.write(result.stderr)

  if (result.status !== 0) {
    throw new Error(
      `Marp render failed with status ${result.status}: ${result.stderr || result.stdout || 'unknown error'}`,
    )
  }

  if (!existsSync(outputHtml)) {
    throw new Error(`Marp render completed but output file not found: ${outputHtml}`)
  }

  return outputHtml
}

export function renderMarpFromString(
  markdownContent: string,
  outputHtml: string,
  theme: string,
  baseDir?: string,
): string {
  const workDir = baseDir ? resolve(baseDir) : resolve(REPO_ROOT, '.marp-cache')
  if (!existsSync(workDir)) {
    mkdirSync(workDir, { recursive: true })
  }

  const tmpMd = resolve(workDir, `slides-${Date.now()}.md`)
  writeFileSync(tmpMd, markdownContent, 'utf-8')

  try {
    return renderMarp(tmpMd, outputHtml, theme)
  }
  finally {
    try {
      unlinkSync(tmpMd)
    }
    catch {
      // ignore cleanup errors
    }
  }
}

export function listAvailableThemes(): string[] {
  try {
    const files = readdirSync(DIST_THEMES)
    return files.filter((f: string) => f.endsWith('.css')).map((f: string) => f.replace('.css', ''))
  }
  catch {
    return []
  }
}
