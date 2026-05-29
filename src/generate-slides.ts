import type { LayoutParams, SlideConfig } from './types'
import { resolve } from 'node:path'
import { coverClassForTheme, speakerMetaHtml } from './config'
import { classifyImageLayout, estimateTextLength, getImageInfo } from './layout-rules'

export function generateMarpMarkdown(
  inputMarkdown: string,
  config: SlideConfig,
  params: LayoutParams,
): string {
  const slides: string[] = []

  // Determine base directory from input path for resolving relative image paths
  const baseDir = config.inputPath
    ? resolve(config.inputPath, '..')
    : process.cwd()

  // Frontmatter
  slides.push(generateFrontmatter(config))
  slides.push('')

  // Cover page
  slides.push(generateCoverSlide(config))

  // Parse sections
  const sections = parseSections(inputMarkdown)

  // Table of contents
  if (params.useToc !== 'none') {
    slides.push(pageBreak())
    slides.push(generateTocSlide(sections, params.useToc, config.title))
  }

  // Generate content slides
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    // Trans page before major numbered sections
    if (params.useTrans && section.level === 2 && /^\d+[.\s]/.test(section.title)) {
      slides.push(pageBreak())
      slides.push(generateTransSlide(section.title))
    }

    const sectionSlides = generateSectionSlides(section, params, config, baseDir)
    for (const slide of sectionSlides) {
      slides.push(pageBreak())
      slides.push(slide)
    }
  }

  // Last page
  slides.push(pageBreak())
  slides.push(generateLastPageSlide())

  return slides.join('\n')
}

function generateFrontmatter(config: SlideConfig): string {
  const lines = [
    '---',
    'marp: true',
    `theme: ${config.theme}`,
    'size: 16:9',
    'paginate: true',
    `math: mathjax`,
    '---',
  ]
  return lines.join('\n')
}

function generateCoverSlide(config: SlideConfig): string {
  const coverClass = coverClassForTheme(config.theme)
  return [
    `<!-- _class: ${coverClass} -->`,
    '<!-- _paginate: "" -->',
    '',
    `# ${config.title}`,
    '',
    speakerMetaHtml(config.speaker),
  ].join('\n')
}

function generateTocSlide(
  sections: Section[],
  tocStyle: string,
  _title: string,
): string {
  const headingSections = sections.filter(s => s.level === 2)
  const items = headingSections.map((s) => {
    const anchor = s.title.replace(/[^a-z0-9一-鿿]/gi, '-').toLowerCase()
    return `- [${s.title}](#${anchor})`
  }).join('\n')

  return [
    `## Contents`,
    `<!-- _class: ${tocStyle} -->`,
    `<!-- _header: "Contents" -->`,
    '<!-- _footer: "" -->',
    '<!-- _paginate: "" -->',
    '',
    items,
  ].join('\n')
}

function generateTransSlide(title: string): string {
  return [
    `## ${title}`,
    '<!-- _class: trans -->',
    '<!-- _footer: "" -->',
    '<!-- _paginate: "" -->',
  ].join('\n')
}

function generateSectionSlides(
  section: Section,
  params: LayoutParams,
  config: SlideConfig,
  baseDir: string,
): string[] {
  const slides: string[] = []
  const images = section.images
  const textBlocks = section.textBlocks

  if (images.length === 0) {
    // Text-only section
    slides.push(generateTextSlide(section.title, textBlocks, params))
    return slides
  }

  // With images: determine layout
  // Group images with their surrounding text
  const currentSlide = ''
  let currentImageCount = 0

  for (const block of section.content) {
    if (block.type === 'image') {
      currentImageCount++
    }
  }

  if (images.length === 1 && textBlocks.length > 0) {
    // Single image + text: use cols or rows based on image aspect ratio
    slides.push(generateImageTextSlide(section.title, images[0], textBlocks, params, baseDir))
  }
  else if (images.length === 2 && textBlocks.length === 0) {
    // Two images only: use cols-2
    slides.push(generateTwoImageSlide(section.title, images, params))
  }
  else if (images.length > 0) {
    // Multiple images: split across pages
    for (let i = 0; i < images.length; i++) {
      const imgText = i < textBlocks.length ? textBlocks[i] : ''
      slides.push(generateImageTextSlide(
        i === 0 ? section.title : `${section.title} (续)`,
        images[i],
        imgText ? [imgText] : [],
        params,
        baseDir,
      ))
    }
  }
  else {
    slides.push(generateTextSlide(section.title, textBlocks, params))
  }

  return slides
}

function generateTextSlide(
  title: string,
  textBlocks: string[],
  _params: LayoutParams,
): string {
  const text = textBlocks.join('\n\n')
  const slideClass = text.length > 300 ? 'fixedtitleA' : ''

  const lines = [
    `## ${title}`,
  ]
  if (slideClass)
    lines.push(`<!-- _class: ${slideClass} -->`)
  lines.push('')
  lines.push(text)

  return lines.join('\n')
}

function generateImageTextSlide(
  title: string,
  image: string,
  textBlocks: string[],
  params: LayoutParams,
  baseDir: string,
): string {
  // Determine image aspect ratio from actual image file dimensions
  const absImagePath = resolve(baseDir, image)
  const aspectEstimate = estimateImageAspect(absImagePath)
  const text = textBlocks.join('\n\n')
  const textLen = estimateTextLength(text)

  const { layoutClass, containerClass, reasoning: _reasoning } = classifyImageLayout(
    aspectEstimate,
    isInfoDenseImage(image),
  )

  const isRows = layoutClass.startsWith('rows')
  const lines: string[] = [`## ${title}`]
  lines.push(`<!-- _class: ${layoutClass} -->`)

  if (isRows) {
    // Top: text, Bottom: image
    lines.push('')
    lines.push('<div class="tdiv">')
    lines.push('')
    lines.push(text)
    lines.push('')
    lines.push('</div>')
    lines.push('')
    lines.push(`<div class="${containerClass}">`)
    lines.push('')
    lines.push(`![](${image})`)
    lines.push('')
    lines.push('</div>')
  }
  else {
    // Left: text, Right: image
    lines.push('')
    lines.push('<div class="ldiv">')
    lines.push('')
    lines.push(text)
    lines.push('')
    lines.push('</div>')
    lines.push('')
    lines.push(`<div class="${containerClass}">`)
    lines.push('')
    lines.push(`![](${image})`)
    lines.push('')
    lines.push('</div>')
  }

  return lines.join('\n')
}

function generateTwoImageSlide(
  title: string,
  images: string[],
  params: LayoutParams,
): string {
  // Determine if both are wide → use rows; otherwise cols
  const ar0 = estimateImageAspect(images[0])
  const ar1 = estimateImageAspect(images[1])
  const bothWide = ar0 > 1.5 && ar1 > 1.5

  const layoutClass = bothWide ? 'rows-2-55' : 'cols-2'
  const lines: string[] = [`## ${title}`, `<!-- _class: ${layoutClass} -->`]

  if (bothWide) {
    lines.push('', '<div class="timg">', '', `![](${images[0]})`, '', '</div>')
    lines.push('', '<div class="bimg">', '', `![](${images[1]})`, '', '</div>')
  }
  else {
    lines.push('', '<div class="limg">', '', `![](${images[0]})`, '', '</div>')
    lines.push('', '<div class="rimg">', '', `![](${images[1]})`, '', '</div>')
  }

  return lines.join('\n')
}

function generateLastPageSlide(): string {
  return [
    '<!-- _class: lastpage -->',
    '<!-- _header: "" -->',
    '<!-- _footer: "" -->',
    '<!-- _paginate: "" -->',
    '',
    '###### Thank You',
    '',
    '<div class="icons">',
    '',
    '- VSP Marp',
    '- ShanghaiTech',
    '- AI-Generated',
    '',
    '</div>',
    '',
    '<div class="caption">',
    'Generated by VSP Marp AI Pipeline',
    '</div>',
  ].join('\n')
}

function pageBreak(): string {
  return '\n---\n'
}

// -- Parsing --

interface Section {
  level: number
  title: string
  content: Block[]
  images: string[]
  textBlocks: string[]
}

type Block
  = | { type: 'text', content: string }
    | { type: 'image', path: string }

function parseSections(markdown: string): Section[] {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentText = ''

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      // Flush current section
      if (currentSection) {
        if (currentText.trim()) {
          currentSection.content.push({ type: 'text', content: currentText.trim() })
          currentSection.textBlocks.push(currentText.trim())
        }
        sections.push(currentSection)
      }

      const level = headingMatch[1].length
      const title = headingMatch[2].trim()

      // Skip H1 (document title)
      if (level === 1) {
        currentSection = null
        currentText = ''
        continue
      }

      currentSection = {
        level,
        title,
        content: [],
        images: [],
        textBlocks: [],
      }
      currentText = ''
    }
    else if (currentSection) {
      const imgMatch = line.match(/!\[.*\]\(([^)]+)\)/)
      if (imgMatch) {
        if (currentText.trim()) {
          currentSection.content.push({ type: 'text', content: currentText.trim() })
          currentSection.textBlocks.push(currentText.trim())
          currentText = ''
        }
        const imgPath = imgMatch[1]
        currentSection.content.push({ type: 'image', path: imgPath })
        currentSection.images.push(imgPath)
      }
      else if (line.trim()) {
        currentText += `${line}\n`
      }
      else if (currentText.trim()) {
        currentSection.content.push({ type: 'text', content: currentText.trim() })
        currentSection.textBlocks.push(currentText.trim())
        currentText = ''
      }
    }
  }

  // Flush last section
  if (currentSection) {
    if (currentText.trim()) {
      currentSection.content.push({ type: 'text', content: currentText.trim() })
      currentSection.textBlocks.push(currentText.trim())
    }
    sections.push(currentSection)
  }

  return sections
}

// -- Heuristics --

function estimateImageAspect(_imagePath: string): number {
  // Try to get actual dimensions from the local image file
  // Return a reasonable default if can't determine
  try {
    // Dynamic import for layout-rules to avoid circular deps
    const info = getImageInfo(_imagePath)
    if (info)
      return info.aspectRatio
  }
  catch {
    // Can't determine, use filename heuristics
  }

  // Heuristic from filename
  const name = _imagePath.toLowerCase()
  if (name.includes('wide') || name.includes('background') || name.includes('landscape'))
    return 2.0
  if (name.includes('figure') && name.includes('split'))
    return 1.6 // Paper figures tend to be wide
  if (name.includes('arch') || name.includes('overview') || name.includes('network'))
    return 1.8
  if (name.includes('result') || name.includes('table'))
    return 1.4
  return 1.2 // Default near-square
}

function isInfoDenseImage(_imagePath: string): boolean {
  const name = _imagePath.toLowerCase()
  // Paper figures with split_pages, architecture diagrams, result tables are info-dense
  return (
    name.includes('split_pages')
    || name.includes('figure_')
    || name.includes('arch')
    || name.includes('result')
    || name.includes('network')
    || name.includes('tikz')
  )
}
