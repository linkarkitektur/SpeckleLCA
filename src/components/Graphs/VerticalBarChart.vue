<template>
	<div
		ref="container"
		class="relative w-full h-full flex flex-row gap-4 items-center"
	>
		<!-- Axes container -->
		<div class="absolute inset-0">
			<svg ref="axesSvg" class="w-full h-full">
				<g ref="xAxis" class="styled-data" />
				<g ref="yAxis" class="styled-data" />
			</svg>
		</div>

		<!-- Bars with div styling -->
		<div
			v-for="(group, index) in groupNames"
			:key="group"
			class="h-full flex relative"
			:style="{
				width: `${svgWidth[index]}px`,
				marginLeft: index === 0 ? `${margin.left + 10}px` : '0px'
			}"
		>
			<div
				class="styled-element hoverable-styling overflow-hidden h-full"
				:style="{
					height: `${svgHeights[index]}px`,
					transform: `translateY(${zeroOffsets[index]}px)`
				}"
			>
				<svg ref="barSvgs" class="w-full h-full"></svg>
			</div>
			<div
				class="relative w-full h-full -left-5"
				:style="{
					height: `${svgHeights[index]}px`,
					transform: `translateY(${zeroOffsets[index]}px)`
				}"
			>
				<label
					v-if="svgHeights[index] > 0"
					class="absolute whitespace-nowrap styled-header pointer-events-none text-xs bg-neutral-100 bg-opacity-60 px-1 rounded-lg"
					:style="{
						left: '50%',
						top: '50%',
						transform: 'translateY(-50%) translateX(-50%) rotate(-50deg)'
					}"
				>
					{{ group.length > 12 ? group.substring(0, 12) + '..' : group }}
				</label>
			</div>
		</div>

		<!-- Tooltip -->
		<div
			ref="tooltip"
			class="styled-element hoverable-xs absolute z-50 p-2 bg-neutral-100 opacity-0 pointer-events-none transition-opacity duration-200"
		/>
	</div>
</template>

<script setup lang="ts">
	import * as d3 from 'd3'
	import { ref, computed, onMounted, watch, nextTick } from 'vue'
	import { getValueColorFromGradient } from '@/utils/colorUtils'
	import {
		createTooltip,
		createMouseEventHandlers,
		createDiagonalPattern,
		chartBaseStyle
	} from '@/utils/chartUtils'
	import type {
		ChartOptions,
		NestedChartData,
		PatternOptions
	} from '@/models/chartModel'
	import { roundNumber } from '@/utils/mathUtils'

	const props = defineProps<{
		data?: NestedChartData[]
		options?: ChartOptions
	}>()

	const container = ref<HTMLDivElement | null>(null)
	const tooltip = ref<HTMLDivElement | null>(null)
	const barSvgs = ref<SVGSVGElement[]>([])
	const svgHeights = ref<number[]>([])
	const axesSvg = ref<SVGSVGElement | null>(null)
	const xAxis = ref<SVGGElement | null>(null)
	const yAxis = ref<SVGGElement | null>(null)
	const groupIndex = ref(0)

	// Check if we have margin settings otherwise use standard
	const margin = props.options?.margin
		? props.options?.margin
		: {
				left: 60
		  }

	const sortedData = computed(() => {
		if (props.options?.sort === false) {
			return props.data || []
		}
		return (props.data || []).slice().sort((a, b) => {
			const totalA = d3.sum(a.value, (d) => Math.abs(d.value))
			const totalB = d3.sum(b.value, (d) => Math.abs(d.value))
			return totalB - totalA
		})
	})

	const groupNames = computed(() => sortedData.value.map((d) => d.label) || [])

	// Create computed properties for container and available width calculations:
	const containerHeight = computed(() => {
		return container.value ? container.value.clientHeight : 0
	})
	const availableHeight = computed(() => containerHeight.value - 20)

	const globalTotal = computed(
		() =>
			d3.max(
				sortedData.value?.map((group) =>
					d3.sum(group.value, (d) => Math.abs(d.value))
				)
			) || 0
	)

	const zeroOffsets = computed(() => {
		if (!sortedData.value) return []

		const maxPositive =
			d3.max(
				sortedData.value.map((group) =>
					d3.sum(
						group.value.filter((d) => d.value > 0),
						(d) => Math.abs(d.value)
					)
				)
			) || 0

		return sortedData.value.map((group) => {
			const positiveSum = d3.sum(
				group.value.filter((d) => d.value > 0),
				(d) => Math.abs(d.value)
			)
			const total = d3.sum(group.value, (d) => Math.abs(d.value))
			const scale = total / globalTotal.value

			const positiveHeight =
				(positiveSum / total) * scale * availableHeight.value
			const maxPositiveHeight =
				(maxPositive / total) * scale * availableHeight.value

			return maxPositiveHeight - positiveHeight
		})
	})

	const svgWidth = computed(() => {
		let width = container.value?.clientWidth / groupNames.value.length - 15
		if (width > 50) width = 50
		if (width < 10) width = 10
		return new Array(groupNames.value.length).fill(width)
	})

	const draw = () => {
		barSvgs.value.forEach((svg) => (svg.innerHTML = ''))

		const data = sortedData.value || []
		svgHeights.value = new Array(data.length).fill(0)

		// Draw axes first
		drawAxes(data)

		barSvgs.value.forEach((svg, index) => {
			if (!svg) return
			groupIndex.value = index
			const height = calculateGroupHeight(data[index])
			svgHeights.value[index] = height
			if (height > 0) drawBarGroup(svg, data[index])
		})
	}

	const drawAxes = (data: NestedChartData[]) => {
		if (axesSvg.value && container.value) {
			const width = container.value.clientWidth
			const height = availableHeight.value

			// Clear previous axes
			d3.select(axesSvg.value).selectAll('*').remove()

			const chart = d3
				.select(axesSvg.value)
				.append('g')
				.attr('transform', `translate(${margin.left}, 0)`)

			// Calculate max values
			const sumPositive =
				d3.max(data, (group) =>
					d3.sum(
						group.value.filter((d) => d.value > 0),
						(d) => d.value
					)
				) || 0

			const sumNegative =
				d3.min(data, (group) =>
					d3.sum(
						group.value.filter((d) => d.value < 0),
						(d) => d.value
					)
				) || 0

			// Create scales
			const yScale = d3
				.scaleLinear()
				.domain([sumNegative, sumPositive])
				.range([height, 0])

			// Add zero line
			chart
				.append('line')
				.attr('x1', 0)
				.attr('x2', width)
				.attr('y1', yScale(0))
				.attr('y2', yScale(0))
				.attr('stroke', 'black')
				.attr('stroke-width', 1)

			// Add axes
			chart
				.append('g')
				.call(
					d3
						.axisLeft(yScale)
						.tickFormat((d) => d.toString())
						.tickSize(-width)
				)
				.call((g) => {
					g.select('.domain').remove()
					g.selectAll('.tick line')
						.attr('stroke', (d) => (d === 0 ? 'black' : '#e5e5e5'))
						.attr('stroke-width', (d) => (d === 0 ? 1 : 0.5))
					g.selectAll('.tick text').classed('styled-data', true)
				})
		}
	}

	const drawBarGroup = (svg: SVGSVGElement, groupData: NestedChartData) => {
		const groupTotal = d3.sum(groupData.value, (d) => Math.abs(d.value))
		const scale = groupTotal / globalTotal.value
		const height = scale * availableHeight.value

		svgHeights.value[groupNames.value.indexOf(groupData.label)] = height

		const rowWidth = svg.parentElement?.clientWidth

		const positiveData = groupData.value
			.filter((d) => d.value >= 0)
			.sort((a, b) => b.value - a.value)
		const negativeData = groupData.value
			.filter((d) => d.value < 0)
			.sort((a, b) => a.value - b.value)

		let positiveOffset = 0
		const positiveSeriesData = positiveData.map((d) => {
			const item = {
				...d,
				start: positiveOffset,
				end: positiveOffset + Math.abs(d.value)
			}
			positiveOffset += Math.abs(d.value)
			return item
		})

		let negativeOffset = positiveOffset
		const negativeSeriesData = negativeData.map((d) => {
			const item = {
				...d,
				start: negativeOffset,
				end: negativeOffset + Math.abs(d.value)
			}
			negativeOffset += Math.abs(d.value)
			return item
		})

		const seriesData = [...negativeSeriesData, ...positiveSeriesData].map(
			(d) => ({
				...d,
				tooltipContent: `${d.label}: ${roundNumber(d.value, 2)} ${
					props.options?.unit || 'kg CO2e'
				}`
			})
		)

		const yScale = d3
			.scaleLinear()
			.domain([0, negativeOffset])
			.range([0, height])

		const graph = d3.select(svg)

		const bars = graph
			.selectAll('rect')
			.data(seriesData)
			.join('rect')
			.attr('x', 0)
			.attr('y', (d) => yScale(d.start))
			.attr('width', rowWidth)
			.attr('height', (d) => Math.abs(yScale(d.end) - yScale(d.start)))
			.attr('class', 'cursor-pointer transition-all duration-200')
			.call(chartBaseStyle)
			// eslint-disable-next-line
			.attr('fill', (d, i) => {
				if (
					props.options?.colors &&
					props.options.colors.length === sortedData.value.length
				) {
					return props.options.colors[groupIndex.value]
				}
				const color = getValueColorFromGradient(
					d.value,
					-globalTotal.value / 2,
					globalTotal.value / 2
				)
				const patternOptions: PatternOptions = {
					size: 8,
					lineWidth: 3,
					fill: d.value > 0
				}
				const patternId = createDiagonalPattern(
					graph,
					`${d.phase}-${Math.random().toString(36)}`,
					color,
					patternOptions
				)
				return `url(#${patternId})`
			})

		if (tooltip.value && container.value) {
			const tooltipDiv = createTooltip(tooltip.value)
			const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(
				tooltipDiv,
				container.value
			)

			bars
				.on('mouseover', mouseover)
				.on('mousemove', mousemove)
				.on('mouseleave', mouseleave)
		}
	}

	const calculateGroupHeight = (groupData: NestedChartData) => {
		if (!groupData?.value?.length) return 0
		const total = d3.sum(groupData.value, (d) => Math.abs(d.value))
		return (total / globalTotal.value) * availableHeight.value
	}

	onMounted(async () => {
		// Wait for nextTick so the divs have formed.
		await nextTick()
		requestAnimationFrame(() => {
			draw()
			const resizeObserver = new ResizeObserver(draw)
			if (container.value) {
				resizeObserver.observe(container.value)
			}
		})
	})

	// Watchers
	watch(props.data, () => {
		nextTick(() => {
			draw()
		})
	})

	watch(groupNames, () => {
		nextTick(() => {
			draw()
		})
	})
</script>
