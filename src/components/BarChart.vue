<template>
  <v-row align="center" ref="bar-chart">
    <v-col cols="6">
      <h1 class="ma-4">Benchmarks</h1>
    </v-col>
    <v-col cols="6">
      <v-row>
        <v-col cols="6">
          <v-select
            :items="dropDownValues.filter(e=>e !== result_2)"
            label="Select Result 1"
            outlined
            v-model="result_1"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            :items="dropDownValues.filter(e=>e !== result_1)"
            label="Select Result 2"
            outlined
            v-model="result_2"
          ></v-select>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptions"
        :chart-data="chartDataForGWP"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
      </v-card>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptions"
        :chart-data="chatDataForVolume"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
      </v-card>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptions"
        :chart-data="chartDataForMainCategoryComparision"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
      />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { Bar } from 'vue-chartjs/legacy'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import colors from '../utils/colorPalette';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: {
    Bar
  },
  props:{
    items:{
      type:Object,
      required:true
    },
    chartId: {
      type: String,
      default: 'bar-chart'
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
    plugins: {
      type: Array,
      default: () => []
    }
  },
  computed:{
    dropDownValues(){
      return Object.keys(this.items)
    },
    chartDataForGWP(){
      return this.getCalculations('totalEmission')
    },
    chatDataForVolume(){
      return this.getCalculations('totalVolume')
    },
    chartDataForMainCategoryComparision(){
      return this.getMainCategoryComparision('mainCatGwpData','gwpDataSet');
    }
  },
  created(){
    console.log(this.items)
  },
  data() {
    return {
      result_1:null,
      result_2:null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins:{
          legend:{
            display:false
          },
          title:{
            display:true,
            text:'Total GWP Comparison',
            fontSize:18
          }
        }
      }
    }
  },
  methods:{
    getCalculations(key){
      if(this.result_1 && this.result_2){
        const labels = [this.result_1,this.result_2];
        let data = [this.items[this.result_1].mainCatGwpData[key],this.items[this.result_2].mainCatGwpData[key]];
        this.$nextTick(()=>{
          window.scrollTo({
            top: this.$refs['bar-chart'].offsetTop,
            behavior: 'smooth',
          });
        })
        
        return {
          labels: labels,
          datasets: [
            {
              backgroundColor: colors,
              data: data
            }
          ]
        }
      }
      return {
        labels: [],
        datasets: [
          {
            data: []
          }
        ]
      }
    },
    getMainCategoryComparision(arr,key){
      let data = [];
      let labels = [];
      let datasets = [];
      this.items[this.result_1][arr].labels.forEach((e1,i) => {
        this.items[this.result_2][arr].labels.forEach((e2,j)=>{
          if(e1 === e2){
            let obj = {
              x:e1,
              [this.result_1]:this.items[this.result_1].mainCatGwpData[key][i],
              [this.result_2]:this.items[this.result_2].mainCatGwpData[key][j]
            }
            data.push(obj);
            labels.push(e1);
          }
        });
      });
  
      datasets.push(
      {
        label: [this.result_1],
        data: data,
        backgroundColor: colors,
        parsing: {
          yAxisKey: [this.result_1]
        }
      },
      {
        label: [this.result_2],
        data: data,
        backgroundColor: colors,
        parsing: {
          yAxisKey: [this.result_2]
        }
      })
      return {
        labels: labels,
        datasets: datasets
      }
      
    }
  }
}
</script>

<style>

</style>