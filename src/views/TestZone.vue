<template>
  <DivergingStackedBar />
</template>

<script lang="ts">
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import * as d3 from 'd3';

const dummyData = {
  name: 'root',
  children: [
    {
      name: 'Flowering period',
      value: 0,
      children: [
        { name: 'Ajuga Reptans', value: 500 },
        { name: 'Calluna Vulgaris', value: 300 },
        { name: 'Campanula Trachelium', value: 200 }
      ]
    },
    {
      name: 'CO2 Absorption',
      value: 0,
      children: [
        { name: 'Ajuga Reptans', value: 1000 },
        { name: 'Calluna Vulgaris', value: 500 },
        { name: 'Campanula Trachelium', value: 200 }
      ]
    },
    {
      name: 'Biodiversity',
      value: 0,
      children: [
        { name: 'Ajuga Reptans', value: 300 },
        { name: 'Calluna Vulgaris', value: 200 },
        { name: 'Campanula Trachelium', value: 100 }
      ]
    },
    {
      name: 'Recreational Potential',
      value: 0,
      children: [
        { name: 'Ajuga Reptans', value: 100 },
        { name: 'Calluna Vulgaris', value: 100 },
        { name: 'Campanula Trachelium', value: 100 }
      ]
    }
  ]
};

export default {
  name: 'D3Chart',
  props: {
    inputData: {
      type: Object,
      required: true
    }
  },
  components: {
    DivergingStackedBar
  },
  mounted() {
    this.createChart(dummyData);
  },
  methods: {
    createChart(data) {
      const width = 900;
      const height = 900;
      const radius = Math.min(width, height) / 2;

      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

// Use sum() for hierarchical layout, allowing value-based sizing
const partition = (data) =>
  d3.partition().size([2 * Math.PI, radius])(
    d3.hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

const arc = d3
  .arc()
  .startAngle((d) => d.x0)
  .endAngle((d) => d.x1)
  .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
  .padRadius(radius / 2)
  .innerRadius((d) => d.y0)
  .outerRadius((d) => d.y1 - 1);

  const root = partition(data);

  // Calculate and ensure the sum of the children's values match the parent value for proportional scaling
  root.each((d) => {
    if (d.children) {
      const childrenSum = d.children.reduce((sum, child) => sum + child.value, 0);
      if (childrenSum === d.value) {
        // Set children values proportional to parent if sums are equal
        d.children.forEach((child) => {
          child.value = (child.value / childrenSum) * d.value;
        });
      }
    }
  });

  const svg = d3
    .select('#chart-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`); // Center the chart

  const format = d3.format(',d');

  svg
    .append('g')
    .attr('fill-opacity', 0.6)
    .selectAll('path')
    .data(root.descendants().filter((d) => d.depth))
    .join('path')
    .attr('fill', (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr('d', arc)
    .append('title')
    .text((d) => `${d.ancestors().map((d) => d.data.name).reverse().join('/')}\n${format(d.value)}`);

  svg
    .append('g')
    .attr('pointer-events', 'none')
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .attr('font-weight', 'bold')
    .attr('fill', 'black')
    .selectAll('text')
    .data(
      root
        .descendants()
        .filter((d) => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
    )
    .join('text')
    .attr('transform', function (d) {
      const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr('dy', '0.35em')
    .text((d) => d.data.name);
    }
  }
};
</script>

<style scoped>
#chart-container {
  width: 100%;
  height: 100vh;
}

svg {
  width: 100%;
  height: 100%;
}
</style>