<template>
  <v-row align="center" class="pa-4">
    <v-col cols="6" ref="bar-chart">
      <v-card-title>Bench Marking</v-card-title>
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
      <v-card-title>{{chartDataForGWP.title}}</v-card-title>
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptionsForGWP"
        :chart-data="chartDataForGWP"
      />
      </v-card>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card-title>{{chatDataForVolume.title}}</v-card-title>
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptionsForVolume"
        :chart-data="chatDataForVolume"
      />
      </v-card>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card-title>{{chartDataForMainCategoryComparision.title}}</v-card-title>
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptionsForGWP"
        :chart-data="chartDataForMainCategoryComparision"
      />
      </v-card>
    </v-col>
    <v-col cols="6" v-if="result_1 && result_2">
      <v-card-title>{{chartDataForMainCategoryVolumeComparision.title}}</v-card-title>
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptionsForVolume"
        :chart-data="chartDataForMainCategoryVolumeComparision"
      />
      </v-card>
    </v-col>
    <v-col cols="12" v-if="result_1 && result_2">
      <v-card-title>Sub Category GWP Comparison</v-card-title>
      <v-card class="pa-4">
        <Bar
        :chart-options="chartOptionsForGWP"
        :chart-data="chartDataForSubCategorGWPComparision"
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
    },
    chartDataForMainCategoryVolumeComparision(){
      return this.getMainCategoryComparision('mainCatVolumeData','volumeDataSet');
    },
    chartDataForSubCategorGWPComparision(){
      return this.getMainCategoryComparision('subCategoryGWPData','gwpDataSet');
    },
    chartOptionsForGWP(){
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins:{
          legend:{
            display:false
          },
          tooltip:{
            callbacks: {
              label: (tooltipItem)=> {
                let unit = ' kg CO2e'
                return `${tooltipItem.label} : ${tooltipItem.formattedValue} ${unit}`
              },
            }
          }
        }
      }
    },
    chartOptionsForVolume(){
      return{
        responsive: true,
        maintainAspectRatio: false,
        plugins:{
          legend:{
            display:false
          },
          tooltip:{
            callbacks: {
              label: (tooltipItem)=> {
                let unit = ' m3';
                return `${tooltipItem.label} : ${tooltipItem.formattedValue} ${unit}`
              },
            }
          }
        }
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
    }
  },
  methods:{
    getCalculations(key){
      if(this.result_1 && this.result_2){
        const labels = [this.result_1,this.result_2];
        let data = [this.items[this.result_1].mainCatGwpData[key],this.items[this.result_2].mainCatGwpData[key]];
        this.$nextTick(()=>{
          window.scrollTo({
            top: this.$refs['bar-chart'].offsetTop + 1100,
            behavior: 'smooth',
          });
        })
        
        return {
          title: key === 'totalEmission' ? 'Total GWP Comparison' : 'Total Volume Comparison',
          labels: labels,
          datasets: [
            {
              backgroundColor: colors,
              data: data
            }
          ]
        }
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
              [this.result_1]:this.items[this.result_1][arr][key][i],
              [this.result_2]:this.items[this.result_2][arr][key][j]
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
        title: key === 'gwpDataSet' ? 'Main Categoory GWP Comparison' : 'Main Categoory Volume Comparison',
        labels: labels,
        datasets: datasets
      }
      
    }
  }
}
</script>

<style>
  .v-text-field__details{
    display: none;
  }
</style>