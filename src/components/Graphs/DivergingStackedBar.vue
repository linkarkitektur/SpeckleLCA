<template>
  <div ref="container" class="relative w-full h-full min-h-0 flex flex-col gap-4">
    <div 
      v-for="(group, index) in groupNames" 
      :key="group"
      class="w-full flex items-center relative"
      :style="{height: `${svgHeight[index]}px`}"
    >
      <div class="styled-data flex-none w-20 pr-2 text-sm">
        {{ group }}
      </div>
      
      <div 
        class="styled-element hoverable-styling overflow-hidden h-full" 
        :style="{ 
          width: `${svgWidths[index]}px`,
          transform: `translateX(${zeroOffsets[index]}px)`
        }"
      >
        <svg 
          :ref="el => { if (el) barSvgs[index] = el as SVGSVGElement }"
          class="w-full h-full"
        ></svg>
      </div>
    </div>

    <div 
      ref="tooltip" 
      class="styled-element hoverable-xs absolute z-50 p-2 bg-neutral-100 opacity-0 pointer-events-none transition-opacity duration-200"
    />
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { ref, computed, onMounted, watch } from 'vue'
import { getValueColorFromGradient } from '@/utils/colorUtils'
import { 
  createTooltip, 
  createMouseEventHandlers,
  createDiagonalPattern,
  chartBaseStyle
} from '@/utils/chartUtils'
import type { ChartOptions, NestedChartData, PatternOptions } from '@/models/chartModels'
import { roundNumber } from '@/utils/math'

const props = defineProps<{ data?: NestedChartData[], options?: ChartOptions }>()

const container = ref<HTMLDivElement | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const barSvgs = ref<SVGSVGElement[]>([])
const svgWidths = ref<number[]>([])

// Create computed properties for container and available width calculations:
const containerWidth = computed(() => container.value ? container.value.clientWidth : 0)
const availableWidth = computed(() => containerWidth.value - 150)

const groupNames = computed(() => props.data?.map(d => d.label) || [])

const globalTotal = computed(() => 
  d3.max(props.data?.map(group => 
    d3.sum(group.value, d => Math.abs(d.value))
  )) || 0
)

const zeroOffsets = computed(() => {
  if (!props.data) return []

  const maxNegative = d3.max(props.data.map(group => 
    d3.sum(group.value.filter(d => d.value < 0), d => Math.abs(d.value))
  )) || 0

  return props.data.map(group => {
    const negativeSum = d3.sum(group.value.filter(d => d.value < 0), d => Math.abs(d.value))
    const total = d3.sum(group.value, d => Math.abs(d.value))
    const scale = total / globalTotal.value

    const negativeWidth = (negativeSum / total) * scale * availableWidth.value
    const maxNegativeWidth = (maxNegative / total) * scale * availableWidth.value

    return -negativeWidth + maxNegativeWidth
  })
})

const svgHeight = computed(() => {
  let height = container.value?.clientHeight / groupNames.value.length - 15
  if (height > 50)
    height = 50
  if (height < 10)
    height = 10
  return new Array(groupNames.value.length).fill(height)
})

const draw = () => {   
  barSvgs.value.forEach(svg => svg.innerHTML = '')

  const data = props.data || []
  svgWidths.value = new Array(data.length).fill(0)

  barSvgs.value.forEach((svg, index) => {
    if (!svg) return
    const width = calculateGroupWidth(data[index])
    svgWidths.value[index] = width
    drawBarGroup(svg, data[index])
  })
}

const drawBarGroup = (svg: SVGSVGElement, groupData: NestedChartData) => {
  const groupTotal = d3.sum(groupData.value, d => Math.abs(d.value))
  const scale = groupTotal / globalTotal.value
  const width = scale * availableWidth.value

  svgWidths.value[groupNames.value.indexOf(groupData.label)] = width

  const rowHeight = svg.parentElement?.clientHeight
  
  const positiveData = groupData.value.filter(d => d.value >= 0).sort((a, b) => b.value - a.value)
  const negativeData = groupData.value.filter(d => d.value < 0).sort((a, b) => a.value - b.value)

  let negativeOffset = 0
  const negativeSeriesData = negativeData.map(d => {
    const item = { ...d, start: negativeOffset, end: negativeOffset + Math.abs(d.value) }
    negativeOffset += Math.abs(d.value)
    return item
  })

  let positiveOffset = negativeOffset
  const positiveSeriesData = positiveData.map(d => {
    const item = { ...d, start: positiveOffset, end: positiveOffset + d.value }
    positiveOffset += d.value
    return item
  })

  const seriesData = [...negativeSeriesData, ...positiveSeriesData].map(d => ({
    ...d,
    tooltipContent: `${d.label}: ${roundNumber(d.value, 2)} ${props.options?.unit || 'kg CO2e'}`
  }))


  const xScale = d3.scaleLinear().domain([0, positiveOffset]).range([0, width])

  const graph = d3.select(svg)

  const bars = graph.selectAll('rect')
    .data(seriesData)
    .join('rect')
    .attr('x', d => xScale(d.start))
    .attr('y', 0)
    .attr('width', d => Math.abs(xScale(d.end) - xScale(d.start)))
    .attr('height', rowHeight)
    .attr('class', 'cursor-pointer transition-all duration-200')
    .call(chartBaseStyle)
    .attr("fill", d => {
      const color = getValueColorFromGradient(d.value, -globalTotal.value/2, globalTotal.value/2)
      const patternOptions: PatternOptions = { size: 8, lineWidth: 3, fill: d.value > 0 }
      const patternId = createDiagonalPattern(graph, `${d.phase}-${Math.random().toString(36)}`, color, patternOptions)
      return `url(#${patternId})`
    })

  if (tooltip.value && container.value) {
    
    const tooltipDiv = createTooltip(tooltip.value)
    const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(tooltipDiv, container.value)

    bars.on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
  }
}

const calculateGroupWidth = (groupData: NestedChartData) => {
  if (!groupData?.value?.length) return 0
  const total = d3.sum(groupData.value, d => Math.abs(d.value))
  return Math.max(100, (total / globalTotal.value) * (availableWidth.value))
}

onMounted(() => {
  draw()
  const resizeObserver = new ResizeObserver(draw)
  if (container.value) {
    resizeObserver.observe(container.value)
  }
})

watch(() => props.data, draw)
</script>
