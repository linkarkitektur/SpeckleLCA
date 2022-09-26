<template>
  <v-row align="center" ref="bar-chart">
    <v-col cols="6">
      <h1 class="ma-4">Benchmarks</h1>
    </v-col>
    <v-col cols="6">
      <v-row>
        <v-col cols="6">
          <v-select
            :items="dropDownValues"
            label="Select Result 1"
            outlined
            @change="onDropdownChange"
            v-model="result_1"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            :items="dropDownValues"
            label="Select Result 2"
            outlined
            @change="onDropdownChange"
            v-model="result_2"
          ></v-select>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card class="pa-4">
        <Bar
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
    chartData(){
      if(this.result_1 && this.result_2){
        const labels = [this.result_1,this.result_2];
        let data = [this.items[this.result_1].mainCatGwpData.totalEmission,this.items[this.result_2].mainCatGwpData.totalEmission];
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
          }
        }
      }
    }
  },
  methods:{
    onDropdownChange(){
      
    }
  }
}
</script>

<style>

</style>