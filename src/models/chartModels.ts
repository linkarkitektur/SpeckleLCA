/**
 * Standard chart options interface
 */
export interface ChartOptions {
  title?: string
  width?: number
  height?: number
  barHeight?: number
  margin?: { top: number, right: number, bottom: number, left: number }
  colors?: string[]
  stroke?: string
  strokeWidth?: number
  innerRadius?: number
}

/**
 * Standard chart data interface
 * @param label: string
 * @param value: number
 * @param ids optional: string[]
 * @param cumulative optional: number
 * @param percent optional: number
 */
export interface ChartData {
  label: string
  value: number
  ids?: string[]
  cumulative?: number
  percent?: number
}
