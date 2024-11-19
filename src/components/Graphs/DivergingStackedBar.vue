<template>
  <div ref="container" class="w-full justify-items-center relative overflow-visible">
    <svg ref="svg" class="w-full overflow-visible"></svg>
    <div ref="tooltip" class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5 pointer-events-none" style="opacity: 0"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { ref, reactive, onMounted, watch, type PropType } from 'vue'

import { getValueColorFromGradient } from '@/utils/colorUtils'
import { 
  updateSelectedObjects, 
  createTooltip, 
  createMouseEventHandlers,
} from '@/utils/chartUtils'
import type { ChartData, ChartOptions, NestedChartData } from '@/models/chartModels'

export default {
  name: 'DivergingStackedBar',
  props: {
    data: {
      type: Array as PropType<NestedChartData[]>,
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
        ...props.options 
      }

      const data: NestedChartData[] = props.data

      const { drawChart } = DivergingStackedBar(data, options)
      if (svg.value && tooltip.value && container.value) {
        drawChart(svg.value, tooltip.value, container.value)
      }
    }

    onMounted(() => {
      draw()
      const resizeObserver = new ResizeObserver(draw)
      if (container.value)
        resizeObserver.observe(container.value)
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

function DivergingStackedBar(data: NestedChartData[], options: ChartOptions = {}) {
  const width = ref(options.width || 600)
  const height = ref(options.height || 400)
  const barHeight = ref(options.barHeight || 40)
  const margin = reactive(options.margin || { top: 30, right: 30, bottom: 30, left: 30 })
  const padding = 10 //TODO make this a option prop
  const unit = "kg CO2-eq"
  
  //Prepare Data, Flatten it te
  const flatData = data.flatMap((d) =>
    d.value.map((v) => ({
      name: d.label,
      phase: v.label,
      value: v.value,
      ids: v.ids,
    }))
  )
  
  //Get unique categories, in our case phases of the LCA
  const categories = Array.from(new Set(flatData.map((d) => d.phase)))

  // Compute the bias = sum of negative values for each candidate.
  const bias = d3
    .rollups(
      flatData,
      (v) => d3.sum(v, (d) => Math.min(0, d.value)),
      (d) => d.name
    )
    .sort((a, b) => d3.ascending(a[1], b[1]))

    const dataByName = d3.rollup(
      flatData,
      (v) =>
        d3.rollup(
          v,
          ([d]) => ({ value: d.value, ids: d.ids }),
          (d) => d.phase
        ),
      (d) => d.name
    )

  const drawChart = (
    svgElement: SVGSVGElement, 
    tooltipElement: HTMLDivElement, 
    containerElement: HTMLDivElement) => 
  {
    //const { svg, width, height, margin } = createBaseChart(options, containerElement)

    const svg = d3.select(svgElement)

    // Calculate totals
    const totalsByName = d3.rollup(
      flatData,
      (v) => d3.sum(v, (d) => Math.abs(d.value)),
      (d) => d.name
    )
    const groupNames = Array.from(totalsByName.keys())

    // Prepare the stack the values are stacked from the inside out, starting with more
    // moderate values and ending with the extreme values.
    const series = d3
      .stack()
      .keys(categories)
      .value(([, values], category) => {
        const phaseData = values.get(category);
        const value = phaseData ? phaseData.value : 0;
        return value;
      })
      .offset(d3.stackOffsetDiverging)(dataByName)

    const xDomain = d3.extent(series.flat(2))

    // Construct the scales.
    const x = d3
      .scaleLinear()
      .domain(xDomain)
      .rangeRound([margin.left, width.value - margin.right])

    const y = d3
      .scaleBand()
      .domain(bias.map(([name]) => name))
      .range([margin.top, margin.top + groupNames.length * barHeight.value])
      .paddingInner(padding / barHeight.value)
      .paddingOuter(0)
    
      const h = y.range()[1] + margin.bottom;

    // Set up color scale
    const allValues = flatData.map((d) => d.value)

    // Create the tooltip
    const tooltipDiv = createTooltip(tooltipElement) 

    // Mouse event handlers
    const { mouseover, mousemove, mouseleave } = createMouseEventHandlers(tooltipDiv, containerElement)

    // Draw the chart.
    svg
      .attr('width', width.value)
      .attr('height', h)
      .attr('viewBox', `0 0 ${width.value} ${h}`)
      .style('display', 'block') 
      .style('font', '10px sans-serif')

    // Append a rect for each value, with a tooltip.
    const barGroup = svg
      .append('g')
      .selectAll('g')
      .data(series)
      .join('g')  
    
     const bars = barGroup 
      .selectAll('rect')
      .data((d) =>
      d.map((v) => {
        const phaseData = v.data[1].get(d.key)
        const value = v[1] - v[0]
        const actualValue = phaseData ? phaseData.value : 0
        const ids = phaseData ? phaseData.ids : []
        const percent = value * 100
        const label = v.data[0]
        const phase = d.key

        // Construct the tooltip content dynamically
        const tooltipContent = `${label}<br>${phase}: ${actualValue} ${unit}`

        return Object.assign(v, {
          key: phase,
          value,
          actualValue,
          ids,
          percent,
          label,
          phase,
          tooltipContent,
        })
      })

      )
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d.data[0]))
      .attr('width', (d) => x(d[1]) - x(d[0]))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => {
        return (
          getValueColorFromGradient(
            d.actualValue,
            Math.min(...allValues.filter(value => !isNaN(value))),
            Math.max(...allValues.filter(value => !isNaN(value)))
          ) || 'gray'
        )
      })
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .on("click", function(event, d) {
        updateSelectedObjects(d.ids)
      })

    //Get the leftmost X by each group
    const leftmostXByGroup = new Map()

    bars.each(function(d) {
      const groupName = d.data[0];
      const x0 = x(d[0]);
      const currentMinX = leftmostXByGroup.get(groupName);
      if (currentMinX === undefined || x0 < currentMinX) {
        leftmostXByGroup.set(groupName, x0);
      }
    })
    
    // Create the axes.
    // xAxis
    svg
      .append('g')
      .attr('transform', `translate(0,${margin.top})`)
      .call((g) => g.select('.domain').remove())

    // yAxis
    svg
      .append('g')
      .selectAll('text')
      .data(groupNames)
      .enter()
      .append('text')
      .attr('x', (d) => leftmostXByGroup.get(d) - 2)
      .attr('y', (d) => y(d) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('class', 'overflow-visible')
      .attr('class', 'text-xs')
      .text((d) => d)
      
  }
  // Return the draw function
  return { drawChart }
}
</script>