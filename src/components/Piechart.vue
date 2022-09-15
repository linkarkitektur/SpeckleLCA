<template>
  <v-card class="pa-4">
    <h2>{{title}}</h2>
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
    @click="clicked()"
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
    },
    title:{
      default: '',
      type: String,
      required:true,
    },
    totalEmission:{
      default: 0,
      type: Number,
      required:true,
    },
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
        onClick: this.clicked,
        plugins: {
          autocolors: {
            mode: 'data'
          },
          legend:{
            position:'right'
          },
          title:{
            align:'start',
            display:true,
            position:'top',
            text: this.totalEmission.toFixed(2) + ' Tons C02e',
            font: {
              size: 18
            }
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
    },
    clicked(e,item){
      console.log(e,item)
    }
  },
  
}
</script>
