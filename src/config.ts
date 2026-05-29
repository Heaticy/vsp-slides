import type { Scenario, SlideConfig, SpeakerInfo, ThemeName } from './types'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_FILENAME = 'vsp-marp-config.json'

export function createConfig(params: {
  speakerName: string
  speakerEmail: string
  title: string
  scenario: Scenario
  theme: ThemeName
  inputPath: string
  outputDir?: string
}): SlideConfig {
  return {
    speaker: {
      name: params.speakerName,
      email: params.speakerEmail,
    },
    title: params.title,
    scenario: params.scenario,
    theme: params.theme,
    inputPath: resolve(params.inputPath),
    outputDir: params.outputDir,
  }
}

export function saveConfig(config: SlideConfig, dir?: string): string {
  const dirPath = dir ?? process.cwd()
  const configPath = resolve(dirPath, CONFIG_FILENAME)
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  return configPath
}

export function loadConfig(dir?: string): SlideConfig | null {
  const dirPath = dir ?? process.cwd()
  const configPath = resolve(dirPath, CONFIG_FILENAME)
  try {
    const raw = readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as SlideConfig
  }
  catch {
    return null
  }
}

export function extractTitleFromMarkdown(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

export function resolveThemeForScenario(scenario: Scenario): ThemeName {
  switch (scenario) {
    case '论文汇报':
      return 'report'
    case '课程展示':
      return 'tutorial-red-shtu'
    case '项目展示':
      return 'report'
    default:
      return 'report'
  }
}

export function validateConfig(config: SlideConfig): string[] {
  const errors: string[] = []
  if (!config.speaker.name.trim())
    errors.push('演讲人姓名不能为空')
  if (!config.speaker.email.trim())
    errors.push('演讲人邮箱不能为空')
  if (!config.speaker.email.includes('@'))
    errors.push('演讲人邮箱格式不正确')
  if (!config.title.trim())
    errors.push('PPT 标题不能为空')
  if (!config.inputPath)
    errors.push('输入文件路径不能为空')
  return errors
}

export function speakerMetaHtml(speaker: SpeakerInfo): string {
  return `<div class="speaker-meta">

<span>Speaker</span> ${speaker.name}
<small>${speaker.email}</small>

</div>`
}

export function coverClassForTheme(theme: ThemeName): string {
  return theme.startsWith('tutorial') ? 'cover_e' : 'cover_b'
}
