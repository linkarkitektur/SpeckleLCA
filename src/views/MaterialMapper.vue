<template>
   <div>
    <v-row class="justify-center py-1 px-1">
      <v-col lg="5" sm="12" xs="12">
        <v-card max-height="87vh" min-height="87vh" outlined class="bg">
          <v-card-title>Material mapper</v-card-title>
          <div style="height:100px">
            <v-row>
              <v-col lg="6" sm="12" xs="12" class="px-10">
                <v-combobox
                  v-model="selectedMapper"
                  :items="savedMapperList"
                  item-text="text"
                  label="Select Saved Mapper"
                  :disabled="loading || buttonLoader"
                  @change="onMapperChange"
                >
                  <template v-slot:item="{ item }">
                    {{ item.text }}
                    <v-spacer></v-spacer>
                    <v-list-item-action @click.stop class="flex-row">
                      <v-btn icon @click.stop.prevent="setAsDefault(item)">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon :color="item.color" v-on="on" v-bind="attrs"
                              >mdi-check</v-icon
                            >
                          </template>
                          <span class="tooltip">{{ item.tooltip }}</span>
                        </v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        @click.stop.prevent="deleteMapper(item)"
                        v-if="item.color === 'grey'"
                      >
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon color="red" v-on="on" v-bind="attrs"
                              >mdi-delete</v-icon
                            >
                          </template>
                          <span class="tooltip">Delete Mapper</span>
                        </v-tooltip>
                      </v-btn>
                    </v-list-item-action>
                  </template>
                </v-combobox>
              </v-col>
              <v-col lg="6" sm="12" xs="12" class="px-8 ">
                <v-btn
                  color="primary"
                  class="float-right mt-2"
                  outlined
                  text
                  :disabled="loading || buttonLoader"
                  @click="createNew"
                >
                  Create New Mapping</v-btn
                >
                <v-dialog v-model="dialogMapper" persistent max-width="600px">
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Mapper Name</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              label="Mapper name"
                              required
                              v-model="mapperName"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        v-if="savedMapperList[0]"
                        color="blue darken-1"
                        text
                        @click="dialogMapper = false"
                      >
                        Close
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="onSave">
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </div>

          <div class="overflow-y-auto px-2 ">
            <v-container
              v-if="loading"
              class="d-flex flex-1 flex-column justify-center align-center"
            >
              <v-progress-circular
                :size="50"
                :width="5"
                color="primary"
                indeterminate
              ></v-progress-circular>
              <p class="body-2 mt-2 primary--text">Loading...</p>
            </v-container>
            <div class="d-flex flex-1 align-start px-1 py-5">
              <table width="100%">
                <v-row v-for="item in uniqueCategories" :key="item.id">
                  <tr
                    @click="toggle(item.id , item.children.length)"
                    :class="{ opened: opened.includes(item.id) }"
                    class="pdiv"
                  >
                    <td style="width:30%; cursor:pointer;" :style="{'pointer-events': item.children.length > 1 ? 'all' : 'none' }">
                      {{ item.category }}
                      <v-icon
                        small
                        v-if="item.children.length > 1 && !opened.includes(item.id)"
                      >
                      mdi-chevron-right
                      </v-icon>
                      <v-icon
                        small
                        v-if="item.children.length > 1 && opened.includes(item.id)"
                      >
                      mdi-chevron-down
                      </v-icon>
                    </td>
                    <td style="width:45%;">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            class="mt-6"
                            v-bind="attrs"
                            v-on="
                              currentCategoryMapper[item.category][
                                'staticFullName'
                              ]
                                ? on
                                : null
                            "
                            v-model="
                              currentCategoryMapper[item.category][
                                'staticFullName'
                              ]
                            "
                            label="No Material Assigned"
                            readonly
                            solo
                            dense
                          ></v-text-field>
                        </template>
                        <span
                          class="tooltip"
                          v-if="
                            currentCategoryMapper[item.category]['staticFullName']
                          "
                          >{{
                            currentCategoryMapper[item.category]["staticFullName"]
                          }}</span
                        >
                      </v-tooltip>
                    </td>
                    <td style="width:15%; text-align: center;">
                      <span v-if="item.area" class="mt-5 d-block text-caption">
                        {{item.area.toFixed(2)}} m2
                      </span>
                    </td>
                    <td style="width:10%;padding-left: 10px;">
                      <v-btn
                        :key="item.id"
                        :color="
                          selectedcategory === item.category && !selectedType
                            ? 'grey'
                            : 'primary'
                        "
                        :class="
                          selectedcategory === item.category && !selectedType
                            ? 'black--text'
                            : ''
                        "
                        @click.stop.prevent="openAssignMaterial(item.category)"
                        :disabled="buttonLoader"
                      >
                        Assign
                      </v-btn>
                    </td>
                  </tr>
                  <div v-if="opened.includes(item.id)" class="cdiv">
                    <tr v-for="child in item.children" :key="child.id">
                      <td style="width:30%">
                        {{ child.type }}
                      </td>
                      <td style="width:45%;">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              class="mt-6"
                              v-bind="attrs"
                              v-on="
                                currentCategoryMapper[
                                  item.category + '#' + child.type
                                ]['staticFullName']
                                  ? on
                                  : null
                              "
                              v-model="
                                currentCategoryMapper[
                                  item.category + '#' + child.type
                                ]['staticFullName']
                              "
                              label="No Material Assigned"
                              readonly
                              solo
                              dense
                            ></v-text-field>
                          </template>
                          <span
                            class="tooltip"
                            v-if="
                              currentCategoryMapper[
                                item.category + '#' + child.type
                              ]['staticFullName']
                            "
                            >{{
                              currentCategoryMapper[
                                item.category + "#" + child.type
                              ]["staticFullName"]
                            }}</span
                          >
                        </v-tooltip>
                      </td>
                      <td style="width:15%; text-align: center;">
                        <span v-if="child.parameter.HOST_AREA_COMPUTED" class="mt-5 d-block text-caption">
                          {{child.area.toFixed(2)}} m2
                        </span>
                      </td>
                      <td style="width:10%;padding-left: 10px;">
                        <v-btn
                          :key="child.id"
                          :color="
                            selectedType === child.type ? 'green' : 'primary'
                          "
                          :class="
                            selectedType === child.type ? 'white--text' : ''
                          "
                          @click.stop.prevent="
                            openAssignMaterial(item.category, child.type)
                          "
                          :disabled="buttonLoader"
                        >
                          Assign
                        </v-btn>
                      </td>
                    </tr>
                    <div class="cdiv2" v-if="item.children.length === 0">
                      <td colspan="3">No records found.</td>
                    </div>
                  </div>
                </v-row>
              </table>
            </div>
            <div class="text-center ma-2" v-if="!loading">
                  <v-dialog
                    v-model="assignMaterialdialog"
                    width="500"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="red lighten-2"
                        dark
                        fab
                        v-bind="attrs"
                        v-on="on"
                      >
                      <v-icon dark> mdi-plus</v-icon>
                      </v-btn>
                    </template>
    
                    <v-card>
                      <v-card-title class="text-h5 grey lighten-2">
                        Add Class
                      </v-card-title>
    
                      <div class="pa-4">
                        <v-text-field
                          label="Class name"
                          :rules="rules"
                          hide-details="auto"
                          v-model="className"
                        ></v-text-field>
                        <v-text-field
                          class="mt-4"
                          type="number"
                          label="Quantity"
                          :rules="rules"
                          hide-details="auto"
                          v-model="quantity"
                        ></v-text-field>
                      </div>
    
                      <v-divider></v-divider>
    
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          text
                          @click="addCategory()"
                        >
                          Add
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
              </div>
          </div>
          <v-row class="p-8 ma-1">
              <v-col cols="6" align="center">
                <v-btn
                  class="ma-2"
                  :disabled="loading || selectedMapperEmpty"
                  color="primary"
                  @click="generateJSON"
                >
                  Generate JSON
                </v-btn>
              </v-col>
              <v-col cols="6" align="center">
                <v-btn
                  class="ma-2"
                  :loading="buttonLoader"
                  :disabled="loading || selectedMapperEmpty || buttonLoader"
                  color="primary"
                  @click="onStartCalculation"
                >
                  Start Calculation
                </v-btn>
              </v-col>            
            </v-row>
        </v-card>
      </v-col>
      <v-col lg="7" sm="12" xs="12">
        <v-card
          v-if="selectedcategory"
          max-height="87vh"
          min-height="87vh"
          outlined
        >
        <v-card-title class="px-8">Assign material</v-card-title>
          <v-container
            v-if="!resourceList[0]"
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
            v-if="resourceList[0]"
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
                ></v-text-field>
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
                ></v-combobox>
              </v-col>
              <v-col lg="6" class="py-0 mx-0 my-0">
                <v-combobox
                  label="Region"
                  :items="areasObj[filterData.subType]"
                  :disabled="!(areasObj[filterData.subType] !== undefined && areasObj[filterData.subType].length !== 0)"
                  hide-selected
                  solo
                  dense
                  v-model="filterData.area"
                ></v-combobox>
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
                ></v-combobox>
              </v-col>
              <v-col lg="6" class="py-0 mx-0 my-0">
                <v-btn outlined text dense class="float-right grey" @click="onSearch">
                  Search</v-btn
                >
              </v-col>
            </v-row>
            <v-row>
              <v-col lg="12">
                <v-simple-table class="px-0" height="44vh" :fixed-header=true>
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
                                style="max-width:200px"
                                v-bind="attrs"
                                v-on="item.staticFullName ? on : null"
                              >
                                {{ item.staticFullName }}
                              </div>
                            </template>
                            <span class="tooltip">{{ item.staticFullName }}</span>
                          </v-tooltip>
                        </td>
                        <td>{{ item.resourceSubType }}</td>
                        <!-- <td>
                          {{
                            item.combinedUnits.length > 0
                              ? item.combinedUnits.join(",")
                              : ""
                          }}
                        </td> -->
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
              <span class="white px-5 py-5" 
                >* double click the row to assign the material to the group</span
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <div id="charts" ref="charts">
      <div v-if="chartData.length">
        <ChartsContainer :chart-data="chartData" :mapper-name="mapperName" :results="chartResults"/>
      </div>
    </div>
  </div>
</template>

<script>
import { getStreamObject } from "@/utils/speckleUtils";
import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "@firebase/firestore";
import {
  FILTER_COUNTRIES,
  COMBINED_UNIT_LIST,
  MULTIPART,
  HEADERS,
} from "./../shared/constants";
import { filterDataFromList, getDefaultData, isObjectEmpty } from "./../shared/helper";
import {utils , read, write} from "xlsx";
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');
import axios from 'axios';

import db from "./../firebase/firebaseinit";
import ChartsContainer from "../components/ChartsContainer.vue";

require("@/assets/merged_rest.json")

export default {
  name: "MaterialMapper",
  components: { ChartsContainer },
  props: ["info"],
  data() {
    return {
      opened: [],
      dialog: false,
      dialogMapper: false,
      selectedMapper: null,
      categoryList: {},
      loader: null,
      stream: null,
      objectId: null,
      loading: false,
      categories: [],
      uniqueCategories:[],
      savedMapperList: [],
      mapperName: "",
      resourceList: [],
      areas: [],
      areasObj: {},
      subTypes: [],
      multiPart: MULTIPART,
      filteredList: [],
      filterData: {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      },
      selected: {},
      singleSelect: true,
      headers: HEADERS,
      currentCategoryMapper: {},
      defaultCategoryMapper: {},
      selectedcategory: "",
      rules: [
        value => !!value || 'Required.'
      ],
      assignMaterialdialog:false,
      className:null,
      quantity:null,
      selectedMapperEmpty:true,
      selectedType: "",
      docSnap:null,
      excelFile:null,
      fileToken:null,
      chartData:[],
      buttonLoader: false,
      chartResults:null
    };
  },
  computed: {
    streamId() {
      return this.$route.params.id;
    },
    selectedCommit() {
      return this.$store.getters.selectedCommit;
    },
    filePath() {
      return require("@/assets/merged_rest.json")
    }
  },
  async mounted() {
    // this.processStreamObjects();
    this.getResourceList();
    this.getMappers();

    if (this.streamId) {
      this.getStream();
    }
    this.getAccessToken()
  },
  watch: {
    streamId: {
      handler: async function(val) {
        if (val) this.getStream();
      },
    },
    selectedCommit: {
      handler: async function() {
        this.objectId = this.selectedCommit.referencedObject;
      },
    },
    objectId: {
      handler: function() {
        this.processStreamObjects();
      },
    },
    selectedMapper:{
      handler:function(val){
        this.selectedMapperEmpty = true
        for(let data in val.data){
          if(val.data[data].staticFullName){
            this.selectedMapperEmpty = false
          }
        }
      },
      deep: true,
    }
  },
  methods: {
    toggle(id , length) {
      if(length <= 1 ){
        return
      }
      const index = this.opened.indexOf(id);
      if (index > -1) {
        this.opened.splice(index, 1);
      } else {
        this.opened.push(id);
      }
    },
    async getMappers() {
      const colRef = collection(db, 'mappers');
      const docRef = doc(colRef,this.streamId);
      const snap = await getDoc(docRef);
      if(snap.exists()){
        this.savedMapperList = Object.values(snap.data());
        this.savedMapperList?.forEach((el) => {
          if (el.isDefault) {
            this.selectedMapper = { ...el };
            this.currentCategoryMapper = { ...el.data };
          }
        });
      }else{
        this.mapperName = "Default";
        this.dialogMapper = true;
      }
    },
    async updateMappers(newData) {
      const colRef = collection(db, 'mappers');
      const docRef = doc(colRef,this.streamId)
      setDoc(docRef,{...newData});
    },
    getResourceList() {
      const ACCEESS_TOKEN = `${process.env.VUE_APP_SPECKLE_NAME}.OCAccessToken`;
      const SERVER_URL = process.env.VUE_APP_ONE_CLICK_SERVER_URL;
      let access_token = localStorage.getItem(ACCEESS_TOKEN);
      let bearer = "Bearer " + access_token;
      const fetchPromise = fetch(
        `${SERVER_URL}/getResourceLibrary?dataCategory=fullResourceList`,
        {
          method: "GET",
          headers: {
            Authorization: bearer,
            "Content-Type": "application/json",
          },
        }
      );
      fetchPromise
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          this.resourceList = result?.resources?.filter((el) => {
            let canAdd = false;
            el.combinedUnits.forEach((el2) => {
              if (COMBINED_UNIT_LIST.includes(el2)) {
                canAdd = true;
              } else {
                el.combinedUnits = el.combinedUnits.filter(
                  (el3) => el3 !== el2
                );
              }
            });

            return canAdd && FILTER_COUNTRIES.includes(el.area) ? el : null;
          });

          if (this.resourceList) {
            console.log(this.areasObj)
            this.resourceList?.forEach((el) => {
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
        });
    },

    setAsDefault(item) {
      const data = getDefaultData(item, this.savedMapperList);
      this.saveMapper(data);
    },

    deleteMapper(item) {
      this.savedMapperList = this.savedMapperList.filter(
        (el) => el.text !== item.text
      );
      if (this.selectedMapper.text === item.text) {
        this.selectedMapper = this.savedMapperList[0];
      }
      this.saveMapper(this.savedMapperList);
      this.onMapperChange(this.selectedMapper)
    },

    subTypeChange(val) {
      this.filterData.area = "";
    },

    onRowClick(item) {
      this.selected = item;
      let key = this.selectedcategory;
      if (this.selectedType) {
        key = this.selectedcategory + "#" + this.selectedType;
        this.currentCategoryMapper[key] = {
        ...this.currentCategoryMapper[key],
        ...item
        };
      }else{
        for(let data in this.currentCategoryMapper){
          if(data.includes(key)){
            this.currentCategoryMapper[data] = {
              ...this.currentCategoryMapper[data],
              ...item
            }
          }
        }
      }
      
      
      const i = this.savedMapperList?.findIndex(
        (_element) => _element.text === this.selectedMapper.text
      );
      if (i > -1){
        this.savedMapperList[i]["data"] = { ...this.currentCategoryMapper };
        this.selectedMapper['data'] = {...this.currentCategoryMapper}
      }
  
      this.filterData = {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      };
      this.filteredList = [];
      if(!this.currentCategoryMapper[key].isTemporary){
        this.saveMapper(this.savedMapperList);
      }
    },

    createNew() {
      this.dialogMapper = true;
    },
    openAssignMaterial(category, type) {
      // this.dialog = true;
      this.selectedcategory = category;
      this.filteredList = [];
      this.filterData = {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      };
      if (type) {
        this.selectedType = type;
      } else {
        this.selectedType = "";
      }
    },

    onSearch() {
      this.filteredList = this.resourceList?.filter((el) =>
        filterDataFromList(el, this.filterData)
      );
    },

    onMapperChange(event) {
      this.categories = this.categories.filter(e=> !e.isTemporary);
      this.uniqueCategories = this.uniqueCategories.filter(e=> !e.isTemporary);
      this.mapperName = event.text;
      const i = this.savedMapperList?.findIndex(
        (_element) => _element.text === event.text
      );
      if (i > -1) this.currentCategoryMapper = this.savedMapperList[i]?.data;
      else
        this.savedMapperList.push({
          text: this.mapperName,
          data: { ...this.currentCategoryMapper },
          color: "grey",
          isDefault: false,
          tooltip: "Make it as default",
        });
      this.chartData = [];
    },

    onSave() {
      const i = this.savedMapperList?.findIndex(
        (_element) => _element.text === this.mapperName
      );
      if (i > -1) {
        this.savedMapperList[i]["data"] = { ...this.currentCategoryMapper };
        this.selectedMapper = {
          text: this.mapperName,
          data: { ...this.currentCategoryMapper },
        };
      } else {
        this.savedMapperList.push({
          text: this.mapperName,
          data: { ...this.defaultCategoryMapper },
          color: this.savedMapperList.length === 0 ? "green" : "grey",
          isDefault: this.savedMapperList.length === 0 ? true : false,
          tooltip:
            this.savedMapperList.length === 0
              ? "Selected as default"
              : "Make it as default",
        });
        this.selectedMapper = {
          text: this.mapperName,
          data: { ...this.defaultCategoryMapper },
        };
      }
      
      this.dialogMapper = false;
      this.saveMapper(this.savedMapperList);
      setTimeout(() => {
        this.categories?.forEach((el) => {
          if (el.children?.length > 0) {
            el.children?.forEach((el) => {
              this.currentCategoryMapper[el.category + "#" + el.type] = {
                staticFullName: "",
                types: {},
              };
            });
          } else {
            this.currentCategoryMapper[el.category] = {
              staticFullName: "",
              types: {},
            };
          }
        });
      });
      this.onMapperChange(this.selectedMapper)
    },

    saveMapper(items) {
      if (this.streamId) {
        this.updateMappers(items);
      }
    },
    async getStream() {
      this.$store.dispatch("getStreamAction", {
        streamId: this.streamId,
        limit: 1,
        cursor: null,
      });
    },

    async processStreamObjects() {
      this.loading = true;

      let res = await getStreamObject(
        this.$route.params.id,
        this.$route.params.objectId
      );
      this.categories = [];
      let i = 1;
      for (let category in res.data) {
        if (category?.includes("@")) {
          const cat = category?.replace("@", "");
          const subCategory = []
          res.data[category].forEach(e1=>{
            res.children.objects.find(e2=>{
              if(e1.referencedId === e2.id && e2.data.type !== null && (e2.data.height || e2.data.parameters.HOST_AREA_COMPUTED.value || e2.data.parameters.HOST_VOLUME_COMPUTED.value)){
                let item = {
                  id: e2.id,
                  type: e2.data.type,
                  parameter: {
                    height:e2.data.height,
                    HOST_AREA_COMPUTED: e2.data.parameters.HOST_AREA_COMPUTED.value,
                    HOST_VOLUME_COMPUTED: e2.data.parameters.HOST_VOLUME_COMPUTED.value
                  }
                }
                subCategory.push(item);
                if (!this.currentCategoryMapper[cat + "#" + e2?.data?.type]) {
                  this.currentCategoryMapper[cat + "#" + e2?.data?.type] = {
                    staticFullName: "",
                  };
                }
                if(!this.defaultCategoryMapper[cat + "#" + e2?.data?.type]){
                  this.defaultCategoryMapper[cat + "#" + e2?.data?.type] = {
                    staticFullName: "",
                  };
                }
              }
            })
          });
          
          if(subCategory.length){
            this.categories.push({
              id: i,
              category: cat,
              children: subCategory
            });
            i++;
          }
          
          if (!this.currentCategoryMapper[cat]) {
            this.currentCategoryMapper[cat] = { staticFullName: "" };
          }
          if(!this.defaultCategoryMapper[cat]){
            this.defaultCategoryMapper[cat] = { staticFullName: "" };
          }
        }
      }
      this.categories.forEach(e1=>{
        const type = []
        const item = {
          id:e1.id,
          category:e1.category,
          children:[],
          area:0
        }
        e1.children.forEach(e2=>{
          if(!type.includes(e2.type)){
            e2.area = 0;
            type.push(e2.type)
            item.children.push(e2)
          }
          if(e2.parameter?.HOST_AREA_COMPUTED){
            item.area += e2.parameter?.HOST_AREA_COMPUTED
          }
        });

        item.children.forEach(t=>{
          let sum = 0
          e1.children.forEach(e2=>{
            if(t.type === e2.type && e2.parameter?.HOST_AREA_COMPUTED){
              sum += e2.parameter.HOST_AREA_COMPUTED
            }
          })
          t.area = sum
        })
        
        this.uniqueCategories.push(item)
      });
      this.loading = false;
    },

    getConstructionsJSON(){
      var nodes = new Array();
      //const nodes = [];
      const data = this.selectedMapper.data;
      const elementUUID = uuidv4();
      const element_properties = {'id': elementUUID,  "name": { "Danish": "Constructions","English": "Constructions","German": "Constructions" }, "source": "User", "comment": "comment", "enabled": true, "active": true}
      const element_set = {'Element': element_properties}
      const element_node = {'Node': element_set}

      for(const category in data){
        const staticFullName = data[category].staticFullName;
        //const isMultiPart = data[category].isMultiPart;
        //const combinedUnits = data[category].combinedUnits || [];
        
        //if(staticFullName && category.includes('#')){
        const unique_const_UUID = uuidv4();

        const element_edge_details = {'id': uuidv4(),'amount': 999, 'enabled': true}
        const element_edge_data = [{'ElementToConstruction': element_edge_details}, elementUUID, unique_const_UUID]
        const element_edge = {'Edge': element_edge_data}


        const construction_properties = {'id': unique_const_UUID,  'name': {'Danish': staticFullName, 'English': staticFullName},'unit': "M2", 'source': 'User',"comment": "comment",'layer': 1,'locked': true};
        
        const construction_set = {'Construction': construction_properties};

        const construction_node = {'Node': construction_set};
        //    CLASS:category,
        //    MATERIAL:staticFullName,
        //    QUANTITY: this.getMaterialQuantity(category,isMultiPart,combinedUnits),
        //    QTY_TYPE: isMultiPart ? 'M2' : !isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m")) ? 'M3' : 'M',
        //    THICKNESS_MM:'',
        //    TALO2000:'',
        //    COMMENT:''
        //  }
        

        const beton_uuid = "11c8727c-e603-52e6-882d-ce650729a8a0"



        ////////CONSTRUCTION EDGES

        const construction_edge_id = uuidv4();
        const construction_edge_details = {'id': construction_edge_id,'amount': 100, 'unit': "M2", 'lifespan': 50,     'demolition': false,     'enabled': true,     'delayed_start': 0}
        const construction_edge_data = [{'ConstructionToProduct': construction_edge_details}, unique_const_UUID, beton_uuid]
        const construction_edge = {'Edge': construction_edge_data}



        nodes = nodes.concat(element_edge)
        nodes = nodes.concat(construction_node)
        nodes = nodes.concat(construction_edge)

        //nodes.push(element_edge)
        //nodes.push(construction_node)
        //nodes.push(construction_edge)
        //}
      }

      //CATEGORY EDGES



      const category_edge_id = uuidv4();
      const category_edge_details = {'id': category_edge_id, 'enabled': true}
      const category_edge_data = [{'CategoryToElement': category_edge_details}, "069983d0-d08b-405b-b816-d28ca9648956", elementUUID]
      const category_edge = {'Edge': category_edge_data}


      var constructionsJSON = new Array();
      constructionsJSON = constructionsJSON.concat(element_node);
      constructionsJSON = constructionsJSON.concat(nodes);
      constructionsJSON = constructionsJSON.concat(category_edge);

      //const constructionsJSON = [];
      //constructionsJSON.push(element_node);
      //constructionsJSON.push(nodes);
      //constructionsJSON.push(category_edge);

      console.log(constructionsJSON);

      return constructionsJSON;
    },


    loadJSONtemplate(){
      //var path = "@/assets/merged_rest.json"
      var obj = this.filePath;

      //console.log(path)
      
      

      //var loaded = require(path);
      //var obj = JSON.parse(loaded);

      return obj;
    },

    generateBuildingJSON(){



      const buildingJSON = [
        
          {
              "Node": {
                  "Building": {
                      "id": "6d766aa5-50aa-4005-ab35-29f2fb82ddad",
                      "name": {
                          "Danish": "Building file created via JsonLCABygExporter",
                          "English": "Building file created via JsonLCABygExporter"
                      },
                      "address": "XXX",
                      "owner": "",
                      "description": "Import from Excel",
                      "building_type": "Other",
                      "heated_floor_area": 10108,
                      "gross_area": 9239,
                      "gross_area_above_ground": 9239,
                      "storeys_above_ground": 1,
                      "storeys_below_ground": 0,
                      "storey_height": 3,
                      "initial_year": 2022,
                      "calculation_timespan": 50,
                      "calculation_mode": "SC",
                      "lca_advisor": "Bjerg Arkitektur",
                      "building_regulation_version": "BR2018",
                      "plot_area": 1000,
                      "outside_area": 0,
                      "energy_class": "LowEnergy"
                  }
              }
          },
          {
            "Edge": [
                {
                    "MainBuilding": "15867192-86b7-40a8-9936-83d9e998516d"
                },
                "e9e6e798-390e-4419-a1fa-3b46a8ba5b8d",
                "6d766aa5-50aa-4005-ab35-29f2fb82ddad"
            ]
          },
          {
              "Edge": [
                  {
                      "BuildingToRoot": "bc35b94d-b8c0-4b8c-9bf3-3f63acc94063"
                  },
                  "6d766aa5-50aa-4005-ab35-29f2fb82ddad",
                  "216cf5d6-3e9d-43ec-b0d8-5aee02240c28"
              ]
          },
          {
              "Edge": [
                  {
                      "BuildingToOperation": "0c35b94d-b8a0-4bec-92f3-3463acc94064"
                  },
                  "6d766aa5-50aa-4005-ab35-29f2fb82ddad",
                  "0338d31e-3876-440d-a88c-2daa2dd81942"
              ]
          }
        
        ];

           
      return buildingJSON;
    },



    generateJSON(){
      const constructionsJSON = this.getConstructionsJSON();
      //const worksheet = utils.json_to_sheet(rows);
      const buildingJSON = this.generateBuildingJSON();
      //writeFile(workbook,`${this.selectedMapper.text}.txt`);
      const restJSON = this.loadJSONtemplate();
      
      //JSON_data.append(buildingJSON);
       
      var mergedJSON = new Array();



      mergedJSON = mergedJSON.concat(buildingJSON);
      mergedJSON = mergedJSON.concat(constructionsJSON);
      mergedJSON = mergedJSON.concat(restJSON);

      

      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(mergedJSON, null, 2)], {
        type: "text/plain"
      }));
      a.setAttribute("download", "specklelca.json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    


    },

    onStartCalculation(){
      this.loader = 'buttonLoader';
      this.buttonLoader = true
      const rows = this.getJSONRows();
      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, `${this.selectedMapper.text}.xlsx`);
      const wopts = { bookType:"xlsx", bookSST:false, type:"array" };
      const wbout = write(workbook,wopts);
      this.excelFile = new Blob([wbout],{type:"application/octet-stream"});
      this.startCalculation();
    },

    getMaterialQuantity(category,isMultiPart, combinedUnits){
      /**
       * If the user selected material's multipart is true then  take the area.
       */
      if(isMultiPart){
        return this.calculateMaterialQuantity(category,'HOST_AREA_COMPUTED');

      /**
       * If the user selected material's multipart is false and the combined unit is M3 then take the volume.
       * if the multipart is false and combined unit contains both M and M3 then consider M3 (volume)
       */
      }else if(!isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m"))){
        return this.calculateMaterialQuantity(category,'HOST_VOLUME_COMPUTED');

      /**
       * If the user selected material's multipart is false and the combined unit is M then take the height.
       * Height (convert the value to m  if the unit is not in m) if the unit is in mm then divide it by 1000
       */ 
      }else if(!isMultiPart && combinedUnits.includes("m")){
        return this.calculateMaterialQuantity(category,'height',1000);
      }
    },

    calculateMaterialQuantity(category,parameter, divisor=1){
      let sum = 0
      if(category.includes('#')){
        this.categories.forEach(e1=>{
          if(e1.category === category.split('#')[0]){
            e1.children.forEach(e2=>{
              if(e2.type === category.split('#')[1]){
                sum = sum + e2.parameter[parameter] / divisor
              }
            })
          }
        })
      }
      return sum
    },

    addCategory(){
      if(this.className && this.quantity){
         this.assignMaterialdialog = false;
         let category = {
          id:this.categories.length + 1,
          category: this.className,
          children:[
            {
              id:this.categories.length + 1,
              type: this.className,
              parameter:{
                HOST_AREA_COMPUTED: Number(this.quantity),
                HOST_VOLUME_COMPUTED:Number(this.quantity),
                height:Number(this.quantity)
              }
            }
          ],
          isTemporary:true
         }
         this.currentCategoryMapper[this.className]={ staticFullName: "", isTemporary:true };
         this.currentCategoryMapper[this.className+'#'+this.className]={ staticFullName: "", isTemporary:true };
         this.categories.push(category);
         this.uniqueCategories.push(category);
      }
    },

    async startCalculation(){
      this.chartData = [];
      if(this.accessToken){
        const formData = new FormData()
        this.fileToken = `LINK-LCA-${Date.now()}`
        formData.append('fileToken',this.fileToken);
        formData.append('importFile',this.excelFile);
        formData.append('securityToken','Vs2cmN10eZq6iMGcXIre');
        formData.append('APICalculation','TRUE');
        try {
          const response = await axios.post('https://oneclicklcaapp.com/app/api/startCalculationRequest',formData,{
            headers:{
              'Authorization': 'Bearer '+ this.accessToken,
              'Content-Type': 'multipart/form-data'
            }
          })
          if(response.status === 200){
            setTimeout(()=>{
              console.log('Getting results...')
              this.getCalculationResults();
            },1000) 
          }
        } catch (error) {
          console.log(error)
        }   
      }else{
        alert('Error in access token')
        this.buttonLoader = false
      }
    },

    async getCalculationResults(){
      const body = {
        'fileToken':this.fileToken,
        'securityToken':'Vs2cmN10eZq6iMGcXIre',
        'bearerToken':this.accessToken
      }
      try {
        const response = await axios.get('https://oneclicklcaapp.com/app/api/getCalculationResults',{
          params:body,
          responseType: 'arraybuffer'
        });
        if(response.status === 200){
          this.loading = false
        }
        const wb = read(response.data);
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = utils.sheet_to_json(ws)
        this.formulateData(data)

      } catch (error) {
          console.log(error)
          if(error.response.status === 500){
            alert('Calculation response failed !');
            this.loading = false
            this.buttonLoader = false
          }else{
            setTimeout(()=>{
              console.log('Attempting...')
              this.getCalculationResults();
            },5000)
          }
          
      }
    },

    async getAccessToken(){
      const body = {
        "username": process.env.VUE_APP_ONE_CLICK_LCA_USERNAME,
        "password": process.env.VUE_APP_ONE_CLICK_LCA_PASSWORD
      }
      try {
        const response = await axios.post('https://oneclicklcaapp.com/app/api/login', body);
        if(response.status === 200){
          this.accessToken = response.data.access_token
        }else{
          throw Error('Unable to login')
        }
      } catch (error) {
        console.log(error)
      }
    },

    formulateData(data){
      const categories = [];
      const ignoredResults = []
      data.forEach(e=>{
        if(e.RESULT_STATUS === 'SUCCESS'){
          categories.push(e.CLASS.split('#')[0])
        }else if(!ignoredResults.includes(e.CLASS.split('#')[0])){
          ignoredResults.push(e.CLASS.split('#')[0]);
        }
      });
      const uniqueCategories = [...new Set(categories)]
     
      uniqueCategories.forEach(e1=>{
        let totalVolume = 0;
        let totalGwp = 0;
        let obj = {
          "category":e1,
          "total_volume":totalVolume,
          "total_gwp":totalGwp,
          "sub_categories":[]
        }
        data.forEach(e2=>{
          if(e2.CLASS.split('#')[0] === e1){
            if(e2.RESULT_STATUS === 'SUCCESS'){
              totalVolume +=  Number(e2.RESULT_BY_VOLUME)
              totalGwp +=  Number(e2.RESULT_ABSOLUTE)
            }
            
            obj.total_volume = totalVolume
            obj.total_gwp = totalGwp

            obj.sub_categories.push({
              "name":e2.CLASS,
              "gwp":e2.RESULT_ABSOLUTE,
              "volume":e2.RESULT_BY_VOLUME,
              "IFCMATERIAL":e2.IFCMATERIAL,
              "isMultipart":this.selectedMapper.data[`${e2.CLASS}`].isMultiPart,
              "resourceSubType":this.selectedMapper.data[`${e2.CLASS}`].resourceSubType
            })
          }
        });
        this.chartData.push(obj);
      });
    
      this.loader = null;
      this.buttonLoader = false;
      var target = document.getElementById("charts");
      this.$nextTick(()=>{
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth',
        });
        if(ignoredResults.length){
          alert(`Result ignored for: ${ignoredResults.join(',')}`);
        }
      })
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
