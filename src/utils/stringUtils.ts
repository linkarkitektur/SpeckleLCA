/**
 * Truncate text down to set length
 * @param text 
 * @param maxLength 
 * @returns 
 */
export function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

/**
 * Returns a text without any dots in them and returning the last text
 * Used for speckleTypes and such to clean them up
 * @param text that should be cleaned 
 * @returns cleaned text with last segement included
 */
export function getTextAfterLastDot(text: string): string {
  if (typeof text !== 'string') {
    return text
  }

  const lastIndex = text.lastIndexOf('.')
  if (lastIndex !== -1) {
      return text.substring(lastIndex + 1)
  }
  return text
}