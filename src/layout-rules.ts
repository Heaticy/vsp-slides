import type { ImageInfo, LayoutParams } from './types'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { imageSize as sizeOf } from 'image-size'

const CANVAS_W = 1280
const CANVAS_H = 720

export function getImageInfo(imagePath: string): ImageInfo | null {
  try {
    // image-size v2 requires a buffer, not a file path
    const buf = readFileSync(imagePath)
    const dims = sizeOf(buf)
    if (!dims.width || !dims.height)
      return null
    return {
      path: imagePath,
      width: dims.width,
      height: dims.height,
      aspectRatio: dims.width / dims.height,
    }
  }
  catch {
    return null
  }
}

export function getImageInfoFromUrl(_url: string, fallbackPath?: string): ImageInfo | null {
  // For URL images, try to resolve to local path
  if (fallbackPath) {
    try {
      const resolved = resolve(fallbackPath)
      statSync(resolved)
      return getImageInfo(resolved)
    }
    catch {
      // fallback path not accessible
    }
  }
  // Without local access, assume square aspect ratio
  return null
}

export function classifyImageLayout(
  aspectRatio: number,
  isInfoDense: boolean = false,
): {
  layoutClass: string
  containerClass: string
  reasoning: string
} {
  // Wide/flat image → rows (top-bottom) layout
  if (aspectRatio > 1.5) {
    if (isInfoDense) {
      return {
        layoutClass: 'rows-2-28',
        containerClass: 'bimg wide-figure',
        reasoning: '信息密集宽图，用 rows-2-28 让图片获得更大展示空间',
      }
    }
    // For wide images, use rows. Choose ratio based on how extreme the aspect ratio is
    if (aspectRatio > 2.5) {
      return {
        layoutClass: 'rows-2-37',
        containerClass: 'bimg wide-figure',
        reasoning: `超宽图(宽高比${aspectRatio.toFixed(1)}>2.5)，用 rows-2-37 上30%说明+下70%图片`,
      }
    }
    return {
      layoutClass: 'rows-2-55',
      containerClass: 'bimg',
      reasoning: `横图(宽高比${aspectRatio.toFixed(1)})用上下布局`,
    }
  }

  // Tall or square image → cols (left-right) layout
  if (aspectRatio <= 0.8) {
    // Tall image: text takes more space
    return {
      layoutClass: 'cols-2-64',
      containerClass: 'rimg',
      reasoning: `竖图(宽高比${aspectRatio.toFixed(1)})，文字60%+图片40%`,
    }
  }

  // Near-square (0.8 < ar <= 1.5): choose col ratio based on image role
  return {
    layoutClass: 'cols-2-46',
    containerClass: 'rimg',
    reasoning: `方图/近方图(宽高比${aspectRatio.toFixed(1)})，左右46分栏`,
  }
}

export function chooseColRatio(
  params: LayoutParams,
  textLength: number,
  imageCount: number,
): string {
  const { preferredColRatio, imageSizeBias } = params

  // If user preference is strong, use it
  if (imageSizeBias === 'large' && imageCount > 0) {
    return `cols-2-${preferredColRatio === '50' ? '37' : preferredColRatio}`
  }

  if (imageSizeBias === 'compact') {
    return `cols-2-${preferredColRatio === '50' ? '73' : preferredColRatio}`
  }

  // Auto-select based on text length relative to images
  if (textLength > 500 && imageCount <= 1)
    return 'cols-2-73'
  if (textLength > 300 && imageCount <= 2)
    return 'cols-2-64'
  if (textLength < 150 && imageCount >= 2)
    return 'cols-2-37'
  if (textLength < 100)
    return 'cols-2-37'

  return `cols-2-${preferredColRatio === '50' ? '46' : preferredColRatio}`
}

export function suggestImageAttr(
  image: ImageInfo,
  containerClass: string,
): { attr?: string } {
  // In cols-img containers, use no-size ![](path) to prevent stretch
  if (containerClass.includes('img')) {
    return { attr: undefined } // No size attribute
  }

  // Standalone images: suggest one dimension only
  if (image.aspectRatio > 1.5) {
    // Wide: constrain width
    const w = Math.min(Math.round(image.width * 0.9), CANVAS_W - 100)
    return { attr: `w:${w}px` }
  }

  // Tall or square: constrain height
  const h = Math.min(Math.round(image.height * 0.85), CANVAS_H - 200)
  return { attr: `h:${h}px` }
}

export function checkOverflow(
  elementBounds: { x: number, y: number, width: number, height: number },
): boolean {
  return (
    elementBounds.x < 0
    || elementBounds.y < 0
    || elementBounds.x + elementBounds.width > CANVAS_W
    || elementBounds.y + elementBounds.height > CANVAS_H
  )
}

export function estimateTextLength(text: string): number {
  // Rough estimate: Chinese characters count as 1, words count by whitespace
  const chineseChars = (text.match(/[一-鿿㐀-䶿]/g) || []).length
  const words = text.split(/\s+/).length
  return chineseChars + words * 2
}

export function shouldUseTransSection(
  sectionTitle: string,
  params: LayoutParams,
): boolean {
  if (!params.useTrans)
    return false
  // Major sections (numbered) get trans pages
  return /^\d+[.\s]/.test(sectionTitle) && sectionTitle.length < 30
}
