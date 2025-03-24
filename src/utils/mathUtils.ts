/**
 * Simple rounding function, how can this not be standard rounding in js!?
 * @param num 
 * @param decimals 
 * @returns 
 */
export function roundNumber(num: number, decimals: number): number {
  const rounded = num.toFixed(decimals); // Round to 1 decimal place
  if (rounded.endsWith('.0')) { // Check if it ends with .0
    return parseFloat(rounded.slice(0, -2)) // Remove the .0
  } else if (rounded.endsWith('0')) {
    return parseFloat(rounded.slice(0, -1)) // Remove the trailing 0
  }
  return parseFloat(rounded)
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}