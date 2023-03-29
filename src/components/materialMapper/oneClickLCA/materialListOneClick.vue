<template>
  <v-card
    v-if="showMaterials"
    max-height="87vh"
    min-height="87vh"
    outlined
  >
    <v-card-title class="px-8">Assign material</v-card-title>
    <v-container
      v-if="!this.currResourceList[0]"
      class="d-flex flex-1 flex-column justify-center align-center"
    >
      <v-progress-circular
        :size="50"
        :width="5"
        color="primary"
        indeterminate
      ></v-progress-circular>
      <p class="body-2 mt-2 primary--text">
        Fetching resouce list please wait...
      </p>
    </v-container>
    <div
      max-height="80vh"
      v-if="this.currResourceList[0]"
      min-height="80vh"
      outlined
      class="px-3 py-1"
    >
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="12" class="py-0 mx-0 my-0">
          <v-text-field
            label="Search by keyword"
            solo
            dense
            v-model="filterData.keyword"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Material Type"
            :items="subTypes"
            hide-selected
            solo
            dense
            v-model="filterData.subType"
            clearables
            @change="subTypeChange"
          >
          </v-combobox>
        </v-col>
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Region"
            :items="areasObj[filterData.subType]"
            :disabled="
                !(
                areasObj[filterData.subType] !== undefined &&
                areasObj[filterData.subType].length !== 0
                )
            "
            hide-selected
            solo
            dense
            v-model="filterData.area"
          >
          </v-combobox>
        </v-col>
      </v-row>
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Is Construction"
            :items="multiPart"
            hide-selected
            solo
            dense
            v-model="filterData.multipart"
            >
          </v-combobox>
        </v-col>
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-btn
            outlined
            text
            dense
            class="float-right grey"
            @click="onSearch"
            >
              Search
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col lg="12">
          <v-simple-table class="px-0" height="44vh" :fixed-header="true">
            <template v-slot:default>
              <thead>
                <tr>
                  <th
                    v-for="item in headers"
                    :key="item.value"
                    :id="item.value"
                    class="text-left"
                    >
                    {{ item.text }}
                  </th>
                </tr>
              </thead>
              <tbody v-if="filteredList && filteredList.length">
                <tr
                  v-for="item in filteredList"
                  :key="item._id"
                  @dblclick="onRowClick(item)"
                >
                  <td>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <div
                          style="max-width: 200px"
                          v-bind="attrs"
                          v-on="item.staticFullName ? on : null"
                        >
                          {{ item.staticFullName }}
                        </div>
                      </template>
                      <span class="tooltip">{{
                        decodeURIComponent(item.staticFullName)
                        }}
                      </span>
                    </v-tooltip>
                  </td>
                  <td>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <div
                            style="max-width: 200px"
                            v-bind="attrs"
                            v-on="item.staticFullName ? on : null"
                        >
                            {{ item.fullName_DK }}
                        </div>
                      </template>
                      <span class="tooltip">{{
                        item.staticFullName
                        }}
                      </span>
                    </v-tooltip>
                  </td>
                  <td>{{ item.resourceSubType }}</td>
                  <td>{{ item.isMultiPart }}</td>
                  <td>{{ item.area }}</td>
                </tr>
              </tbody>
              <tbody v-else>
                <p class="body-2 mt-2 primary--text pt-5">
                    No Materials found.
                </p>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
      <v-card-actions>
        <span class="white px-5 py-5">
          * double click the row to assign the material to the group
        </span>
        <v-spacer></v-spacer>
      </v-card-actions>
    </div>
  </v-card>
  <v-card 
    v-else
    max-height="87vh"
    min-height="87vh"
    outlined
  >
    <v-container class="d-flex flex-1 flex-column justify-center align-center">
      <span class="white px-10 py-10">
        Select an object to assign materials to your left 👈
      </span>
    </v-container>
  </v-card>
</template>

<script>
import {
  FILTER_COUNTRIES,
  COMBINED_UNIT_LIST,
  MULTIPART,
  HEADERS,
} from "@/shared/constants";

import { filterDataFromList } from "@/components/materialMapper/shared/utils/helpers";

export default {
  name: "materialListLCAByg",
  components: {},
  props: ["info"],
  data() {
    return {
      loading: false,
      uniqueCategories: [],
      resourceList: [],
      areas: [],
      filteredList: [],
      filterData: {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      },
      selectedType: "test",
      showMaterials: false,
      selectedCategory: "test",
      areasObj: {},
      subTypes: [],
      multiPart: MULTIPART,
      headers: HEADERS,

    };
  },
  async mounted() {
    this.getResourceList();
  },
  computed: {
    assignMaterials() {
      return this.$store.getters.getAssignMaterials;
    },
    currResourceList() {
      return this.$store.getters.getResourceList;
    }
  },
  watch: {
    assignMaterials: {
      handler(data){
        this.selectedType = data.type;
        this.selectedCategory = data.category;
        this.showMaterials = data.open;
      },
      deep: true,
    },
    currResourceList: {
      handler(data){
      }
    }
  },
  methods: {
    getResourceList() {
      if(this.currResourceList.length == undefined){
        var tempList = require("@/assets/lcaByg/LCAbyg_constructions.json");
        this.$store.dispatch('setResourceList', tempList);
      }
      if (this.currResourceList) {
        console.log("ResourceList loaded correctly");
        this.currResourceList?.forEach((el) => {
          if (FILTER_COUNTRIES.includes(el.area)) {
            if (
              !this.subTypes.includes(el.resourceSubType) &&
              el.resourceSubType
            ) {
              this.subTypes.push(el.resourceSubType);
            }
            if (!this.areasObj[el.resourceSubType]) {
              this.areasObj[el.resourceSubType] = [];
            }
            if (
              this.areasObj[el.resourceSubType] &&
              !this.areasObj[el.resourceSubType].includes(el.area) &&
              el.area
            ) {
              this.areasObj[el.resourceSubType].push(el.area);
            }
          }
        });
      }
    },

    //Saving the material mapping towards the object chosen from objectList
    onRowClick(item) {
      var staticFullName = item.staticFullName;
      var id = item._id;
      let selCat = this.selectedCategory;
      var temporary = false;

      if (this.selectedType) {
        var key = selCat + "#" + this.selectedType;
        this.$store.dispatch('updateCurrentMapper', { key, staticFullName, id, temporary });
      } else {
        for (let data in this.$store.getters.getCurrentMapper) {
          if (data.includes(selCat)) {
            key = data;
            this.$store.dispatch('updateCurrentMapper', { key, staticFullName, id, temporary });
          }
        }
      }
      this.$store.dispatch('closeAsignMaterials');
    },

    onSearch() {
      this.filteredList = this.$store.getters.getResourceList?.filter((el) =>
        filterDataFromList(el, this.filterData)
      );
    },
    subTypeChange(val) {
      this.filterData.area = "";
    },
  },
};
</script>