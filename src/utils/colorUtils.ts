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

  // Get 'count' most distinct colors from the list based on distance in HSL space
  public getMostDistinctColors(count: number): string[] {
    if (count >= this.colors.length) return this.colors.map(c => this.hslToString(this.rgbToHsl(c))) // Return all in HSL if needed

    const distinctColors: string[] = [this.hslToString(this.rgbToHsl(this.colors[0]))] // Start with first color

    // Find most distinct colors by maximizing distance in HSL space
    for (let i = 1; i < count; i++) {
      let maxDistance = -1
      let nextColor = ''

      for (const color of this.colors) {
        if (!distinctColors.includes(this.hslToString(this.rgbToHsl(color)))) {
          const minDistanceToSet = Math.min(
            ...distinctColors.map(selectedColor => this.calculateColorDistanceHSL(this.hslToString(this.rgbToHsl(selectedColor)), color))
          )
          if (minDistanceToSet > maxDistance) {
            maxDistance = minDistanceToSet
            nextColor = color
          }
        }
      }

      distinctColors.push(this.hslToString(this.rgbToHsl(nextColor)))
    }

    return distinctColors
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