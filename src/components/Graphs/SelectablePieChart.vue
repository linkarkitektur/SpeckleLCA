<template>
  <div ref="container" class="w-full h-full justify-items-center relative">
    <svg ref="svg" class="h-full w-full pt-4"></svg>
    <div ref="tooltip" class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5 opacity-0"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { ref, reactive, onMounted, watch, type PropType } from 'vue'
import chroma from 'chroma-js'

import { getValueColorFromGradient } from '@/utils/colors'
import { truncateText } from '@/utils/projectUtils'
import { roundNumber } from '@/utils/math'
import { useProjectStore } from '@/stores/main'
import type { ChartData, ChartOptions } from '@/models/chartModels'

const sampleData: ChartData[] = [
  { label: 'Wood dummy', value: -500.12458, ids: ['1', '2', '3']},
  { label: 'Concerete dummy', value: 800.12458, ids: ['4', '5', '6']},
  { label: 'Steel dummy', value: 400.12458, ids: ['7', '8', '9']},
  { label: 'Other dummy', value: 300.12458, ids: ['8', '9', '10']},
  { label: 'Another dummy', value: 100.12458, ids: ['11', '12', '13']},
  { label: 'Yet another dummy', value: 200.12458, ids: ['14', '15', '16']},
  { label: 'Last dummy', value: 100.12458, ids: ['17', '18', '19']}
]

export default {
  name: 'SelectablePieChart',
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
    const options: ChartOptions = props.options
    
    //Clear so we dont get overlaps
    const clearSVG = () => {
      if (svg.value) {
        // Clear all children of the SVG element
        while (svg.value.firstChild) {
          svg.value.removeChild(svg.value.firstChild)
        }
      }
    }

    //Draw the chart
    const draw = () => {   
      clearSVG()

      //When spreading the options it will overwrite the width and height if provided
      const options: ChartOptions = { 
        width: svg.value ? svg.value.clientWidth : 0, 
        height: svg.value ? svg.value.clientHeight : 0, 
        ...props.options 
      }

      const data: ChartData[] = props.data || sampleData

      const { drawChart } = SelectablePieChart(data, options)
      if (svg.value && tooltip.value && container.value) {
        drawChart(svg.value, tooltip.value, container.value)
        //Update container size
        container.value.style.width = `${options.width}px`
        container.value.style.height = `${options.height}px`
      }
    }

    onMounted(() => {
      draw()
      // Handle resize with ResizeObserver
      const resizeObserver = new ResizeObserver(draw)
      resizeObserver.observe(svg.value)
    })

    //Watch for props changes
    watch(
      () => props.data,
      () => {
        draw();
      },
      { deep: true }
    )

    return { 
      svg, 
      tooltip, 
      container,
    }
  }
}

function SelectablePieChart(data: ChartData[], options: ChartOptions = {}) {
  // Setup options and default settings
  const width = ref(options.width || 400)
  const height = ref(options.height || 400)
  const margin = reactive(options.margin || { top: 20, right: 20, bottom: 20, left: 20 })

  const total = ref(d3.sum(data, d => d.value))
  const totalAbs = ref(d3.sum(data, d => Math.abs(d.value)))
  const groupData = ref(groupDataFunc(data, total))

  const w = width.value - margin.left - margin.right
  const h = height.value - margin.top - margin.bottom

  //Graphic settings
  const innerRadius = options.innerRadius || 40 // Set this bigger than 0 for a donut chart
  const outerRadius = Math.min(w, h) / 2
  const labelRadius = (innerRadius * 0.2 + outerRadius * 0.7)

  const stroke = options.stroke || innerRadius > 0 ? "none" : "white" 
  const strokeWidth = options.strokeWidth || 1
  const strokeLinejoin = "miter"
  const padAngle = stroke === "none" ? 1 / outerRadius : 0.02
  const maxTextLength = 12

  const colors = ref(options.colors || 
    groupData.value.map(d => 
      getValueColorFromGradient(d.value, 0, Math.max(...groupData.value.map(d => d.value)))
    ))

  const drawChart = (svg: SVGSVGElement, tooltip: HTMLDivElement, container: HTMLDivElement) => {
    if (!svg || !tooltip || !container) return
    const graph = d3.select(svg)

    // Create tooltip div
    const tooltipDiv = d3.select(tooltip)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("opacity", 0)

    //Create mouse over and tooltip functions
    const mouseover = function (event: MouseEvent, data: ChartData) {
      tooltipDiv.style("opacity", 1)
      if (data.data.value > 0) {
        d3.select(event.currentTarget as Element)
          .style("stroke", "black")
          .style("opacity", 1)
      } else {
        d3.select(event.currentTarget as Element)
          .style("stroke", "black")
          .style("opacity", 0.6)
      }
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
      if (top + tooltipRect.height > containerRect.height) {
        top = containerRect.height - tooltipRect.height - 10
      }

      tooltipDiv
        .html(data.data.label + ": " + roundNumber(data.value, 3))
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
        if (data.data.value > 0) {
          element
          .style('stroke', stroke)
          .style("opacity", 0.8)
        } else {
          element
          .style('stroke', colors[data.data.index])
          .style('stroke-dasharray', '5,5')
          .style("opacity", 0.8)
        }
      }
    }

    const addTextWithTooltip = (textElement: d3.Selection<SVGTextElement, ChartData, SVGGElement, unknown>) => {
      textElement
        .on("mouseover", function(this: SVGTextElement, event, d) {
          mouseover(event, d)
          d3.select(this).style("font-weight", "normal")
          if (d.data.value > 0) {
            d3.select(this.parentNode!
            .querySelector<SVGPathElement>('path'))
            .style("stroke", "black")
            .style("opacity", 1)
          } else {
            d3.select(this.parentNode!
            .querySelector<SVGPathElement>('path'))
              .style("stroke", "black")
              .style("opacity", 0.6)
          }
        })
        .on("mousemove", function(this: SVGTextElement, event, d) {
          mousemove(event, d)
        })
        .on("mouseleave", function(this: SVGTextElement, event, d) {
          mouseleave(event, d)
          d3.select(this).style("font-weight", "normal")
          if (d.data.value > 0) {
            d3.select(this.parentNode!
            .querySelector<SVGPathElement>('path'))
            .style('stroke', stroke)
            .style("opacity", 0.8)
          } else {
            d3.select(this.parentNode!
            .querySelector<SVGPathElement>('path'))
            .style('stroke', 'black')
            .style('stroke-dasharray', '5,5')
            .style("opacity", 0.4)
          }
        })
    }

    const arcs = d3.pie()
      .padAngle(padAngle)
      .sort(null)
      .value(d => Math.abs(d.value))(groupData.value.map(d => ({ ...d })))
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    // Negative values are drawn with a thicker stroke and a dashed line so we have to offset it slightly to compensate
    const arcNegative = d3.arc().innerRadius(innerRadius + (strokeWidth*3/2)).outerRadius(outerRadius - (strokeWidth*3/2))
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius)

    // Graph join
    const join = graph.append("g")
      .attr("transform", `translate(${w / 2},${h / 2})`)
      .selectAll('g')
      .data(arcs)
      .join('g')
      .attr("class", "arc")

    // Add the arcs
    join.append("path") 
      .attr("stroke",  d => d.data.value > 0 ? stroke : colors.value[d.index]) // Colored stroke on negative value
      .attr("stroke-width", d => d.data.value > 0 ? strokeWidth : strokeWidth * 3) // Thick stroke width on negative value
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("pointer-events", "all")
      .attr("cursor", "pointer")
      .style('stroke-dasharray', d => d.data.value > 0 ? '0' : '5,5') // Dashed stroke on negative value
      .style("opacity", 0.8) // Opacity on negative value
      .attr("fill", d => d.data.value > 0 ? colors.value[d.index] : 'none' )// Remove fill on negative values
      .attr("d", d => d.data.value > 0 ? arc(d) : arcNegative(d))
      .on("mouseover", function(event, d) {
        mouseover(event, d)
      })
      .on("mousemove", function(event, d) {
        mousemove(event, d)
      })
      .on("mouseleave", function(event, d) {
        mouseleave(event, d)
      })
      .on("click", function(event, d) {
        updateSelectedObjects(d.data.ids)
      })

    // Add the value texts
    join.append("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("cursor", "pointer")
      .attr("text-anchor", "middle")
      .each(function(d) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const self = d3.select(this)
        const lines = `${truncateText(d.data.label, maxTextLength)} \n ${roundNumber(d.data.value, 1)}`.split(/\n/)
        const isLargeArc = (d.endAngle - d.startAngle) > 0.5
        const isSmallArc = (d.endAngle - d.startAngle) < 0.5
        const adjustedLines = isLargeArc ? lines : lines.slice(0, 1)
        
        adjustedLines.forEach((line, i) => {
          if (!isSmallArc) {
            addTextWithTooltip(
              self.append("tspan")
                .attr("x", 0)
                .attr("y", `${i * 1.1}em`)
                .attr("font-weight", i ? null : "bold")
                .text(line)
            )
          }
        })
      })

    // Add total in the middle
    graph.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", w / 2)
      .attr("y", h / 2)
      .classed("text-md", true)
      .style("font-weight", "bold")
      .text(roundNumber(total.value, 1))
  }
  return { drawChart }
}

// Format the data (instead of using d3.stack()) and filter out 0 values:
function groupDataFunc(data: ChartData[], total: { value: number }) {
  let cumulative = 0
  let percent = 0
  const _data: ChartData[] = data.map(d => {
    cumulative += Math.abs(d.value)
    if (total.value > 0) {
      percent = (d.value / total.value) * 100
    }
    return {
      value: d.value,
      cumulative: cumulative - Math.abs(d.value),
      label: d.label,
      ids: d.ids,
      percent: percent
    }
  }).filter(d => d.value != 0)
  return _data
}

function updateSelectedObjects(ids: string[]) {
  const projectStore = useProjectStore()
  projectStore.setObjectsById(ids)
}
</script>

<style>
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