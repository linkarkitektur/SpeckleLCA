<template>
  <v-row>
    <v-col cols="6">
      <Piechart v-if="mainCatGwpData" :labels="mainCatGwpData.labels" :chartDataSet="mainCatGwpData.gwpDataSet"/>
    </v-col>
    <v-col cols="6">
      <Piechart v-if="mainCatVolumeData" :labels="mainCatVolumeData.labels" :chartDataSet="mainCatVolumeData.volumeDataSet"/>
    </v-col>
  </v-row>
</template>

<script>
import Piechart from './Piechart.vue';
export default {
  data(){
    return{
      mainCatGwpData:null,
      mainCatVolumeData:null,
    }
  },
  components: { Piechart },
  props:{
    chartData:{
      type:Array,
      required:true
    }
  },
  mounted(){
    this.initMainCategoryChartData()
  },
  methods:{
    initMainCategoryChartData(){
      let labels = [];
      let gwpDataSet = [];
      let volumeDataSet = [];

      this.chartData.forEach(e=>{
        labels.push(e.category);
        gwpDataSet.push(e.total_gwp);
        volumeDataSet.push(e.total_volume)
      });

      this.mainCatGwpData = {
        labels,
        gwpDataSet
      }  
      this.mainCatVolumeData = {
        labels,
        volumeDataSet
      }     
    }
  }
}
</script>

<style>

</style>