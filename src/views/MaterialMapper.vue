<template>
    <div>
        <v-row class="justify-center py-1 px-1">
        <v-col lg="5" sm="12" xs="12">
            <v-card max-height="87vh" min-height="87vh" outlined class="bg">
            <v-card-title>Material mapper</v-card-title>
            
                <mapper />
                
                <objectList />
                
                <calculateOneClick> </calculateOneClick>

            </v-card>
        </v-col>
            <v-col lg="7" sm="12" xs="12">

                <materialListOneClick> </materialListOneClick>

            </v-col>
        </v-row>
        <div id="charts" ref="charts">
          <div v-if="isResults">
            <sunburst> </sunburst>
          </div>
        </div>
    </div>
</template>

<script>
import mapper from "@/components/materialMapper/shared/mapper.vue";

import objectList from "@/components/materialMapper/shared/objectList.vue";

//import calculateLCAByg from '@/components/materialMapper/lcaByg/calculateLCAByg.vue';
import calculateOneClick from "@/components/materialMapper/oneClickLCA/calculateOneClick.vue";

//import materialListLCAByg from "@/components/materialMapper/lcaByg/materialListLCAByg.vue";
import materialListOneClick from "@/components/materialMapper/oneClickLCA/materialListOneClick.vue";

import sunburst from "@/components/charts/sunburst.vue";

export default {
    name: "MaterialMapper",
    components: {
      mapper,
      objectList,
      //calculateLCAByg,
      calculateOneClick,
      //materialListLCAByg,
      materialListOneClick,
      sunburst,
    },
    props: ["info"],
    data() {
        return {
            loading: false,
            buttonLoader: false,
            sourceSoftware: null,
            uniqueCategories: objectList.data.uniqueCategories,
            selectedMapperEmpty: true,
            currentCategoryMapper: [],
            filteredDataFromList: [],
        }
    },
    computed: {
      isResults () {
        if(Object.keys(this.$store.getters.getResults) <= 0){
          return false;
        }else{
          return Object.keys(this.$store.getters.getResults.children).length > 0
        }
      },
      chartData () {
        return this.$store.getters.getResults;
      }
    },

};
</script>

<style lang="scss" scoped>
.bg {
  background-color: #f8f8f8;
}
.pdiv {
  width: 100%;
  background-color: #e6e6e6;
  padding-left: 10px;
  padding-right: 10px;
  vertical-align: middle;
}
.row:first-child > .pdiv {
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
}
.row:last-child > .pdiv {
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
.cdiv {
  background-color: #f8f8f8;
  width: 100%;
  padding: 10px;
  vertical-align: middle;
}
.cdiv2 {
  background-color: #f8f8f8;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  vertical-align: middle;
}
.tooltip {
  width: 100px;
  word-wrap: break-word;
}

.scroll-box {
  overflow: scroll;
  padding: 1em;
}

.v-card {
  display: flex !important;
  flex-direction: column;
}

.v-card__text {
  flex-grow: 1;
  overflow: auto;
}

.v-input .v-input__control .v-text-field__details,
.c-input
  .v-input
  .v-input__control
  .v-text-field.v-text-field--enclosed
  .v-text-field__details {
  margin: 0 !important;
}

</style>