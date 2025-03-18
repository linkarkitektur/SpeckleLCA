<template>
  <div ref="container" class="relative w-full h-full">
    <!-- Clipped circle container -->
    <div :style="circleStyle" class="absolute styled-element hoverable-styling rounded-full overflow-hidden">
      <svg ref="svg" class="w-full h-full"></svg>
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
import { ref, reactive, onMounted, watch, onBeforeUnmount, nextTick, type PropType, render } from 'vue'

import { getValueColorFromGradient } from '@/utils/colorUtils'
import { 
  aggregateCenter, 
  spanPercentCenter,
  parameterCenter,
  updateSelectedObjects,
  createTooltip,
  createMouseEventHandlers,
  createBaseChart,
  createDiagonalPattern,
  chartBaseStyle,
} from '@/utils/chartUtils'

import { truncateText } from '@/utils/stringUtils'
import { roundNumber } from '@/utils/math'
import type { ChartData, ChartOptions, PatternOptions } from '@/models/chartModels'
import { useResultStore } from '@/stores/result'
import { useProjectStore } from '@/stores/main'

// Props
interface Props {
  data?: ChartData[]
  options?: ChartOptions
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: () => ({})
})

// Store
const resultStore = useResultStore()

// Refs
const svg = ref<SVGSVGElement | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const circleStyle = ref({})

//Clear so we dont get overlaps
const clearSVG = () => {
  if (svg.value) {
    // Clear all children of the SVG element
    while (svg.value.firstChild) {
      svg.value.removeChild(svg.value.firstChild)
    }
  }
}

// Dynamic div size to smallest dimension
const updateCircleSize = () => {
  if (container.value) {
    const containerWidth = container.value.clientWidth
    const containerHeight = container.value.clientHeight
    const size = Math.max(containerWidth, containerHeight)
    circleStyle.value = {
      width: `${size}px`,
      height: `${size}px`,
      // Center the circle within the container:
      top: `${(containerHeight - size) / 2}px`,
      left: `${(containerWidth - size) / 2}px`,
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

  const data: ChartData[] = props.data

  const { drawChart } = SelectablePieChart(data, options)
  if (svg.value && tooltip.value && container.value) {
    drawChart(svg.value, tooltip.value, container.value)
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    resultStore.setReloadData(true)
    draw()
  }
}

onMounted(async () => {
  await nextTick() // ensure the container is rendered
  updateCircleSize()

  if (!svg.value) {
    console.warn('SVG element not found')
    return
  }

  draw()
  
  // Create ResizeObserver
  const resizeObserver = new ResizeObserver(() => {
    updateCircleSize()
    draw()
  })
  
  if (svg.value) {
    resizeObserver.observe(svg.value)
    console.log('Observer attached to SVG')
  }

  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})

//Watch for props changes
watch(
  () => props.data,
  () => {
    if (resultStore.reloadChartData)
      draw()
  }
)

function SelectablePieChart(data: ChartData[], options: ChartOptions = {}) {
  const resultStore = useResultStore()
  const projectStore = useProjectStore()
  // Setup options and default settings
  const width = ref(options.width || 400)
  const height = ref(options.height || 400)

  const total = ref(d3.sum(data, d => d.value))
  const groupData = ref(groupDataFunc(data, total, options))

  const w = width.value
  const h = height.value 

  //Graphic settings
  const innerRadius = options.innerRadius || 40 // Set this bigger than 0 for a donut chart
  const outerRadius = Math.min(w, h) / 2
  const labelRadius = (innerRadius * 0.2 + outerRadius * 0.6)

  const stroke = options.stroke || innerRadius > 0 ? "none" : "white" 
  const padAngle = stroke === "none" ? 1 / outerRadius : 0.02
  const maxTextLength = 12

  const unit = options.unit || 'kg CO2e'
  const colors = ref(options.colors || 
    groupData.value.map(d => 
      getValueColorFromGradient(d.value, 0, Math.max(...groupData.value.map(d => d.value).filter(value => !isNaN(value)))
    ))
  )

  const drawChart = (svg: SVGSVGElement, tooltipElement: HTMLDivElement, containerElement: HTMLDivElement) => {
    if (!svg || !tooltipElement || !containerElement) return
    const graph: d3.Selection<SVGElement, any, any, any> = d3.select(svg)

    // Double click checks
    let clickTimeout = null

    // Create tooltips
    const tooltipDiv = createTooltip(tooltipElement)
    
    // Mouse event handlers
    const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(tooltipDiv, containerElement)

    const arcs = d3.pie()
      .padAngle(padAngle)
      .sort(null)
      .value(d => Math.abs(d.graphValue))(groupData.value.map(d => ({ ...d })))
    
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    // Negative Offset Deprecated
    // Negative values are drawn with a thicker stroke and a dashed line so we have to offset it slightly to compensate
    // const arcNegative = d3.arc().innerRadius(innerRadius + (strokeWidth*3/2)).outerRadius(outerRadius - (strokeWidth*3/2))
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
      .call(chartBaseStyle)
      .attr("d", d => arc(d))
      // Different fill on negative values
      .attr("fill", function(d, i) {
        const patternOptions: PatternOptions = {
          size: 8,
          lineWidth: 3,
          fill: d.data.value > 0
        }
        const patternId = createDiagonalPattern(graph, d.data.label, colors.value[i], patternOptions)

        return `url(#${patternId})`
      })

      .on("mouseover", function(event, d) {
        mouseover(event, d.data)
      })
      .on("mousemove", function(event, d) {
        mousemove(event, d.data)
      })
      .on("mouseleave", function(event, d) {
        mouseleave(event, d.data)
      })
      // Double click event check, grey out if single but send it to selectedObjects for viewer
      .on("click", function(event, d) {
        if (clickTimeout) {
          // A second click occurred within the timer: it's a double click
          clearTimeout(clickTimeout)
          clickTimeout = null
          resultStore.setReloadData(true)

          updateSelectedObjects(d.data.ids)
        } else {
          clickTimeout = setTimeout(() => {
            clickTimeout = null

            resultStore.setReloadData(false)
            projectStore.setHighlightedLabel(d.data.label)

            total.value = d.data.value
            renderCenter()
            
            updateSelectedObjects(d.data.ids)
          }, 300)
        }
      })

    // Add the value texts
    join.append("text")
      .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
      .attr("class", "styled-data z-50 pointer-events-none text-xs")
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
            self.append("tspan")
              .attr("x", 0)
              .attr("y", `${i * 1.1}em`)
              .attr("class", i == 0 ? "styled-header" : "styled-data")
              .text(line)
          }
        })
      })

    // Add center text, can render different center based on options
    const renderCenter = () => {
      //Clear text
      graph.selectAll('.center-text').remove()

      let centerElement
      switch (true) {
        case options.aggregate !== undefined:
          centerElement = aggregateCenter(
            graph, 
            total.value, 
            w, 
            h, 
            unit
          )
          break
        case options.spanPercent !== undefined:
          centerElement = spanPercentCenter(
            graph, 
            options.spanPercent, 
            groupData.value.map(data => data.value / data.ids.length), 
            groupData.value.map( data => data.graphValue), 
            w, 
            h
          )
          break
        case options.parameterValue !== undefined:
          centerElement = parameterCenter(
            graph, 
            options.parameterValue, 
            total.value, 
            w, 
            h
          )
          break
        default:
          centerElement = aggregateCenter(
            graph, 
            total.value, 
            w, 
            h, 
            unit
          )
          break
      }
    }

    renderCenter()

    // Watch to see if highlightedLabel changes then change opacity of arcs
    // TODO move this to common place with dataTable, and other graphs
    watch(() => projectStore.highlightedLabel, (newLabel) => {
      graph.selectAll('.arc path')
        .transition()
        .duration(200)
        .style('opacity', arcData => {
          if (arcData.data.label === newLabel) {
            //TODO This should not be under opacity, this checks if we should recalc the center
            total.value = arcData.data.value
            renderCenter()
            return 1
          } else {
            return 0.1
          }
      })
        
    })

    watch(
      () => total.value,
      () => {
        renderCenter()
      }
    )

  }
  return { drawChart }
}

// Format the data (instead of using d3.stack()) and filter out 0 values:
function groupDataFunc(data: ChartData[], total: { value: number }, options: ChartOptions = {}) {
  let cumulative = 0
  let percent = 0
  const _data: ChartData[] = data.map(d => {
    // Check if we have another value we want to use for graphs size
    let graphValue = d.graphValue ?? d.value
    cumulative += Math.abs(d.value)
    if (total.value > 0) {
      percent = (d.value / total.value) * 100
    }
    const tooltipContent = d.label + ": " + roundNumber(d.value, 3) + " " + options.unit
    return {
      value: d.value,
      cumulative: cumulative - Math.abs(d.value),
      label: d.label,
      ids: d.ids,
      percent: percent,
      graphValue: graphValue,
      tooltipContent: tooltipContent
    }
  }).filter(d => d.value != 0)
  return _data
}

</script>