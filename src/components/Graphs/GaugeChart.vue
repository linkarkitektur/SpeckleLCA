<template>
	<div ref="container" class="w-full h-full justify-items-center relative">
		<svg ref="svg" class="h-full w-full pt-4"></svg>
		<div
			ref="tooltip"
			class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5 opacity-0 pointer-events-none"
		></div>
	</div>
</template>

<script lang="ts">
	import * as d3 from 'd3'
	import {
		ref,
		reactive,
		onMounted,
		watch,
		onBeforeUnmount,
		type PropType
	} from 'vue'

	// (Optional) Reuse your existing utility functions for tooltips, color, watchers, etc.
	import { createTooltip, createMouseEventHandlers } from '@/utils/chartUtils'

	import { roundNumber } from '@/utils/mathUtils'
	import { useResultStore } from '@/stores/resultStore'

	// Adjust these imports/types to match your actual code base
	import type { ChartData, ChartOptions } from '@/models/chartModel'
	import { lightenHSLColor } from '@/utils/colorUtils'

	export default {
		name: 'ArcProgressBar',
		props: {
			// For consistency with your existing pattern, we can keep the same "data" & "options" props
			// or define them more specifically for an arc progress bar.
			data: {
				type: Array as PropType<ChartData[]>,
				required: false,
				default: () => []
			},
			options: {
				type: Object as PropType<ChartOptions>,
				default: () => ({})
			}
		},
		setup(props) {
			const resultStore = useResultStore()

			const svg = ref<SVGSVGElement | null>(null)
			const tooltip = ref<HTMLDivElement | null>(null)
			const container = ref<HTMLDivElement | null>(null)

			// 1. Clear the SVG so we don’t get overlaps on redraw
			const clearSVG = () => {
				if (svg.value) {
					while (svg.value.firstChild) {
						svg.value.removeChild(svg.value.firstChild)
					}
				}
			}

			// 2. Draw or redraw the chart
			const draw = () => {
				clearSVG()

				// Merge default size with user options
				const options: ChartOptions = {
					width: svg.value?.clientWidth || 0,
					height: svg.value?.clientHeight || 0,
					...props.options
				}

				// The data for an ArcProgressBar might be a single object or array with
				// currentValue, minValue, maxValue, etc. Adapt to your needs:
				// Example: We'll assume props.data[0] holds the relevant value
				const data: ChartData[] = props.data

				// Build the chart
				const { drawChart } = ArcProgressChart(data, options)
				if (svg.value && tooltip.value && container.value) {
					drawChart(svg.value, tooltip.value, container.value)
					// Update container size
					container.value.style.width = `${options.width}px`
					container.value.style.height = `${options.height}px`
				}
			}

			// 3. Optional: handle keydown for “Escape” or other
			const onKeydown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					resultStore.setReloadData(true)
					draw()
				}
			}

			// 4. onMounted: draw once and observe for resizing
			onMounted(() => {
				draw()
				const resizeObserver = new ResizeObserver(draw)
				if (svg.value) {
					resizeObserver.observe(svg.value)
				}

				document.addEventListener('keydown', onKeydown)
			})

			onBeforeUnmount(() => {
				document.removeEventListener('keydown', onKeydown)
			})

			// 5. Watch data changes
			watch(
				() => props.data,
				() => {
					if (resultStore.reloadChartData) {
						draw()
					}
				}
			)

			return {
				svg,
				tooltip,
				container
			}
		}
	}

	/**
	 * Factory function to build the ArcProgressBar's drawChart method,
	 */
	function ArcProgressChart(data: ChartData[], options: ChartOptions = {}) {
		// 1. Setup geometry
		const width = options.width || 1200
		const height = options.height || 600
		const margin = reactive(
			options.margin || { top: 20, right: 20, bottom: 20, left: 20 }
		)

		const unit = options.unit ? options.unit : 'kgCO2/m2'
		let color = options.colors ? options.colors[0] : '#00A63E'

		// Compute the chart’s “inner” width/height
		const w = width - margin.left - margin.right
		const h = height - margin.top - margin.bottom

		const startAngle = degreesToRadians(-60)
		const endAngle = degreesToRadians(60)

		// ChartOptions add this
		const minValue = 0
		const maxValue = 100

		//This needs to be aggregated from the data
		const currentValue = 150
		let arcValue = maxValue
		if (currentValue > maxValue) {
			arcValue = currentValue
			color = 'hsl(11.9, 60%, 58.82%)'
		}

		const valueScale = d3
			.scaleLinear()
			.domain([minValue, arcValue])
			.range([startAngle, endAngle])
			.clamp(true)

		// 2. Arc generator
		const arcGenerator = d3.arc<{
			innerRadius: number
			outerRadius: number
			startAngle: number
			endAngle: number
		}>()

		// The thickness of the arc
		const arcThickness = options.strokeWidth ?? 40

		// Outer radius
		const outerRadius = Math.min(w, h) / 1
		const innerRadius = outerRadius - arcThickness

		// 3. The main draw function
		function drawChart(
			svgEl: SVGSVGElement,
			tooltipEl: HTMLDivElement,
			containerEl: HTMLDivElement
		) {
			if (!svgEl || !tooltipEl || !containerEl) return

			const graph = d3.select(svgEl)
			// Optional: create tooltip with your existing utility
			const tooltipDiv = createTooltip(tooltipEl)
			const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(
				tooltipDiv,
				containerEl
			)

			// a) Draw a background arc (the “track”)
			const backgroundArcPath = arcGenerator({
				innerRadius,
				outerRadius,
				startAngle,
				endAngle
			})

			const shadowArcPath = arcGenerator({
				innerRadius: innerRadius - 5,
				outerRadius: outerRadius + 5,
				startAngle,
				endAngle
			})

			// b) Draw a foreground arc that depends on currentValue
			const currentAngle = valueScale(currentValue)

			// Calculate the new center of the Arc
			const scaleFactor = 1.75
			const centerX = margin.left + w / 2
			const centerY =
				margin.top + outerRadius + (h - margin.top - margin.bottom) / 0.9
			const arcGroup = graph.append('g')
			arcGroup.attr(
				'transform',
				`translate(${centerX}, ${centerY}) scale(${scaleFactor})`
			)

			// Append background arcs
			const bgColor = '#C1C4C1'
			arcGroup
				.append('path')
				.attr('class', 'arc-shadow')
				.attr('d', shadowArcPath || '')
				.attr('fill', lightenHSLColor(bgColor, 0.5))
				.attr('opacity', 0.5)

			arcGroup
				.append('path')
				.attr('class', 'arc-background')
				.attr('d', backgroundArcPath || '')
				.attr('fill', bgColor)

			const shadowArc = arcGroup
				.append('path')
				.attr('class', 'arc-shadow')
				.attr('d', shadowArcPath || '')
				.attr('fill', lightenHSLColor(color, 2))
				.attr('opacity', 0.5)

			// e) Foreground arc (progress)
			const foregroundArc = arcGroup
				.append('path')
				.attr('class', 'arc-foreground')
				.attr('fill', color)
				.attr(
					'd',
					arcGenerator({
						innerRadius,
						outerRadius,
						startAngle,
						endAngle: startAngle
					})
				)
				// Attach mouse events for tooltip (optional)
				.on('mouseover', (event) => {
					mouseover(event, { value: currentValue })
				})
				.on('mousemove', (event) => {
					mousemove(event, { value: currentValue })
				})
				.on('mouseleave', (event) => {
					mouseleave(event, { value: currentValue })
				})

			// Animate the foregroundArc to its full value using a transition
			foregroundArc
				.transition()
				.duration(3000)
				.attrTween('d', function () {
					const interpolate = d3.interpolate(startAngle, currentAngle)
					return function (t) {
						return arcGenerator({
							innerRadius,
							outerRadius,
							startAngle,
							endAngle: interpolate(t)
						})
					}
				})
				.styleTween('opacity', function () {
					return d3.interpolate(0, 1)
				})
				.ease(d3.easeElasticOut.period(0.8).amplitude(3))

			//Mimc it with the shadow
			shadowArc
				.transition()
				.duration(3000)
				.attrTween('d', function () {
					const interpolate = d3.interpolate(startAngle, currentAngle)
					return function (t) {
						return arcGenerator({
							innerRadius: innerRadius - 5,
							outerRadius: outerRadius + 5,
							startAngle,
							endAngle: interpolate(t)
						})
					}
				})
				.styleTween('opacity', function () {
					// Tween from the shadow's initial opacity (0.5) to 0.5 so it remains consistent,
					// or you could adjust it if desired.
					return d3.interpolate(0, 0.5)
				})
				.ease(d3.easeElasticOut.period(0.8).amplitude(3))

			arcGroup
				.append('text')
				.attr('class', 'arc-center-text')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('transform', `translate(0, ${(h / 1.73) * -1})`)
				.attr('font-size', 16)
				.html(
					`${roundNumber(currentValue, 1)}
        <tspan style="font-size: 10px;"> ${unit}</tspan> / 
        ${maxValue}<tspan style="font-size: 10px;"> 
        ${unit}</tspan>`
				)

			// After drawing your arcs, add a threshold marker if currentValue > maxValue
			if (currentValue > maxValue) {
				const thresholdAngle = valueScale(maxValue)
				const markerRadius = innerRadius + (outerRadius - innerRadius) / 2
				// Calculate the point on  arc.
				const pointX = markerRadius * Math.cos(thresholdAngle - Math.PI / 2)
				const pointY = markerRadius * Math.sin(thresholdAngle - Math.PI / 2)

				// Calculate the vector
				const radX = Math.cos(thresholdAngle - Math.PI / 2)
				const radY = Math.sin(thresholdAngle - Math.PI / 2)

				const markerLength = arcThickness * 1.5
				const x1 = pointX - radX * (markerLength / 2)
				const y1 = pointY - radY * (markerLength / 2)
				const x2 = pointX + radX * (markerLength / 2)
				const y2 = pointY + radY * (markerLength / 2)

				// Append the marker line
				arcGroup
					.append('line')
					.attr('class', 'threshold-marker')
					.attr('x1', x1)
					.attr('y1', y1)
					.attr('x2', x2)
					.attr('y2', y2)
					.attr('stroke', '#f00')
					.attr('stroke-width', 2)
			}
		}

		// Utility function to convert degrees to radians
		function degreesToRadians(degrees: number): number {
			return (degrees * Math.PI) / 180
		}

		// Return the standard structure
		return { drawChart }
	}
</script>

<style scoped></style>
