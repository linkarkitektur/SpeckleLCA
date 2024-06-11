<template>
  <div ref="container" class="w-full h-full justify-items-center relative">
    <svg ref="svg" class="w-full h-full"></svg>
    <div ref="tooltip" class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5" style="opacity: 0;"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { ref, reactive, onMounted, watch, type PropType } from 'vue'
import chroma from 'chroma-js'

import { getValueColorFromGradient } from '@/utils/colors'
import type { ChartData, ChartOptions } from '@/models/chartModels'

const sampleData: ChartData[] = [
  { label: 'A1-A3', value: -55 },
  { label: 'A4', value: 233 },
  { label: 'A5', value: 89 },
  { label: 'C1-C4', value: 50 }
]

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

      const data: ChartData[] = props.data || sampleData

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
      },
      { deep: true }
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
  const { groupData, zeroPoint } = groupDataFunc(data, total)

  const colors = ref(options.colors || 
    groupData.map(d => 
      getValueColorFromGradient(d.value, 0, Math.max(...groupData.map(d => d.value)))
    ))

  const drawChart = (svg: SVGSVGElement, tooltip: HTMLDivElement, container: HTMLDivElement) => {
    if (!svg || !tooltip || !container) return
    const graph = d3.select(svg)

    const w = width.value - margin.left - margin.right
    const h = height.value * 0.66

    const xScale = d3.scaleLinear()
      .domain([0, totalAbs.value])
      .range([0, w])

    // Create tooltip div
    const tooltipDiv = d3.select(tooltip)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("opacity", 0)

    const mouseover = function (event: MouseEvent, data: ChartData) {
      tooltipDiv.style("opacity", 1)
      d3.select(event.currentTarget as Element)
        .style("stroke", "black")
        .style("opacity", 1)
    }

    const mousemove = function (event: MouseEvent, data: ChartData) {
      const containerRect = container.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()

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
        .html(data.label + ": " + data.value)
        .style("left", left + "px")
        .style("top", top + "px")
    }

    const mouseleave = function (event: MouseEvent, data: ChartData) {
      tooltipDiv.style("opacity", 0)

      //Need to get this beforehand so that we can select the fill and darken it on mouseleave
      const element = d3.select(event.currentTarget as Element)
      const fillColor = element.style("fill")

      if(element.node().tagName === 'text'){
        element
          .style('stroke', 'none')
      } else {
        element
          .style('stroke', () => chroma(fillColor).darken(1))
          .style("opacity", 0.8)
      }
    }

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
        .text(d => d.value.toString())
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

// Format the data (instead of using d3.stack()) and filter out 0 values:
function groupDataFunc(data: ChartData[], total: { value: number }) {
  let cumulative = 0;
  let percent = 0;
  let zeroPoint = 0;

  // Sort the data by value (negative first, then positive) and by label text
  const sortedData = data.slice().sort((a, b) => {
    if (a.value < 0 && b.value >= 0) return -1
    if (a.value >= 0 && b.value < 0) return 1
    if (a.value < 0 && b.value < 0) return a.label.localeCompare(b.label)
    if (a.value >= 0 && b.value >= 0) return a.label.localeCompare(b.label)
    return 0;
  });

  const _data: ChartData[] = sortedData.map(d => {
    if (total.value !== 0) {
      percent = (d.value / total.value) * 100
    }
    const result = {
      value: d.value,
      cumulative: cumulative,
      label: d.label,
      percent: percent
    }
    cumulative += Math.abs(d.value)
    return result;
  }).filter(d => d.value !== 0)

  // Calculate the zero point
  const negativeSum = d3.sum(_data.filter(d => d.value < 0), d => Math.abs(d.value))
  zeroPoint = negativeSum

  return { groupData: _data, zeroPoint }
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
