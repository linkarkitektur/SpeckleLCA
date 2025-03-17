<template>
  <div ref="container" class="relative w-full h-full flex flex-col">
    <!-- Labels above -->
    <div class="w-full flex-none h-[30%]">
      <svg ref="topLabels" class="w-full h-full"></svg>
    </div>

    <!-- Main graph with rounded corners -->
    <div class="styled-element hoverable-styling overflow-hidden w-full flex-auto h-[40%]">
      <svg ref="svg" class="w-full h-full"></svg>
    </div>

    <!-- Labels below -->
    <div class="w-full flex-none h-[30%]">
      <svg ref="bottomLabels" class="w-full h-full"></svg>
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import chroma from 'chroma-js'
import { createTooltip, createMouseEventHandlers, createDiagonalPattern, chartBaseStyle } from '@/utils/chartUtils'
import { getValueColorFromGradient } from '@/utils/colorUtils'
import type { ChartData, ChartOptions, PatternOptions } from '@/models/chartModels'

// Props with defaults
interface Props {
  data?: ChartData[]
  options?: ChartOptions
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: () => ({})
})

// Refs
const svg = ref<SVGSVGElement | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const topLabels = ref<SVGSVGElement | null>(null)
const bottomLabels = ref<SVGSVGElement | null>(null)

// Default margins
const margin = reactive({
  top: props.options?.margin?.top ?? 10,
  right: props.options?.margin?.right ?? 10,
  bottom: props.options?.margin?.bottom ?? 25,
  left: props.options?.margin?.left ?? 10
})

// Clear functions
const clearSVG = () => {
  if (svg.value) {
    while (svg.value.firstChild) {
      svg.value.removeChild(svg.value.firstChild)
    }
  }
}

const clearLabels = () => {
  [topLabels.value, bottomLabels.value].forEach(svg => {
    if (svg) {
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild)
      }
    }
  })
}

const draw = () => {   
  clearSVG()
  clearLabels()

  const options: ChartOptions = { 
    width: svg.value?.clientWidth, 
    height: svg.value?.clientHeight, 
    ...props.options 
  }

  const data: ChartData[] = props.data || []

  const { drawChart, drawLabels } = stackedBarChart(data, options)
  if (svg.value && tooltip.value && container.value) {
    drawChart(svg.value, tooltip.value, container.value)
    drawLabels(topLabels.value, bottomLabels.value)
  }
}

onMounted(() => {
  draw()
  const resizeObserver = new ResizeObserver(draw)
  resizeObserver.observe(svg.value)
})

watch(
  () => props.data,
  () => {
    draw()
  }
)

function stackedBarChart(data: ChartData[], options: ChartOptions = {}) {
  const getWidth = () => svg.value?.clientWidth ?? 800
  const getHeight = () => svg.value?.clientHeight ?? 600

  const total = ref(d3.sum(data, d => d.value > 0 ? d.value : 0))
  const totalAbs = ref(d3.sum(data, d => Math.abs(d.value)))
  const { groupData, zeroPoint } = groupDataFunc(data, total, options)

  const unit = options.unit || ''

  const colors = ref(options.colors || 
    groupData.map(d => 
      getValueColorFromGradient(d.value, 0, Math.max(...groupData.map(d => d.value).filter(value => !isNaN(value))))
    ))

  // Update scale to use computed width
  const xScale = computed(() => d3.scaleLinear()
    .domain([0, totalAbs.value])
    .range([0, getWidth()]))

  const width = getWidth()
  const height = getHeight()

  const drawChart = (svg: SVGSVGElement, tooltipElement: HTMLDivElement, containerElement: HTMLDivElement) => {
    if (!svg || !tooltipElement || !containerElement) return
    
    const graph = d3.select(svg)
      .attr('width', width)
      .attr('height', height)

    // Create tooltips
    const tooltipDiv = createTooltip(tooltipElement)
        
    // Mouse event handlers
    const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(tooltipDiv, containerElement)

    // Text mouseover join
    const addTextWithTooltip = (textElement: d3.Selection<SVGTextElement, ChartData, SVGGElement, unknown>) => {
      textElement
        .on("mouseover", function(this: SVGTextElement, event, d) {
          d3.select(this).style("font-weight", "normal")
          d3.select(this.parentNode!.querySelector<SVGRectElement>('rect')).style("stroke", "black").style("opacity", 1)
        })
        .on("mouseleave", function(this: SVGTextElement, event, d) {
          d3.select(this).style("font-weight", "normal")
          d3.select(this.parentNode!.querySelector<SVGRectElement>('rect')).style("stroke", "none").style("opacity", 0.8)
        })
    }

    // Graph join
    const join = graph.selectAll<SVGGElement, ChartData>('g')
      .data(groupData)
      .join('g')

    // Draw the bars
    join.append('rect')
      .attr('class', 'cursor-pointer transition-all duration-200')
      .attr('x', d => xScale.value(d.cumulative as number))
      .attr('y', 0)
      .attr('height', height)
      .attr('width', d => xScale.value(Math.abs(d.value)))
      .call(chartBaseStyle)
      .attr("fill", function(d, i) {
        const patternOptions: PatternOptions = {
          size: 8,
          lineWidth: 3,
          fill: d.value > 0
        }
        const patternId = createDiagonalPattern(graph, d.label, colors.value[i], patternOptions)

        return `url(#${patternId})`
      })
      .on("mouseover", function(event, d) {
        mouseover(event, d)
      })
      .on("mousemove", mousemove)
      .on("mouseleave", function(event, d) {
        mouseleave(event, d)
      })

    // Add the value texts
    addTextWithTooltip(
      join.append('text')
        .filter(d => Math.abs(d.percent) > 5)
        .attr('class', 'styled-data font-bold')
        .attr('text-anchor', 'middle')
        .attr('x', d => xScale.value(d.cumulative as number) + (xScale.value(Math.abs(d.value)) / 2))
        .attr('y', (height / 2) + 5)
        .style('fill', (d, i) => chroma(colors.value[i]).darken(6))
        .each(function(this: SVGTextElement, d) {
          const text = d3.select(this)
          
          text.append('tspan')
            .text(d.value.toString());

          text.append('tspan')
            .attr('class', 'text-xs')
            .text(" " + unit);
        })
    )
    
    // Only add zeroPoint line if its bigger than 0
    if (zeroPoint > 0) {
      // Add the zeroPoint line
      graph.append('line')
        .attr('x1', xScale.value(zeroPoint as number))
        .attr('x2', xScale.value(zeroPoint as number))
        .attr('y1', 0)
        .attr('y2', height + 5)
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 5,5)

      // Add zeroPoint label
      join.append('text')
        .attr('class', 'styled-data')
        .attr('text-anchor', 'left')
        .attr('x', xScale.value(zeroPoint as number) + 5)
        .attr('y', (height / 2) + 5)
        .style('fill', 'black')
        .style('font-weight', '300')
        .text(0)
    }
  }
  
  // Labels
  const drawLabels = (topSvg: SVGSVGElement, bottomSvg: SVGSVGElement) => {
    const width = getWidth()
    
    const topGraph = d3.select(topSvg)
      .attr('width', width)
    
    const bottomGraph = d3.select(bottomSvg)
      .attr('width', width)

    // Draw percentages on top
    topGraph.selectAll('text')
      .data(groupData.filter(d => Math.abs(d.percent) > 5))
      .join('text')
      .attr('class', 'styled-headers')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale.value(d.cumulative as number) + (xScale.value(Math.abs(d.value)) / 2) + margin.left)
      .attr('y', margin.top + 15)
      .style('fill', (d, i) => chroma(colors.value[i]).darken(2))
      .text(d => d3.format('.1f')(d.percent) + ' %')
    
    // Add the labels at the bottom
    bottomGraph.selectAll('text')
      .data(groupData.filter(d => Math.abs(d.percent) > 5))
      .join('text')
      .attr('class', 'styled-headers')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale.value(d.cumulative as number) + (xScale.value(Math.abs(d.value)) / 2))
      .attr('y', margin.bottom)
      .style('fill', (d, i) => chroma(colors.value[i]).darken(2))
      .text(d => d.label)
  }

  return { drawChart, drawLabels }
}

// Memoized data formatting with caching
const groupedCache = ref<Record<string, { groupData: ChartData[], zeroPoint: number }>>({})

const groupDataFunc = (data: ChartData[], total: { value: number }, options: ChartOptions = {}) => {
  const cacheKey = JSON.stringify({
    labels: data.map(d => d.label),
    values: data.map(d => d.value),
    total: total.value,
    unit: options.unit
  })

  if (groupedCache.value[cacheKey]) {
    return groupedCache.value[cacheKey]
  }

  let cumulative = 0
  let zeroPoint = 0

  // Sort data using more efficient numeric comparison
  const sortedData = data.slice().sort((a, b) => {
    const valueDiff = Math.sign(a.value) - Math.sign(b.value)
    return valueDiff !== 0 ? valueDiff : a.label.localeCompare(b.label)
  })

  const _data = sortedData.map(d => {
    const percent = total.value !== 0 ? (d.value / total.value) * 100 : 0
    const result = {
      value: d.value,
      cumulative: cumulative,
      label: d.label,
      percent: percent,
      tooltipContent: `${d.label}: ${d.value} ${options.unit || ' kg CO2e'}`
    }
    cumulative += Math.abs(d.value)
    return result
  }).filter(d => d.value !== 0)

  zeroPoint = d3.sum(_data.filter(d => d.value < 0), d => Math.abs(d.value))
  
  const result = { groupData: _data, zeroPoint }
  groupedCache.value[cacheKey] = result
  return result
}
</script>