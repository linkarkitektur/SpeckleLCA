<template>
  <v-row class="pa-4">
    <v-col cols="8" align="left">
      <h1 class="ma-4">Calculation Results</h1>
    </v-col>
    <v-col cols="4" align="right">
      <v-row>
        <v-col cols="8" align="right">
          <v-text-field label="Save As" v-model="result"></v-text-field>
        </v-col>
        <v-col cols="4" align="left">
          <v-btn
            color="primary"
            @click="saveResult"
            :disabled="!result"
          >
            Save Result
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="6" v-for="(chart, key, index) in chartResults" :key="key">
      <Piechart  
        v-if="chart.labels.length"
        :labels="chart.labels" 
        :chartDataSet="index % 2 === 0 ? chart.gwpDataSet : chart.volumeDataSet" 
        :title="chart.title"
        :totalEmission="chart.totalEmission"
      />
    </v-col>
  </v-row>
</template>

<script>
import Piechart from './Piechart.vue';
export default {
  data(){
    return{
      chartResults:null,
      result:null
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

      let subCatlabels = [];
      let subCatGwpDataSet=[];
      let subCatVolumeDataSet=[];

      let materialCategory=[]
      let assemblyCategory=[]
      let ifcMaterial =[]

      let totalEmission = 0;
      let resourceSubTypeCat = [];

      this.chartData.forEach(e=>{
        labels.push(e.category);
        gwpDataSet.push(e.total_gwp);
        volumeDataSet.push(e.total_volume);
        totalEmission += totalEmission + e.total_gwp;

        e.sub_categories.forEach(sub=>{
          subCatlabels.push(sub.name);
          subCatGwpDataSet.push(sub.gwp);
          subCatVolumeDataSet.push(sub.volume);
          resourceSubTypeCat.push(sub.resourceSubType);
          ifcMaterial.push(sub.IFCMATERIAL)
          if(sub.isMultipart){
            assemblyCategory.push(sub);
          }else{
            materialCategory.push(sub);
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

      
      this.chartResults = {
        mainCatGwpData,
        mainCatVolumeData,
        subCategoryGWPData,
        subCategoryVolumeData
      }
      const uniqueIfcMaterial = [...new Set(ifcMaterial)];
      this.initAssemblyMaterialCatChart(uniqueIfcMaterial,assemblyCategory,materialCategory);

      const uniqueSubCategory = [...new Set(resourceSubTypeCat)];
      this.initResourceSubCatChart(uniqueSubCategory, totalEmission);
    },

    initAssemblyMaterialCatChart(uniqueIfcMaterial,assemblyCategory,materialCategory){
      let matCatLabels = [];
      let matCatGwpDataSet = [];
      let matCatVolumeDataSet = [];

      let assemblyCatLabels = [];
      let assemblyCatGwpDataSet = [];
      let assemblyCatVolumeDataSet = [];
      let totalEmissionForAssembly = 0;
      let totalEmissionForMaterial = 0;
      
      
      uniqueIfcMaterial.forEach(e1=>{
        let assemblyGwp = 0;
        let assemblyVol = 0;
        let matGwp = 0;
        let matVol = 0;    
        if(assemblyCategory.length){
          assemblyCatLabels.push(e1);
          assemblyCategory.forEach(e2=>{
            if(e2.gwp){
              totalEmissionForAssembly += e2.gwp;
            }
          
            if(e1 === e2.IFCMATERIAL){
              assemblyGwp += e2.gwp;
              assemblyVol += e2.volume;
            }
          });
          assemblyCatGwpDataSet.push(assemblyGwp);
          assemblyCatVolumeDataSet.push(assemblyVol);
        }
        
        if(materialCategory.length){
          matCatLabels.push(e1);
          materialCategory.forEach(e2=>{
            if(e2.gwp){
              totalEmissionForMaterial += e2.gwp
            }
            
            if(e1 === e2.IFCMATERIAL){
              matGwp += e2.gwp;
              matVol += e2.volume;
            }
          });
          matCatGwpDataSet.push(matGwp);
          matCatVolumeDataSet.push(matVol);
        }
      });

      const matCategoryGWPData = {
        labels:matCatLabels,
        gwpDataSet:matCatGwpDataSet,
        title:'GWP By Material',
        totalEmission:totalEmissionForMaterial/1000
      }
      const matCategoryVolumeData = {
        labels:matCatLabels,
        volumeDataSet:matCatVolumeDataSet,
        title:'Volume By Material',
        totalEmission:totalEmissionForMaterial/1000
      }

      const assemblyCategoryGWPData = {
        labels:assemblyCatLabels,
        gwpDataSet:assemblyCatGwpDataSet,
        title:'GWP By Assembly',
        totalEmission:totalEmissionForAssembly/1000
      }
      const assemblyCategoryVolumeData = {
        labels:assemblyCatLabels,
        volumeDataSet:assemblyCatVolumeDataSet,
        title:'Volume By Assembly',
        totalEmission:totalEmissionForAssembly/1000
      }

      this.chartResults = {
        ...this.chartResults,
        matCategoryGWPData,
        matCategoryVolumeData,
        assemblyCategoryGWPData,
        assemblyCategoryVolumeData
      }
    },

    initResourceSubCatChart(uniqueSubCategory, totalEmission){
      let resourceCatLabels = [];
      let resourceCatGwpDataSet = [];
      let resourceCatVolumeDataSet = [];
      uniqueSubCategory.forEach(e1=>{
        resourceCatLabels.push(e1);
        let gwp = 0;
        let vol = 0;
        this.chartData.forEach(e2=>{
          e2.sub_categories.forEach(e3=>{
            if(e1 === e3.resourceSubType){
              gwp += e3.gwp
              vol += e3.volume
            }
          });
        });
        resourceCatGwpDataSet.push(gwp);
        resourceCatVolumeDataSet.push(vol);
      });

      const resourceSubCategoryGWPData = {
        labels:resourceCatLabels,
        gwpDataSet:resourceCatGwpDataSet,
        title:'GWP By Resource Sub Type',
        totalEmission:totalEmission/1000
      }
      const resourceSubegoryVolumeData = {
        labels:resourceCatLabels,
        volumeDataSet:resourceCatVolumeDataSet,
        title:'Volume By Resource Sub Type',
        totalEmission:totalEmission/1000
      }

      this.chartResults = {
        ...this.chartResults,
        resourceSubCategoryGWPData,
        resourceSubegoryVolumeData
      }

      console.log(this.chartResults);
    },
    saveResult(){
      
    }
  }
}
</script>

<style>

</style>