import chroma from 'chroma-js'

export const baseColors = {
  primaryGreen: '#95C92C',
  secondaryGreen: '#B5E655',
  primaryRed: '#F06000',
  secondaryRed: '#FF8F00',
  primaryGrey: '#E0E0E0',
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
  const normalizedValue = (value - min) / (max - min);
  return chroma.scale([startColor, endColor])(normalizedValue).hex();
}