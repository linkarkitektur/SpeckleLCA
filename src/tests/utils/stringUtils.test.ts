import { describe, it, expect } from 'vitest'
import { truncateText, getTextAfterLastDot } from '@/utils/stringUtils'

describe('stringUtils', () => {
  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
    })

    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncateText('', 5)).toBe('')
    })

    it('should handle exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
    })

    it('should handle special characters', () => {
      expect(truncateText('Hello@World', 6)).toBe('Hello@...')
    })
  })

  describe('getTextAfterLastDot', () => {
    it('should return text after last dot', () => {
      expect(getTextAfterLastDot('Objects.BuiltElements.Wall')).toBe('Wall')
    })

    it('should return original text if no dots', () => {
      expect(getTextAfterLastDot('Wall')).toBe('Wall')
    })

    it('should handle string with single dot', () => {
      expect(getTextAfterLastDot('Objects.Wall')).toBe('Wall')
    })

    it('should handle empty string', () => {
      expect(getTextAfterLastDot('')).toBe('')
    })

    it('should handle non-string input', () => {
      expect(getTextAfterLastDot(null as any)).toBe(null)
      expect(getTextAfterLastDot(undefined as any)).toBe(undefined)
    })

    it('should handle string ending with dot', () => {
      expect(getTextAfterLastDot('Objects.Wall.')).toBe('')
    })
  })
})