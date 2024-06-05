/**
 * Standard chart options interface
 */
export interface ChartOptions {
  width?: number
  height?: number
  barHeight?: number
  margin?: { top: number, right: number, bottom: number, left: number }
  colors?: string[]
}

/**
 * Standard chart data interface
 * @param label: string
 * @param value: number
 * @param cumulative optional: number
 * @param percent optional: number
 */
export interface ChartData {
  label: string
  value: number
  cumulative?: number
  percent?: number
}
