<template>
  <div ref="container" class="w-full justify-items-center relative">
    <svg ref="svg" class="w-full"></svg>
    <div ref="tooltip" class="absolute flex z-50 bg-white border-solid border-2 border-gray-300 rounded-5 p-5" style="opacity: 0"></div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3'
import { ref, reactive, onMounted, watch, type PropType } from 'vue'

import { getValueColorFromGradient } from '@/utils/colorUtils'
import { truncateText } from '@/utils/stringUtils'
import { roundNumber } from '@/utils/math'
import { useProjectStore } from '@/stores/main'
import chroma from 'chroma-js'
import type { ChartData, ChartOptions, NestedChartData } from '@/models/chartModels'

const sampleData: NestedChartData[] = 
[
  {
    label: 'Wood',
    value: [
      {
        label: 'a1a3',
        value: 100,
        ids: ['1', '2', '3']
      },
      {
        label: 'a4',
        value: -50,
        ids: ['4', '5']
      },
      {
        label: 'b4',
        value: -50,
        ids: ['10', '11']
      }
    ]
  },
  {
    label: 'Steel',
    value: [
      {
        label: 'a1a3',
        value: 200,
        ids: ['6', '7']
      },
      {
        label: 'a4',
        value: 90,
        ids: ['8', '9']
      },
      {
        label: 'b4',
        value: -100,
        ids: ['12', '13']
      }
    ]
  },
  {
    label: 'Concrete',
    value: [
      {
        label: 'a1a3',
        value: 300,
        ids: ['14', '15']
      },
      {
        label: 'a4',
        value: 100,
        ids: ['16', '17']
      },
      {
        label: 'b4',
        value: -25,
        ids: ['18', '19']
      }
    ]
  },
  {
    label: 'Aluminium',
    value: [
      {
        label: 'a1a3',
        value: 400,
        ids: ['20', '21']
      },
      {
        label: 'a4',
        value: 200,
        ids: ['22', '23']
      },
      {
        label: 'b4',
        value: -50,
        ids: ['24', '25']
      }
    ]
  },
  {
    label: 'Plastic',
    value: [
      {
        label: 'a1a3',
        value: 500,
        ids: ['26', '27']
      },
      {
        label: 'a4',
        value: 300,
        ids: ['28', '29']
      },
      {
        label: 'b4',
        value: -75,
        ids: ['30', '31']
      }
    ]
  },
  {
    label: 'Glass',
    value: [
      {
        label: 'a1a3',
        value: 600,
        ids: ['32', '33']
      },
      {
        label: 'a4',
        value: 400,
        ids: ['34', '35']
      },
      {
        label: 'b4',
        value: -100,
        ids: ['36', '37']
      }
    ]
  }
]

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
        width: container.value?.clientWidth, 
        height: container.value?.clientHeight, 
        ...props.options 
      }

      const data: NestedChartData[] = props.data || sampleData

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
  
  //Prepare Data, Flatten it
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
    (v) => d3.rollup(v, ([d]) => d.value, (d) => d.phase),
    (d) => d.name
  )

  const drawChart = (
    svgElement: SVGSVGElement, 
    tooltipElement: HTMLDivElement, 
    containerElement: HTMLDivElement) => 
  {
    //TODO Bring back check
    //if (!svgElement || !tooltipElement || !containerElement) return

    const svg = d3.select(svgElement)
    const tooltip = d3.select(tooltipElement)
    const container = d3.select(containerElement)

    const w = width.value - margin.left - margin.right

    // Calculate totals
    const totalsByName = d3.rollup(
      flatData,
      (v) => d3.sum(v, (d) => Math.abs(d.value)),
      (d) => d.name
    )
    const groupNames = Array.from(totalsByName.keys())

    // Format a percentage, used both on the axis and in the tooltips.
    const formatValue = ((format) => (x) => format(Math.abs(x)))(
      d3.format('.1%')
    )

    // Prepare the stack the values are stacked from the inside out, starting with more
    // moderate values and ending with the extreme values.
    const series = d3
      .stack()
      .keys(categories)
      .value(([, values], category) => {
        const value = values.get(category) || 0;
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

    /*let colorScheme: string[]
    if (categories.length <= 11) {
      colorScheme = d3.schemeSpectral[categories.length] as string[]
    } else {
      colorScheme = d3.quantize(d3.interpolateSpectral, categories.length)
    }

    const colors = d3.scaleOrdinal<string, string>()
      .domain(categories)
      .range(colorScheme.value)
    */

    const colors = d3.scaleSequential()
      .domain([Math.min(...allValues), Math.max(...allValues)])
      .interpolator(d3.interpolateRgb('green', 'red'))

    // Create the tooltip
    const tooltipDiv = tooltip
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("opacity", 0)

    // Mouse event handlers
    const mouseover = function (event: MouseEvent, data: ChartData) {
      tooltip.style('opacity', 1)
      d3.select(event.currentTarget)
        .style('stroke', 'black')
        .style('opacity', 1)
    }

    const mousemove = function (event: MouseEvent, data: any) {
      const [mouseX, mouseY] = d3.pointer(event, containerElement)
      const containerRect = containerElement.getBoundingClientRect()
      const tooltipRect = tooltipElement.getBoundingClientRect()

      let left = mouseX + 15
      let top = mouseY - 28

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

      tooltip
        .html(`${data.label}<br>${data.phase}: ${data.actualValue} ${unit}`)
        .style('left', left + 'px')
        .style('top', top + 'px')
    }

    const mouseleave = function (event: MouseEvent, d: ChartData) {
      tooltipDiv.style("opacity", 0)

      //Need to get this beforehand so that we can select the fill and darken it on mouseleave
      const element = d3.select(event.currentTarget as Element)
      const fillColor = element.style("fill")

      if(element.node().tagName === 'text'){
        element
          .style('stroke', 'none')
      } else {
        element
          .style('stroke', () => d3.color(fillColor)?.darker(0.5))
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
        d.map((v) =>
          Object.assign(v, {
            key: d.key,
            value: v[1] - v[0],
            actualValue: (v.data[1].get(d.key) || 0),
            percent: (v[1] - v[0]) * 100,
            label: v.data[0],
            phase: d.key
          })
        )
      )
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => y(d.data[0]))
      .attr('width', (d) => x(d[1]) - x(d[0]))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => {
        console.log('Actual Value:', d.actualValue); // Debugging actualValue
        return getValueColorFromGradient(d.actualValue, Math.min(...allValues), Math.max(...allValues)) || 'gray'; // Ensure colors returns a color, fallback to 'gray' if undefined
      })
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)

    // Add the labels
    bars
    .filter((d) => Math.abs(d.percent) > 5)
    .each(function (this: SVGRectElement, d) {
        const groupTotal = totalsByName.get(d.data[0]) || 0;
        const percent = d.actualValue / groupTotal;

        // Only display labels for segments larger than 5%
        if (Math.abs(percent) > 0.05) {
          const parentGroup = d3.select(this.parentNode as SVGGElement)
          const barWidth = Math.abs(x(d[1]) - x(d[0]))

          // Append text element
          /*
          parentGroup
            .append('text')
            .attr('class', 'text-value text-base')
            .attr('text-anchor', 'middle')
            .attr('x', x(d[0]) + barWidth / 2)
            .attr('y', y(d.data[0]) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('fill', 'black')
            .attr('pointer-events', 'none')
            .text(`${d.phase}: ${formatValue(percent)}`)
            .style('font', '10px sans-serif')
            */
        }
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
      .text((d) => d)
      .style('font', '10px sans-serif')
  }
  // Return the draw function
  return { drawChart }
}
</script>