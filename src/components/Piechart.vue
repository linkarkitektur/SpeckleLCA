<template>
  <v-card class="pa-4">
    <Pie
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
  </v-card>
</template>

<script>
import { Pie } from 'vue-chartjs/legacy'
import autocolors from 'chartjs-plugin-autocolors';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, autocolors)

export default {
  name: 'PieChart',
  components: {
    Pie
  },
  props: {
    chartId: {
      type: String,
      default: 'pie-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
    },
    labels:{
      type: Array,
      required:true,
      default:null
    },
    chartDataSet:{
      type: Array,
      required:true,
      default:null
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          autocolors: {
            mode: 'data'
          },
          legend:{
            position:'bottom'
          },
          title:{
            align:'start',
            display:true,
            position:'top',
            text:'This is title'
          },
          subtitle: {
            display: true,
            text: 'Custom Chart Subtitle',
            position:'top',
            align:'start'
          }
        }
      },
      plugins:[
        autocolors
      ]
    }
  },
  created(){
    this.initializeChart()
  },
  methods:{
    initializeChart(){
      this.chartData.labels = [...this.labels]
      this.chartData.datasets[0].data = [...this.chartDataSet]
      console.log(this.chartData)
    }
  }
}
</script>
