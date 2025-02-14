import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ColorManager,
  baseColors,
  getFontColorForHSL,
  hslToHex,
  generateGradientColorScale,
  getValueColorFromGradient
} from '@/utils/colorUtils'

describe('colorUtils', () => {
  let colorManager: ColorManager

  beforeEach(() => {
    colorManager = new ColorManager()
  })

  describe('ColorManager', () => {
    describe('getMostDistinctColors', () => {
      it('should return requested number of colors', () => {
        const colors = colorManager.getMostDistinctColors(5)
        expect(colors).toHaveLength(5)
      })

      it('should handle requests larger than base colors', () => {
        const colors = colorManager.getMostDistinctColors(20)
        expect(colors).toHaveLength(20)
      })

      it('should return HSL formatted colors', () => {
        const colors = colorManager.getMostDistinctColors(1)
        expect(colors[0]).toMatch(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/)
      })

      it('should return consistent color for same input', () => {
        const color1 = colorManager.getMostDistinctColors(6)
        const color2 = colorManager.getMostDistinctColors(6)
        expect(color1).toEqual(color2)
      })
    })

    describe('getNextColor', () => {
      it('should cycle through colors', () => {
        const firstColor = colorManager.getNextColor()
        const colors = Array(14).fill(0).map(() => colorManager.getNextColor())
        expect(colors[13]).toBe(firstColor)
      })

      it('should reset color index', () => {
        const firstColor = colorManager.getNextColor()
        colorManager.resetColorIndex()
        expect(colorManager.getNextColor()).toBe(firstColor)
      })
    })
  })

  describe('Utility Functions', () => {
    describe('getFontColorForHSL', () => {
      it('should return white for dark backgrounds', () => {
        expect(getFontColorForHSL('hsl(0, 0%, 20%)')).toBe('text-gray-200')
      })

      it('should return black for light backgrounds', () => {
        expect(getFontColorForHSL('hsl(0, 0%, 80%)')).toBe('text-gray-700')
      })

      it('should throw error for invalid HSL', () => {
        expect(() => getFontColorForHSL('invalid')).toThrow('Invalid HSL format')
      })
    })

    describe('hslToHex', () => {
      it('should convert HSL to hex', () => {
        expect(hslToHex(0, 0, 100)).toBe('#ffffff')
        expect(hslToHex(0, 0, 0)).toBe('#000000')
      })
    })

    describe('gradientColorScale', () => {
      it('should generate gradient colors', () => {
        const colors = generateGradientColorScale(5)
        expect(colors).toHaveLength(5)
      })

      it('should use custom colors', () => {
        const colors = generateGradientColorScale(2, '#000000', '#ffffff')
        expect(colors[0]).toBe('#000000')
        expect(colors[1]).toBe('#ffffff')
      })
    })

    describe('getValueColorFromGradient', () => {
      it('should interpolate colors correctly', () => {
        const color = getValueColorFromGradient(50, 0, 100)
        expect(color).toBeDefined()
      })

      it('should handle min/max bounds', () => {
        const minColor = getValueColorFromGradient(0, 0, 100)
        const maxColor = getValueColorFromGradient(100, 0, 100)
        // Sending this to upper case, as the color values are in lower case
        expect(minColor.toUpperCase()).toBe(baseColors.primaryGreen)
        expect(maxColor.toUpperCase()).toBe(baseColors.primaryRed)
      })
    })
  })
})