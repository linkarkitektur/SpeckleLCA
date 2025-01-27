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
  // List of Link colors
  private colors: string[] = [
    'rgb(153,128,119)',
    'rgb(199,151,129)',
    'rgb(187,167,137)',
    'rgb(205,197,177)',
    'rgb(224,222,197)',
    'rgb(194,207,179)',
    'rgb(173,183,167)',
    'rgb(160,167,159)',
    'rgb(140,144,145)',
    'rgb(62,85,100)',
    'rgb(106,119,134)',
    'rgb(150,151,170)',
    'rgb(111,85,101)',
    'rgb(128,106,109)'
  ]

  private colorIndex: number = 0

  // Converts 'rgb(r,g,b)' to an array [r, g, b]
  private rgbStringToArray(rgb: string): number[] {
    const result = rgb.match(/\d+/g)
    return result ? result.map(Number) : [0, 0, 0]
  }

  // Convert RGB to HSL
  private rgbToHsl(rgb: string): number[] {
    const [r, g, b] = this.rgbStringToArray(rgb).map(v => v / 255)

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    // eslint-disable-next-line prefer-const
    let h: number = 0, s: number, l: number = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
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

  // Convert HSL to string format
  private hslToString(hsl: number[]): string {
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`
  }

  // Helper function to calculate Euclidean distance in HSL space
  private calculateColorDistanceHSL(color1: string, color2: string): number {
    const [h1, s1, l1] = this.rgbToHsl(color1)
    const [h2, s2, l2] = this.rgbToHsl(color2)

    return Math.sqrt(Math.pow(h1 - h2, 2) + Math.pow(s1 - s2, 2) + Math.pow(l1 - l2, 2))
  }
  
  // Helper function for interpolating between two HSL colors
  private interpolateHSL(
    [h1, s1, l1]: number[],
    [h2, s2, l2]: number[],
    t: number
  ): number[] {
    // Simple linear interpolation of each component
    const h = h1 + (h2 - h1) * t
    const s = s1 + (s2 - s1) * t
    const l = l1 + (l2 - l1) * t
    
    // Return the interpolated HSL as [h, s, l]
    return [h, s, l]
  }
  
  /**
   * Picks `count` distinct colors out of the base color list
   * Returns them as HSL strings.
   */
  private pickDistinctFromBase(count: number): string[] {
    // Convert each base color to HSL string
    const baseHSLStrings = this.colors.map(c => this.hslToString(this.rgbToHsl(c)))

    // If count >= baseColors, return everything
    if (count >= baseHSLStrings.length) {
      return baseHSLStrings
    }

    // Otherwise, pick distinct
    const distinctColors: string[] = [ baseHSLStrings[0] ] // start with first color
    for (let i = 1; i < count; i++) {
      let maxDistance = -1
      let nextColor = ''

      // Attempt to pick a color from baseHSLStrings that is farthest from the chosen set
      for (const color of baseHSLStrings) {
        if (!distinctColors.includes(color)) {
          // measure min distance from the already picked set
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
   * Get 'count' most distinct colors from the list based on distance in HSL space
   * If count is higher than color list we interpolate a new color in HSL space
   * @param count amount of colors needed
   * @returns list of HSL colors as strings
   */
  public getMostDistinctColors(count: number): string[] {
    const baseSize = this.colors.length
    
    // If count is less than or equal to base colors, just pick from base colors
    if (count <= baseSize) 
      return this.pickDistinctFromBase(count) 

    // Get all base colors
    const allDistinct = this.pickDistinctFromBase(baseSize) 
    // Convert each anchor color to numeric HSL
    const anchorHSL = allDistinct.map(hslStr => {
      const match = hslStr.match(/(\d+),\s*(\d+)%,\s*(\d+)%/)
      if (match) {
        const [_, hh, ss, ll] = match
        return [Number(hh), Number(ss), Number(ll)]
      }
      return [0, 0, 0]
    })

    // Now produce 'count' colors by interpolating across anchorHSL
    const interpolatedColors: string[] = []
    const n = anchorHSL.length

    // Simple linear interpolation across the entire array (n - 1) segments
    for (let i = 0; i < count; i++) {
      const fraction = i / (count - 1)
      const segment = fraction * (n - 1)
      const j = Math.floor(segment)
      const localT = segment - j

      if (j >= n - 1) {
        // at the very end, use the last anchor color
        interpolatedColors.push(this.hslToString(anchorHSL[n - 1]))
      } else {
        const interp = this.interpolateHSL(anchorHSL[j], anchorHSL[j + 1], localT)
        // Round them if you want nice integers
        interpolatedColors.push(
          this.hslToString([
            Math.round(interp[0]),
            Math.round(interp[1]),
            Math.round(interp[2])
          ])
        )
      }
    }
    return interpolatedColors
  }
  
  // Get next color in HSL format
  public getNextColor(): string {
    return this.hslToString(this.rgbToHsl(this.colors[this.colorIndex++ % this.colors.length]))
  }

  // Reset color index to start rotation again
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
 * Create a list of colors based on the number of objects
 * Rainbow style for now, we can limit this range later
 * @param n number of colors
 * @returns list of HSL colors
 */
export function generateColors(n: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < n; i++) {
    const hue = Math.round(360 * i / n)
    colors.push(`hsl(${hue}, 100%, 80%)`)
  }
  return colors
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