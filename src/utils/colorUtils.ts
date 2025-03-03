/* eslint-disable prefer-const */
import chroma from 'chroma-js'

export const baseColors = {
  primaryGreen: '#95C92C',
  secondaryGreen: '#B5E655',
  primaryRed: '#F06000',
  secondaryRed: '#FF8F00',
  primaryGrey: '#E0E0E0',
}

const fontColors = {
  white: 'text-gray-200',
  black: 'text-gray-700',
}

export class ColorManager {
  // Define multiple color sets
  private colorSets: { [key: string]: string[] } = {
    base: [
      'hsl(14, 23%, 53%)', // from rgb(153,128,119)
      'hsl(22, 33%, 64%)', // from rgb(199,151,129)
      'hsl(25, 24%, 63%)', // from rgb(187,167,137)
      'hsl(37, 26%, 75%)', // from rgb(205,197,177)
      'hsl(50, 35%, 83%)', // from rgb(224,222,197)
      'hsl(42, 21%, 73%)', // from rgb(194,207,179)
      'hsl(84, 11%, 69%)', // from rgb(173,183,167)
      'hsl(70, 4%, 63%)',  // from rgb(160,167,159)
      'hsl(204, 3%, 56%)', // from rgb(140,144,145)
      'hsl(209, 23%, 32%)',// from rgb(62,85,100)
      'hsl(211, 21%, 47%)',// from rgb(106,119,134)
      'hsl(232, 12%, 63%)',// from rgb(150,151,170)
      'hsl(340, 14%, 38%)',// from rgb(111,85,101)
      'hsl(330, 17%, 46%)' // from rgb(128,106,109)
    ],
  
    pantone: [
      'hsl(212, 44%, 72%)', // from rgb(155,183,212)
      'hsl(341, 65%, 51%)', // from rgb(195,68,122)
      'hsl(353, 69%, 44%)', // from rgb(186,36,62)
      'hsl(180, 36%, 63%)', // from rgb(123,196,196)
      'hsl(13, 72%, 56%)',  // from rgb(226,88,62)
      'hsl(177, 36%, 51%)', // from rgb(83,176,174)
      'hsl(39, 37%, 81%)',  // from rgb(222,205,190)
      'hsl(352, 71%, 36%)', // from rgb(155,27,48)
      'hsl(243, 28%, 49%)', // from rgb(90,91,159)
      'hsl(42, 79%, 65%)',  // from rgb(240,192,90)
      'hsl(174, 46%, 49%)', // from rgb(69,181,170)
      'hsl(344, 64%, 58%)', // from rgb(217,79,112)
      'hsl(8, 72%, 50%)',   // from rgb(221,65,36)
      'hsl(168, 100%, 29%)',// from rgb(0,148,115)
      'hsl(290, 30%, 48%)', // from rgb(173,94,153)
      'hsl(6, 32%, 44%)',   // from rgb(150,79,76)
      'hsl(6, 73%, 88%)',   // from rgb(247,202,201)
      'hsl(221, 30%, 70%)', // from rgb(147,169,209)
      'hsl(79, 40%, 49%)',  // from rgb(136,176,75)
      'hsl(259, 30%, 42%)', // from rgb(95,75,139)
      'hsl(10, 100%, 69%)', // from rgb(255,111,97)
      'hsl(208, 78%, 28%)', // from rgb(15,76,129)
      'hsl(210, 2%, 58%)',  // from rgb(147,149,151)
      'hsl(50, 85%, 63%)',  // from rgb(245,223,77)
      'hsl(243, 40%, 54%)', // from rgb(102,103,171)
      'hsl(351, 66%, 44%)', // from rgb(187,38,73)
      'hsl(22, 26%, 52%)'   // from rgb(164,120,100)
    ],
  
    highViz: [
      'hsl(14, 100%, 60%)', // from #FF5733 (Fiery Red)
      'hsl(51, 100%, 50%)', // from #FFC300 (Vibrant Yellow)
      'hsl(300, 100%, 60%)',// from #FF33FF (Electric Pink)
      'hsl(120, 100%, 60%)',// from #33FF57 (Neon Green)
      'hsl(191, 100%, 60%)',// from #33C4FF (Bright Cyan)
      'hsl(14, 100%, 60%)', // from #FF5733 (Fiery Coral) – same hex as Fiery Red
      'hsl(26, 100%, 54%)', // from #FF8D1A (Bright Orange)
      'hsl(324, 100%, 60%)',// from #FF33A8 (Hot Magenta)
      'hsl(168, 100%, 60%)',// from #33FFBD (Aqua Mint)
      'hsl(336, 100%, 60%)' // from #FF3380 (Vivid Rose)
    ],
  
    pastels: [
      'hsl(140, 37%, 75%)', // from rgb(168,213,186)
      'hsl(165, 31%, 80%)', // from rgb(191,216,210)
      'hsl(44, 84%, 83%)',  // from rgb(247,225,174)
      'hsl(26, 56%, 77%)',  // from rgb(232,195,163)
      'hsl(0, 35%, 74%)',   // from rgb(212,165,165)
      'hsl(221, 24%, 76%)', // from rgb(181,192,208)
      'hsl(156, 21%, 79%)', // from rgb(194,211,205)
      'hsl(30, 36%, 83%)',  // from rgb(230,210,194)
      'hsl(27, 60%, 89%)',  // from rgb(244,225,210)
      'hsl(187, 25%, 89%)'  // from rgb(222,231,231)
    ]
  }
  

  private activeSet: string = 'pastels'
  private colorIndex: number = 0

  /**
   * Switch color set dynamically
   * @param setName 'base' | 'pantone' | other future sets
   */
  public switchColorSet(setName: string): void {
    if (this.colorSets[setName]) {
      this.activeSet = setName
      this.colorIndex = 0 // Reset color index when switching
    } else {
      console.warn(`Color set "${setName}" does not exist.`)
    }
  }

  /**
   * Get colors from the active set
   */
  private getCurrentColors(): string[] {
    return this.colorSets[this.activeSet]
  }

  /**
   * Get the next color from the active color set
   */
  public getNextColor(): string {
    const colors = this.getCurrentColors()
    const color = colors[this.colorIndex % colors.length]
    this.colorIndex++
    return color
  }

  /**
   * Get 'count' distinct colors from the active set based on HSL distance
   */
  public getMostDistinctColors(count: number): string[] {
    const colors = this.getCurrentColors()
    if (count >= colors.length) return colors
    
    // Convert colors to HSL for comparison
    const distinctColors: string[] = [colors[0]]
    for (let i = 1; i < count; i++) {
      let maxDistance = -1
      let nextColor = ''

      for (const color of colors) {
        if (!distinctColors.includes(color)) {
          const minDistToSet = Math.min(
            ...distinctColors.map(selected =>
              this.calculateColorDistanceHSL(selected, color)
            )
          )
          if (minDistToSet > maxDistance) {
            maxDistance = minDistToSet
            nextColor = color
          }
        }
      }
      distinctColors.push(nextColor)
    }

    return distinctColors
  }

  /**
   * Converts 'rgb(r,g,b)' to an array [r, g, b]
   */
  private rgbStringToArray(rgb: string): number[] {
    const result = rgb.match(/\d+/g)
    return result ? result.map(Number) : [0, 0, 0]
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(rgb: string): number[] {
    const [r, g, b] = this.rgbStringToArray(rgb).map(v => v / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0 // Achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: 
          h = (g - b) / d + (g < b ? 6 : 0) 
          break
        case g: 
          h = (b - r) / d + 2 
          break
        case b: 
          h = (r - g) / d + 4 
          break      
      }
      h /= 6
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
  }

  /**
   * Calculate Euclidean distance in HSL space
   */
  private calculateColorDistanceHSL(color1: string, color2: string): number {
    const [h1, s1, l1] = this.rgbToHsl(color1)
    const [h2, s2, l2] = this.rgbToHsl(color2)

    return Math.sqrt(
      Math.pow(h1 - h2, 2) + Math.pow(s1 - s2, 2) + Math.pow(l1 - l2, 2)
    )
  }

  /**
   * Reset color index to restart rotation
   */
  public resetColorIndex(index: number = 0): void {
    this.colorIndex = index
  }
}

/**
 * Checks the lightness of the color and returns the appropriate font color
 * @param hsl HSL color string
 * @returns 
 */
export function getFontColorForHSL(hsl: string): string {
  // Extract the lightness value from the HSL string
  const hslValues = hsl.match(/\d+/g)?.map(Number)
  
  if (!hslValues || hslValues.length !== 3) {
    throw new Error('Invalid HSL format')
  }

  const lightness = hslValues[2]

  // Return white font color if the background is dark,
  // otherwise return black font color
  return lightness < 50 ? fontColors.white : fontColors.black
}

/**
 * Convert hsl to hex, https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
 * @param h hue
 * @param s saturation
 * @param l lightness
 * @returns Hex color
 */
export function hslToHex(h: number, s: number, l: number) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')   // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Get gradient color scale for custom color length
 * Only supports a start and an end color
 * @param numColors number of colors in the gradient
 * @param startColor optional otherwise it uses primaryGreen
 * @param endColor optional otherwise it uses primaryRed
 * @returns 
 */
export function generateGradientColorScale(numColors: number, startColor: string = baseColors.primaryGreen, endColor: string = baseColors.primaryRed) {
  return chroma.scale([startColor, endColor]).mode('lab').colors(numColors)
}

/**
 * Get specific color from gradient based on a min and max value
 * @param startColor optional otherwise it uses primaryGreen
 * @param endColor optional otherwise it uses primaryRed
 * @param value number to get color for
 * @param min minimum value for interpolation
 * @param max maximum value for interpolation
 * @returns 
 */
export function getValueColorFromGradient(value: number, min: number, max: number, startColor: string = baseColors.primaryGreen, endColor: string = baseColors.primaryRed) {
  const normalizedValue = (value - min) / (max - min)
  return chroma.scale([startColor, endColor])(normalizedValue).hex()
}

/**
 * Lightens a hex color by the given amount.
 * @param hex The original hex color (e.g. "#95C92C")
 * @param amount The amount to lighten the color; typical values are between 0 and 2.
 *               (e.g. 1 gives a moderate brighten, 2 gives a stronger effect)
 * @returns The lightened hex color.
 */
export function lightenHexColor(hex: string, amount: number): string {
  return chroma(hex).brighten(amount).hex()
}

/**
 * Lightens a hsl color by the given amount.
 * @param hex The original hsl color (e.g. "#95C92C")
 * @param amount The amount to lighten the color; typical values are between 0 and 2.
 *               (e.g. 1 gives a moderate brighten, 2 gives a stronger effect)
 * @returns The lightened hsl color.
 */
export function lightenHSLColor(hsl: string, amount: number): string {
  const brightend = chroma(hsl).brighten(amount).hsl()
  return `hsl(${Math.round(brightend[0] || 0)}, ${Math.round(brightend[1] * 100)}%, ${Math.round(brightend[2] * 100)}%)`
}

/**
 * Darkens a hsl color by the given amount.
 * @param hex The original hsl color (e.g. "#95C92C")
 * @param amount The amount to darken the color; typical values are between 0 and 2.
 *               (e.g. 1 gives a moderate darken, 2 gives a stronger effect)
 * @returns The darkened hsl color.
 */
export function darkenHSLColor(hsl: string, amount: number): string {
  const brightend = chroma(hsl).darken(amount).hsl()
  return `hsl(${Math.round(brightend[0] || 0)}, ${Math.round(brightend[1] * 100)}%, ${Math.round(brightend[2] * 100)}%)`
}