<template>
  <v-row>
    <v-col cols="6">
      <Piechart  
        :labels="chartResults.mainCatGwpData.labels" 
        :chartDataSet="chartResults.mainCatGwpData.gwpDataSet" 
        :title="chartResults.mainCatGwpData.title"
        :totalEmission="chartResults.mainCatGwpData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.mainCatVolumeData.labels" 
        :chartDataSet="chartResults.mainCatVolumeData.volumeDataSet" 
        :title="chartResults.mainCatVolumeData.title"
        :totalEmission="chartResults.mainCatGwpData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.subCategoryGWPData.labels" 
        :chartDataSet="chartResults.subCategoryGWPData.gwpDataSet" 
        :title="chartResults.subCategoryGWPData.title"
        :totalEmission="chartResults.subCategoryGWPData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.subCategoryVolumeData.labels" 
        :chartDataSet="chartResults.subCategoryVolumeData.volumeDataSet" 
        :title="chartResults.subCategoryVolumeData.title"
        :totalEmission="chartResults.subCategoryVolumeData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.matCategoryGWPData.labels" 
        :chartDataSet="chartResults.matCategoryGWPData.gwpDataSet" 
        :title="chartResults.matCategoryGWPData.title"
        :totalEmission="chartResults.matCategoryGWPData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.matCategoryVolumeData.labels" 
        :chartDataSet="chartResults.matCategoryVolumeData.volumeDataSet" 
        :title="chartResults.matCategoryVolumeData.title"
        :totalEmission="chartResults.matCategoryVolumeData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.assemblyCategoryGWPData.labels" 
        :chartDataSet="chartResults.assemblyCategoryGWPData.gwpDataSet" 
        :title="chartResults.assemblyCategoryGWPData.title"
        :totalEmission="chartResults.assemblyCategoryGWPData.totalEmission"
      />
    </v-col>
    <v-col cols="6">
      <Piechart 
        :labels="chartResults.assemblyCategoryVolumeData.labels" 
        :chartDataSet="chartResults.assemblyCategoryVolumeData.volumeDataSet" 
        :title="chartResults.assemblyCategoryVolumeData.title"
        :totalEmission="chartResults.assemblyCategoryVolumeData.totalEmission"
      />
    </v-col>
  </v-row>
</template>

<script>
import Piechart from './Piechart.vue';
export default {
  data(){
    return{
      chartResults:null
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
    console.log(this.chartData)
    this.initMainCategoryChartData()
  },
  methods:{
    initMainCategoryChartData(){
      let labels = [];
      let gwpDataSet = [];
      let volumeDataSet = [];

      let subCatlabels = [];
      let subCatGwpDataSet=[];
      let subCatVolumeDataSet=[];

      let matCatLabels = []
      let matCatGwpDataSet=[];
      let matCatVolumeDataSet=[];

      let assemblyCatLabels = []
      let assemblyCatGwpDataSet=[];
      let assemblyCatVolumeDataSet=[];

      let totalEmission = 0

      this.chartData.forEach(e=>{
        labels.push(e.category);
        gwpDataSet.push(e.total_gwp);
        volumeDataSet.push(e.total_volume);
        totalEmission += totalEmission + e.total_gwp;

        e.sub_categories.forEach(sub=>{
          subCatlabels.push(sub.name);
          subCatGwpDataSet.push(sub.gwp);
          subCatVolumeDataSet.push(sub.volume);
          if(!sub.isMultipart){
            matCatLabels.push(sub.name);
            matCatGwpDataSet.push(sub.gwp);
            matCatVolumeDataSet.push(sub.volume);
          }else{
            assemblyCatLabels.push(sub.name);
            assemblyCatGwpDataSet.push(sub.gwp);
            assemblyCatVolumeDataSet.push(sub.volume);
          }
        });
      });

      const mainCatGwpData = {
        labels,
        gwpDataSet,
        title:'GWP By Main Category',
        totalEmission:totalEmission/1000
      }  

      const mainCatVolumeData = {
        labels,
        volumeDataSet,
        title:'Volume By Main Category',
        totalEmission:totalEmission/1000
      } 


      const subCategoryGWPData = {
        labels:subCatlabels,
        gwpDataSet:subCatGwpDataSet,
        title:'GWP By Sub Category',
        totalEmission:totalEmission/1000
      }

      const subCategoryVolumeData = {
        labels:subCatlabels,
        volumeDataSet:subCatVolumeDataSet,
        title:'Volume By Sub Category',
        totalEmission:totalEmission/1000
      }

      const matCategoryGWPData = {
        labels:matCatLabels,
        gwpDataSet:matCatGwpDataSet,
        title:'GWP By Material',
        totalEmission:totalEmission/1000
      }
      const matCategoryVolumeData = {
        labels:matCatLabels,
        volumeDataSet:matCatVolumeDataSet,
        title:'Volume By Material',
        totalEmission:totalEmission/1000
      }
      const assemblyCategoryGWPData = {
        labels:assemblyCatLabels,
        gwpDataSet:assemblyCatGwpDataSet,
        title:'GWP By Assembly',
        totalEmission:totalEmission/1000
      }
      const assemblyCategoryVolumeData = {
        labels:assemblyCatLabels,
        volumeDataSet:assemblyCatVolumeDataSet,
        title:'Volume By Assembly',
        totalEmission:totalEmission/1000
      }
      
      this.chartResults = {
        mainCatGwpData,
        mainCatVolumeData,
        subCategoryGWPData,
        subCategoryVolumeData,
        matCategoryGWPData,
        matCategoryVolumeData,
        assemblyCategoryGWPData,
        assemblyCategoryVolumeData
      }

      console.log(this.chartResults)
    }
  }
}
</script>

<style>

</style>