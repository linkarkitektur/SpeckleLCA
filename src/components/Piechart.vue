<template>
  <v-card class="pa-4">
    <v-row>
      <v-col cols="6"><h2>{{title}}</h2></v-col>
      <v-col cols="6" align="right" v-if="showBackButton">
        <v-btn class="ma-2" color="primary" @click="onBackButtonClicked">
          <v-icon dark left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>
    
    <Pie
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
    :ref="`chart`"
  />
  </v-card>
</template>

<script>
import { Pie } from 'vue-chartjs/legacy';
import colors from '../utils/colorPalette';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

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
    index:{
      type: Number,
      required:true,
    }
  },
  computed:{
    chartData(){
      return{
        labels: [...this.labels],
        datasets: [
          {
            backgroundColor:colors,
            data: [...this.chartDataSet]
          }
        ]
      }
    },
    chartOptions(){
      return {
        responsive: true,
        maintainAspectRatio: false,
        onClick: this.clicked,
        plugins: {
          legend:{
            position:'right'
          },
          title:{
            align:'start',
            display:true,
            position:'top',
            text: this.index % 2 === 0 ? this.totalEmission.toFixed(2) + ' Tons C02e' : this.totalEmission.toFixed(2) + ' m3',
            color:'red',
            font: {
              size: 18
            }
          }
        }
      }
    }
  },
  data() {
    return {
      showBackButton:false
    }
  },
  methods:{
    clicked(e,item){
      if(this.title === 'GWP By Main Category'){
        this.$emit('onArclicked',item[0].index,'GWP');
        this.showBackButton = true;
      }else if(this.title === 'Volume By Main Category'){
        this.$emit('onArclicked',item[0].index,'Volume');
        this.showBackButton = true
      }
    },
    onBackButtonClicked(){
      if(this.title.includes('GWP')){
        this.$emit('onBackClicked','gwp');
        this.showBackButton = false
      }else{
        this.$emit('onBackClicked','volume');
        this.showBackButton = false
      }
    }
  },
  
}
</script>
