import * as d3 from 'd3'
import { roundNumber } from '@/utils/mathUtils'
import type {
	ChartData,
	ChartOptions,
	PatternOptions
} from '@/models/chartModel'
import type { Selection } from 'd3'

import { useProjectStore } from '@/stores/projectStore'

export const chartBaseStyle = (
	selection: Selection<any, unknown, null, undefined>
) => {
	return selection
		.attr('stroke', 'black') // Colored stroke on negative value
		.attr('stroke-width', 1)
		.attr('stroke-linejoin', 'miter')
		.attr('pointer-events', 'all')
		.attr('cursor', 'pointer')
}

/**
 * For use with aggregate charts, places the total value in the center of the chart
 * @param graph
 * @param total
 * @param w
 * @param h
 * @param unit
 * @returns
 */
export function aggregateCenter(
	graph: d3.Selection<SVGElement>,
	total: number,
	w: number,
	h: number,
	unit: string
) {
	const textElement = graph
		.append('text')
		.attr('class', 'center-text styled-header')
		.attr('text-anchor', 'middle')
		.attr('dy', '0.35em')
		.attr('x', w / 2)
		.attr('y', h / 2)

	textElement
		.append('tspan')
		.text(roundNumber(total, 1))
		.classed('styled-header', true)
		.attr('x', w / 2)
		.attr('dy', '-0.2em')
	textElement
		.append('tspan')
		.text(unit)
		.classed('styled-data', true)
		.attr('x', w / 2)
		.attr('dy', '1.2em')
	return textElement
}

/**
 * Add centertext of percentage that is within span.
 * @param graph
 * @param span Span to check within like [50, 100]
 * @param value This is the value we check is within span, like DL results
 * @param graphValue This is the actual value that we calculate percentage from like m2
 * @param w Width
 * @param h Height
 */
export function spanPercentCenter(
	graph: d3.Selection<SVGElement>,
	span: number[],
	value: number[],
	graphValue: number[],
	w: number,
	h: number
) {
	span.sort((a, b) => a - b)
	const result = checkValuesInSpan(value, span[0], span[1])
	const spanPercent = calculatePercent(result, graphValue)
	const textElement = graph
		.append('text')
		.attr('class', 'center-text styled-header')
		.attr('text-anchor', 'middle')
		.attr('dy', '0.35em')
		.attr('x', w / 2)
		.attr('y', h / 2)

	textElement
		.append('tspan')
		.text(`${span[0]} - ${span[1]}`)
		.classed('styled-header', true)
		.attr('x', w / 2)
		.attr('dy', '-0.2em')
	textElement
		.append('tspan')
		.text(`${spanPercent}%`)
		.classed('styled-data', true)
		.attr('x', w / 2)
		.attr('dy', '1.2em')
	return textElement

	function isValueInSpan(
		value: number,
		spanStart: number,
		spanEnd: number
	): boolean {
		return value >= spanStart && value <= spanEnd
	}

	function checkValuesInSpan(
		values: number[],
		spanStart: number,
		spanEnd: number
	): boolean[] {
		return values.map((value) => isValueInSpan(value, spanStart, spanEnd))
	}

	function calculatePercent(result: boolean[], graphValues: number[]): number {
		const filteredSum = result.reduce((sum, isTrue, index) => {
			return isTrue ? sum + graphValues[index] : sum
		}, 0)
		const totalSum = graphValues.reduce((sum, value) => sum + value, 0)
		if (totalSum === 0) return 0
		return Math.round((filteredSum / totalSum) * 100)
	}
}

export function parameterCenter(
	graph: d3.Selection<SVGElement>,
	parameterValue: number,
	total: number,
	w: number,
	h: number
) {
	const textElement = graph
		.append('text')
		.attr('class', 'center-text styled-header')
		.attr('text-anchor', 'middle')
		.attr('dy', '0.35em')
		.attr('x', w / 2)
		.attr('y', h / 2)

	textElement
		.append('tspan')
		.text(parameterValue)
		.classed('styled-data', true)
		.attr('x', w / 2)
		.attr('dy', '-0.2em')
	return textElement
}

/**
 * Sets selected objects from charts
 * @param ids to select in viewer
 */
export function updateSelectedObjects(ids: string[]) {
	const projectStore = useProjectStore()
	projectStore.setObjectsById(ids)
}

/**
 * Create the same base chart options and object for all charts
 * TODO: Implement this
 * @param options
 * @param containerElement
 * @returns
 */
export function createBaseChart(
	options: ChartOptions,
	containerElement: HTMLElement
) {
	const width = options.width || 600
	const height = options.height || 400
	const margin = options.margin || { top: 20, right: 20, bottom: 20, left: 20 }

	const svg = d3
		.select(containerElement)
		.append('svg')
		.attr('width', width)
		.attr('height', height)

	return { svg, width, height, margin }
}

/**
 * Creates a style for tooltips of charts
 * @param tooltipElement
 * @returns
 */
export function createTooltip(tooltipElement: HTMLDivElement) {
	return d3
		.select(tooltipElement)
		.classed('styled-data hoverable-xs', true)
		.style('position', 'absolute')
		.style('background-color', 'white')
		.style('border', 'solid')
		.style('border-width', '2px')
		.style('border-radius', '5px')
		.style('padding', '5px')
		.style('opacity', 0)
}

/**
 * Creates generalized mouse event handlers for charts
 * @param tooltipDiv
 * @param container
 * @returns
 */
export function createMouseEventHandlers(
	tooltipDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>,
	container: HTMLElement
) {
	// eslint-disable-next-line
	function mouseover(event: MouseEvent, data: any) {
		const element = d3.select(event.currentTarget)
		const ogStroke = element.style('stroke')
		const ogStrokeWidth = element.style('stroke-width')

		// Store original stroke color
		element.attr('data-original-stroke', ogStroke)
		element.attr('data-original-stroke-width', ogStrokeWidth)

		tooltipDiv.style('opacity', 1)
		d3.select(event.currentTarget)
			.style('stroke', 'black')
			.style('stroke-width', '3')
			.style('z-index', '9999')
	}

	function mousemove(event: MouseEvent, data: any) {
		const containerRect = container.getBoundingClientRect()
		const tooltipRect = tooltipDiv.node()!.getBoundingClientRect()

		let left = event.clientX - containerRect.left + 15
		let top = event.clientY - containerRect.top - 28

		// Adjust left and top to keep the tooltip within the container
		if (left + tooltipRect.width > containerRect.width) {
			left = event.clientX - containerRect.left - tooltipRect.width - 15
		}
		if (left < 0) {
			left = 10
		}
		if (top + tooltipRect.height > containerRect.height) {
			top = containerRect.height - tooltipRect.height - 10
		}
		if (top < 0) {
			top = 10
		}

		tooltipDiv
			.html(data.tooltipContent)
			.style('left', `${left}px`)
			.style('top', `${top}px`)
	}

	// eslint-disable-next-line
	function mouseleave(event: MouseEvent, data: any) {
		const element = d3.select(event.currentTarget)
		const ogStroke = element.attr('data-original-stroke')
		const ogStrokeWidth = element.attr('data-original-stroke-width')

		tooltipDiv.style('opacity', 0)
		d3.select(event.currentTarget)
			.style('stroke', ogStroke)
			.style('stroke-width', ogStrokeWidth)
			.attr('data-original-stroke', null)
	}

	return { mouseover, mousemove, mouseleave }
}

/**
 * Process data for charts
 * @param data
 * @param totalValue
 * @returns
 */
export function groupChartData(data: ChartData[], totalValue: number) {
	let cumulative = 0
	return data
		.map((d) => {
			cumulative += Math.abs(d.value)
			const percent = totalValue > 0 ? (d.value / totalValue) * 100 : 0
			return {
				...d,
				cumulative: cumulative - Math.abs(d.value),
				percent
			}
		})
		.filter((d) => d.value !== 0)
}

/**
 * Diagonal fill pattern for charts
 * @param graph SVG element as selection
 * @param id custom id for pattern
 * @param color color to set
 * @param options See PatternOptions
 * @returns defs to be attached to SVG
 */
export function createDiagonalPattern(
	svg: Selection<SVGElement, unknown, null, undefined>,
	id: string,
	color: string,
	options: PatternOptions = {}
) {
	const {
		size = 8,
		rotation = 45,
		lineWidth = 2,
		opacity = 1,
		fill = true
	} = options

	// Ensure we have valid inputs
	if (!svg || !id || !color) {
		console.warn('Invalid inputs for pattern creation')
		return ''
	}

	// Create safe pattern ID
	const safeId = id.replace(/[^a-zA-Z0-9-]/g, '-')
	const patternId = `pattern-${safeId}`

	// Check if pattern already exists
	if (svg.select(`#${patternId}`).size() > 0) {
		return patternId
	}
	// Define pattern
	const defs = svg.append('defs')
	const pattern = defs
		.append('pattern')
		.attr('id', patternId)
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', size)
		.attr('height', size)
		.attr('patternTransform', `rotate(${rotation})`)

	// Add pattern line
	pattern
		.append('line')
		.attr('x1', 0)
		.attr('y1', 0)
		.attr('x2', 0)
		.attr('y2', size)
		.attr('stroke', color)
		//.attr('fill', color)
		.attr('stroke-width', lineWidth)
		.attr('opacity', opacity)

	if (fill) {
		pattern
			.append('rect')
			.attr('width', size)
			.attr('height', size)
			.attr('fill', color)
			.attr('opacity', opacity)
	}

	return patternId
}
