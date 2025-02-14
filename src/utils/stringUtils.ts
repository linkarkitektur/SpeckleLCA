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

/**
 * Find first number in string and returns it
 * @param str string to check
 * @returns number defaults to 0
 */
export function extractFirstNumber(str: string): number {
  const match = str.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

/**
 * Splits and then normalizes any superscript in a unit string
 * @param unit unit string to split at / and then remove superscript
 * @returns object with numerator and denominator
 */
export function splitAndNormalizeUnit(unit: string): { numerator: string; denominator: string } {
  // Map of superscript numbers to their normal form Might be a smarter way?
  const superscriptMap: Record<string, string> = {
    "²": "2",
    "³": "3",
  }

  // Split at / maybe we make this dynamic? Not needed for now
  const [numerator, denominator] = unit.split("/")
  const normalizedDenominator = denominator
    ? denominator.replace(/[²³]/g, (match) => superscriptMap[match] || match).trim()
    : ""

  return {
    numerator: numerator.trim(),
    denominator: normalizedDenominator,
  }
}