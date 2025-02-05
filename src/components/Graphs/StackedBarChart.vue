<template>
  <div ref="container" class="w-full h-full justify-items-center relative">
    <svg ref="svg" class="w-full h-full"></svg>
    <div ref="tooltip" class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5 pointer-events-none" style="opacity: 0;"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { ref, reactive, onMounted, watch, type PropType } from 'vue'
import chroma from 'chroma-js'

import { 
  createTooltip, 
  createMouseEventHandlers,
} from '@/utils/chartUtils'

import { getValueColorFromGradient } from '@/utils/colorUtils'
import type { ChartData, ChartOptions } from '@/models/chartModels'

export default {
  name: 'StackedBarChart',
  props: {
    data: {
      type: Array as PropType<ChartData[]>,
      required: false
    },
    options: {
      type: Object as PropType<ChartOptions>,
      default: () => ({})
    }
  },
  setup(props) {
    const svg = ref<SVGSVGElement | null>(null)
    const tooltip = ref<HTMLDivElement | null>(null)
    const container = ref<HTMLDivElement | null>(null)
    
    const clearSVG = () => {
      if (svg.value) {
        while (svg.value.firstChild) {
          svg.value.removeChild(svg.value.firstChild)
        }
      }
    }

    const draw = () => {   
      clearSVG()

      const options: ChartOptions = { 
        width: svg.value?.clientWidth, 
        height: svg.value?.clientHeight, 
        ...props.options 
      }

      const data: ChartData[] = props.data || []

      const { drawChart } = stackedBarChart(data, options)
      if (svg.value && tooltip.value && container.value) {
        drawChart(svg.value, tooltip.value, container.value)
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

    return { svg, tooltip, container }
  }
}

function stackedBarChart(data: ChartData[], options: ChartOptions = {}) {
  const width = ref(options.width || 800)
  const height = ref(options.height || 600)
  const barHeight = ref(options.barHeight || height.value / 2)
  const halfBarHeight = ref(barHeight.value / 2)
  const margin = reactive(options.margin || { top: 15, right: 20, bottom: 20, left: 20 })

  const total = ref(d3.sum(data, d => d.value > 0 ? d.value : 0))
  const totalAbs = ref(d3.sum(data, d => Math.abs(d.value)))
  const { groupData, zeroPoint } = groupDataFunc(data, total, options)

  const unit = options.unit || ''

  const colors = ref(options.colors || 
    groupData.map(d => 
      getValueColorFromGradient(d.value, 0, Math.max(...groupData.map(d => d.value).filter(value => !isNaN(value))))
    ))

  const drawChart = (svg: SVGSVGElement, tooltipElement: HTMLDivElement, containerElement: HTMLDivElement) => {
    if (!svg || !tooltipElement || !containerElement) return
    const graph = d3.select(svg)

    const w = width.value - margin.left - margin.right
    const h = height.value * 0.66

    const xScale = d3.scaleLinear()
      .domain([0, totalAbs.value])
      .range([0, w])

    // Create tooltips
    const tooltipDiv = createTooltip(tooltipElement)
        
    // Mouse event handlers
    const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(tooltipDiv, containerElement)

    // Text mouseover join
    const addTextWithTooltip = (textElement: d3.Selection<SVGTextElement, ChartData, SVGGElement, unknown>) => {
      textElement
        .on("mouseover", function(this: SVGTextElement, event, d) {
          mouseover(event, d)
          d3.select(this).style("font-weight", "normal")
          d3.select(this.parentNode!.querySelector<SVGRectElement>('rect')).style("stroke", "black").style("opacity", 1)
        })
        .on("mousemove", function(this: SVGTextElement, event, d) {
          mousemove(event, d)
        })
        .on("mouseleave", function(this: SVGTextElement, event, d) {
          mouseleave(event, d)
          d3.select(this).style("font-weight", "normal")
          d3.select(this.parentNode!.querySelector<SVGRectElement>('rect')).style("stroke", "none").style("opacity", 0.8)
        })
    }

    // Graph join
    const join = graph.selectAll<SVGGElement, ChartData>('g')
      .data(groupData)
      .join('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // Draw the bars
    join.append('rect')
      .attr('class', 'rect-stacked')
      .attr('x', d => xScale(d.cumulative as number))
      .attr('y', h / 2 - halfBarHeight.value)
      .attr('height', barHeight.value)
      .attr('width', d => xScale(Math.abs(d.value)))
      .style('fill', (d, i) => colors.value[i])
      .style('stroke', (d, i) => chroma(colors.value[i]).darken(1))
      .on("mouseover", function(event, d) {
        mouseover(event, d)
      })
      .on("mousemove", function(event, d) {
        mousemove(event, d)
      })
      .on("mouseleave", function(event, d) {
        mouseleave(event, d)
      })

    // Add the value texts
    addTextWithTooltip(
      join.append('text')
        .filter(d => Math.abs(d.percent) > 5)
        .attr('class', 'text-value text-base')
        .attr('text-anchor', 'middle')
        .attr('x', d => xScale(d.cumulative as number) + (xScale(Math.abs(d.value)) / 2))
        .attr('y', (h / 2) + 5)
        .style('fill', (d, i) => chroma(colors.value[i]).darken(2))
        .each(function(this: SVGTextElement, d) {
          const text = d3.select(this)
          
          text.append('tspan')
            .text(d.value.toString());

          text.append('tspan')
            .attr('class', 'text-xs')
            .text(" " + unit);
        })
    )

    // Add the labels
    join.append('text')
      .filter(d => Math.abs(d.percent) > 5)
      .attr('class', 'text-label text-base')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale(d.cumulative as number) + (xScale(Math.abs(d.value)) / 2))
      .attr('y', (h / 2) + (halfBarHeight.value * 1.6))
      .style('fill', (d, i) => chroma(colors.value[i]).darken(2))
      .text(d => d.label)

    // Add the percentages
    join.append('text')
      .filter(d => Math.abs(d.percent) > 5)
      .attr('class', 'text-percent text-base')
      .attr('text-anchor', 'middle')
      .attr('x', d => xScale(d.cumulative as number) + (xScale(Math.abs(d.value)) / 2))
      .attr('y', (h / 2) - (halfBarHeight.value * 1.2))
      .style('fill', (d, i) => chroma(colors.value[i]).darken(2))
      .text(d => d3.format('.1f')(d.percent) + ' %')
    
    // Only add zeroPoint line if its bigger than 0
    if (zeroPoint > 0) {
      // Add the zeroPoint line
      graph.append('line')
        .attr('x1', xScale(zeroPoint as number) + margin.left)
        .attr('x2', xScale(zeroPoint as number) + margin.left)
        .attr('y1', margin.top - 5)
        .attr('y2', h + margin.top + 5)
        .attr('stroke', 'black')
        .attr('stroke-dasharray', '5,5')
        .attr('stroke-width', 3)
        .attr('opacity', 0.5)

      // Add zeroPoint label
      join.append('text')
        .attr('class', 'text-label text-base')
        .attr('text-anchor', 'left')
        .attr('x', xScale(zeroPoint as number) + 5)
        .attr('y', (h / 2) + (halfBarHeight.value * 1.6))
        .style('fill', 'black')
        .style('font-weight', '300')
        .style('opacity', 0.5)
        .text(0)
    }
  }

  return { drawChart }
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

<style>
.rect-stacked {
  cursor: pointer;
}

.tooltip {
  pointer-events: none;
  position: absolute;
  background-color: white;
  border: 1px solid gray;
  padding: 10px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}
</style>
