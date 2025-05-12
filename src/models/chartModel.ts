/**
 * Standard chart options interface
 */
export interface ChartOptionsBase {
	title?: string
	unit?: string
	width?: number
	height?: number
	barHeight?: number
	margin?: { top: number; right: number; bottom: number; left: number }
	colors?: string[] // As hex
	stroke?: string
	strokeWidth?: number
	innerRadius?: number
	sort?: boolean
}

/**
 * Union for exclusive chart options
 * @param aggregate: boolean to calc aggregate
 * @param spanPercent: number[] span to check percent of values within
 * @param parameterValue: Precalculated number of parameter values within objects
 */
export type ChartOptions = ChartOptionsBase &
	(
		| { aggregate?: true; spanPercent?: undefined; parameterValue?: undefined }
		| {
				aggregate?: undefined
				spanPercent?: number[]
				parameterValue?: undefined
		  }
		| {
				aggregate?: undefined
				spanPercent?: undefined
				parameterValue?: number
		  }
	)

/**
 * Standard chart data interface
 * @param label: string
 * @param value: number
 * @param graphValue optional: number to show on graphs (like m2)
 * @param ids optional: string[]
 * @param cumulative optional: number
 * @param percent optional: number
 */
export interface ChartData {
	label: string
	value: number
	graphValue?: number
	ids?: string[]
	cumulative?: number
	percent?: number
}

/**
 * Combined chart data interface
 * For use with nested data sets
 */
export interface NestedChartData {
	label: string
	value: ChartData[]
}

/**
 * Pattern Options for charts diagonal hatching
 */
export interface PatternOptions {
	size?: number
	rotation?: number
	lineWidth?: number
	opacity?: number
	fill?: boolean
}
