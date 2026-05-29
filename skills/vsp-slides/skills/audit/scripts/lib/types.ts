// VSP Marp type definitions

export type ThemeName = 'report' | 'tutorial-red' | 'tutorial-red-shtu' | 'tutorial-purple' | 'tutorial-nailong'

export type Scenario = '论文汇报' | '课程展示' | '项目展示' | '其他'

export interface SpeakerInfo {
  name: string
  email: string
}

export interface SlideConfig {
  speaker: SpeakerInfo
  title: string
  scenario: Scenario
  theme: ThemeName
  inputPath: string
  outputDir?: string
}

export interface LayoutParams {
  seed: number
  preferredColRatio: '37' | '46' | '64' | '73' | '50'
  imageSizeBias: 'compact' | 'normal' | 'large'
  textDensity: 'sparse' | 'normal' | 'dense'
  useToc: 'toc_a' | 'toc_b' | 'none'
  useTrans: boolean
  captionStyle: 'above' | 'below' | 'overlay'
  listStyle: 'cols2_ol_sq' | 'cols2_ul_ci' | 'col1_ol_ci' | 'plain'
}

export interface ScoreEntry {
  worker: string
  layout: number
  content: number
  visual: number
  similarity: number
  total: number
  notes: string[]
}

export interface AuditReport {
  summary: string
  scores: ScoreEntry
  weaknesses: { severity: 'Major' | 'Minor' | 'Suggestion', detail: string }[]
  strengths: string[]
  roadmap: { priority: number, severity: string, task: string, effort: string }[]
  decision: string
  confidence: number
}

export interface ImageInfo {
  path: string
  width: number
  height: number
  aspectRatio: number
}
