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
                  @click="downloadJSON"
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
                  label="Phases"
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
                        <td>True</td>
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
      sourceSoftware: null,
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
    this.getAccessTokenLCAbyg()
    //this.getAccessToken()
  },
  watch: {
    streamId: {
      handler: async function(val) {
        if (val) this.getStream();
      },
    },
    selectedCommit: {
      handler: async function() {
        this.sourceSoftware = this.selectedCommit.sourceApplication;
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
      // TODO Lokk at
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

      this.resourceList = [
  {
    "staticFullName": "3-lags-rude",
    "_id": "71d53aed-55fe-5b2a-baa5-ffc5aa21a648",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "3-lags-rude",
    "_id": "28fc1f5c-c247-5866-8b87-4441c830735b",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "3-lags-rude",
    "_id": "b2cbcd76-9498-5716-8371-8b3113d8c82f",
    "resourceSubType": "Window",
    "area": "C4"
  },
  {
    "staticFullName": "3-lags-rude",
    "_id": "30d2438b-f121-5452-aec6-616a3f28725a",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Affald bygge deponering",
    "_id": "3a5f4653-5575-529c-a2b7-25876c7639ec",
    "resourceSubType": "Waste",
    "area": "C4"
  },
  {
    "staticFullName": "Affald inert deponering",
    "_id": "417613a4-210e-5363-a5b9-6925cad1e742",
    "resourceSubType": "Waste",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Affald kunststof forbrændingfjernvarme",
    "_id": "ba190e44-64cd-5945-94ab-bdd0f4496547",
    "resourceSubType": "Waste",
    "area": "C3"
  },
  {
    "staticFullName": "Affald kunststof forbrændingfjernvarme",
    "_id": "33884d5e-52d1-5b24-a24b-7919cd9cf813",
    "resourceSubType": "Waste",
    "area": "D"
  },
  {
    "staticFullName": "Affald stenuldhåjdensitet",
    "_id": "eb886e48-672a-5b5e-a35b-fceedff558a5",
    "resourceSubType": "Waste",
    "area": "C4"
  },
  {
    "staticFullName": "Affald stenuldhåjdensitet",
    "_id": "78be9e6b-fdce-57f4-ad9d-03322229d78e",
    "resourceSubType": "Waste",
    "area": "D"
  },
  {
    "staticFullName": "Affald stenuldlavdensitet",
    "_id": "6563a7dc-14c7-50db-8177-44b588bd977f",
    "resourceSubType": "Waste",
    "area": "C4"
  },
  {
    "staticFullName": "Affald stenuldlavdensitet",
    "_id": "835e0978-0405-5246-81a6-e792bab7ffde",
    "resourceSubType": "Waste",
    "area": "D"
  },
  {
    "staticFullName": "Affald stenuldmiddeldensitet",
    "_id": "949d7dd9-00d1-55fb-9375-cddf309c5e12",
    "resourceSubType": "Waste",
    "area": "C4"
  },
  {
    "staticFullName": "Affald stenuldmiddeldensitet",
    "_id": "905c77c6-3fa1-5bb6-a763-f8d8161c308f",
    "resourceSubType": "Waste",
    "area": "D"
  },
  {
    "staticFullName": "Affald træ forbrændingfjernvarme",
    "_id": "b3bee443-7101-5571-8d51-c7e0d6ef24d2",
    "resourceSubType": "Waste",
    "area": "C3"
  },
  {
    "staticFullName": "Affald træ forbrændingfjernvarme",
    "_id": "48f6cd0e-177b-5ff2-bd32-cca515097e26",
    "resourceSubType": "Waste",
    "area": "D"
  },
  {
    "staticFullName": "Afretningslag cementbaseret",
    "_id": "0e97e926-9e13-5d51-a414-171d0c9fd633",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Afretningslag cementbaseret",
    "_id": "b40dcdc3-7a10-5af1-9c33-3a1eecf108d1",
    "resourceSubType": "Concrete",
    "area": "C4"
  },
  {
    "staticFullName": "Afretningslag hårdeplast",
    "_id": "eb612252-b68a-5bb9-a49c-136a4dc59f70",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Afretningslag hårdeplast",
    "_id": "19688c48-2e46-5e8b-810a-aa29296aa636",
    "resourceSubType": "Concrete",
    "area": "C4"
  },
  {
    "staticFullName": "Aircondition",
    "_id": "ff463249-fae1-5763-87f7-cf5d38848c14",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Aircondition",
    "_id": "93f93656-72e1-50ee-8712-c161bf7b950d",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Aircondition",
    "_id": "7e9933a9-3b5b-57b7-b81a-9209832002a0",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Aircondition EOL",
    "_id": "dec72792-96a8-596b-abe4-958871bfbc93",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Aluminium pladeogprofil Genanvendelse",
    "_id": "ce6c4800-640c-5cb0-a1aa-cb78e61784c8",
    "resourceSubType": "Aluminium",
    "area": "C4"
  },
  {
    "staticFullName": "Aluminium pladeogprofil Genanvendelse",
    "_id": "5194ce5e-a01a-50e5-8ff8-06c44e2d5a5e",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "Aluminium ståbegods",
    "_id": "6b711d10-8fb2-533c-af9f-b628ef5923ee",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Aluminiumsfolie",
    "_id": "3de1d7d6-51e7-5a95-8fcc-1c2e93c66634",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Aluminiumsplade",
    "_id": "e852100d-902f-5fe4-8b8d-f2f8915ee1d4",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Aluminiumsprofil",
    "_id": "8df16aaf-d837-5d2a-8f51-a47cc760743f",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Ammoniak",
    "_id": "f16045fb-4927-5469-812d-24f766e542c2",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Anhydritmix",
    "_id": "96bd2b9a-6883-5084-bbf4-30a14b67089a",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Armeringsnet",
    "_id": "9a097a9e-a3d8-5959-b42c-9ae5e38a0707",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Asfalt bærelag",
    "_id": "e680b03f-5d9f-520a-8b78-d658b114e76c",
    "resourceSubType": "Asphalt",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Asfalt bærelag",
    "_id": "6dd90fa6-c7f3-5d30-a124-fff03302a4e9",
    "resourceSubType": "Asphalt",
    "area": "C3"
  },
  {
    "staticFullName": "Asfalt bærelag",
    "_id": "06867056-bcca-537f-adb1-9fc988fd2534",
    "resourceSubType": "Asphalt",
    "area": "D"
  },
  {
    "staticFullName": "Badekar bruserbakke akryl",
    "_id": "9c6b31a4-1e9b-59ee-bff1-f2abb3232505",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Badekar bruserbakke akryl",
    "_id": "651f838b-ddb3-50cd-b57b-57492be823b7",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Badekar bruserbakke akryl",
    "_id": "a3ec0e50-c057-5df5-922d-a7490c3055eb",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Beslagtildreje-kipvinduer",
    "_id": "60b94513-2ae5-50b9-8bd7-e7c049468fff",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Beslagtillodretteskydevinduer",
    "_id": "981e5e2d-9453-5b2c-a9fc-d375f239dde5",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Beslagtilvandretteskydevinduer",
    "_id": "1fa4b786-3a1c-58e6-b191-34302551f403",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Beslag stålvindue",
    "_id": "804dc2b3-69bc-505b-948d-2b65b1f0a770",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC20/25 Fabriksbeton",
    "_id": "35932b61-3c90-544c-a3c2-ea777a3f8255",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC20/25 Fabriksbeton",
    "_id": "73811ed5-804d-5751-a84d-40ae39efa3c8",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC20/25 Fabriksbeton",
    "_id": "4fc00e83-f075-5708-a044-70fd71ad830b",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC20/25 fabriksbetonogbetonelementer",
    "_id": "546de050-b358-5328-b2bf-033167b11c67",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC20/25 fabriksbetonogbetonelementer",
    "_id": "ba8d46ab-8451-5c17-8363-8fd47b456a37",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC20/25 fabriksbetonogbetonelementer",
    "_id": "fc5d9803-b83b-51f6-9646-481bf7ebf3e3",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC25/30 fabriksbetonogbetonelementer",
    "_id": "f47c0b01-cab2-5521-ad41-24ca177d9a22",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC25/30 fabriksbetonogbetonelementer",
    "_id": "dd4def72-d33a-5871-a35f-f4f3f86904e8",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC25/30 fabriksbetonogbetonelementer",
    "_id": "761b62c3-7889-5b48-8371-fd0bd5de7ad9",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC30/37 Fabriksbeton",
    "_id": "9ffbe246-bbad-5cfe-86d8-448ac420fdcb",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC30/37 Fabriksbeton",
    "_id": "29daa4ab-d1cd-5268-a3ed-691ea2b537f2",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC30/37 Fabriksbeton",
    "_id": "f94becda-57b5-5eea-8c76-eb8979a596e1",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC30/37 fabriksbetonogbetonelementer",
    "_id": "9da4067b-9142-5838-a2c0-9985e21a46e4",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC30/37 fabriksbetonogbetonelementer",
    "_id": "7085296f-077c-5f4f-8265-b5cd6c91a5cc",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC30/37 fabriksbetonogbetonelementer",
    "_id": "37e9ee68-7608-5ae7-a1c1-2fc82824686f",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC35/45 fabriksbetonogbetonelementer",
    "_id": "a1e7ccd0-2a14-5599-9b5c-98ad97a64b32",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC35/45 fabriksbetonogbetonelementer",
    "_id": "6cb0d1d1-017c-5c05-9e9e-7e25ca59806c",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC35/45 fabriksbetonogbetonelementer",
    "_id": "166443cd-f849-586c-b562-1fa671bec76d",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC45/55 fabriksbetonogbetonelementer",
    "_id": "b1bbf294-a82a-5c61-b811-2e6b1d384d23",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC45/55 fabriksbetonogbetonelementer",
    "_id": "4d5f514e-2b5c-5915-99b8-783119ed1115",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC45/55 fabriksbetonogbetonelementer",
    "_id": "da930559-26d2-5c0e-83e4-8fb5e5cfbf09",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "BetonC50/60 fabriksbetonogbetonelementer",
    "_id": "45ee3d72-6501-51cd-b10b-2127e2360b5e",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BetonC50/60 fabriksbetonogbetonelementer",
    "_id": "fc589ddd-9120-5d09-b9ee-6499e698bc97",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "BetonC50/60 fabriksbetonogbetonelementer",
    "_id": "3dbc344c-4fa3-549d-b96e-f84078b31c83",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betonelement dæk 20cm",
    "_id": "131e0646-a8af-5da0-86ef-633c1ea947d3",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonelement dæk 20cm",
    "_id": "86575817-8413-5fb1-a4cb-757f16c5d6c3",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betonelement dæk 20cm",
    "_id": "f4c85013-a00d-51c0-8e30-751b5a837ea7",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betonelement etagedæk 40cm",
    "_id": "f9bd26c9-90c3-59e5-b811-d073acc09472",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonelement væg 12cm",
    "_id": "3b54563e-f98a-5858-9cdd-48387161c112",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonelement væg 12cm",
    "_id": "82edfc6a-ada7-51c7-a7ff-e05995b30d83",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betonelement væg 12cm",
    "_id": "2b2ddd15-6bb4-5929-9b58-59f8aad45676",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betonelement væg 40cm",
    "_id": "9739c75a-c16e-5cd8-a76e-4f9ba163900a",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonmursten",
    "_id": "7bbc6957-35bb-5f79-9fc3-134aff51085b",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonmursten",
    "_id": "6e97510a-6d46-5f23-8a00-bf3a40aa96f2",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betonmursten",
    "_id": "968716d2-dc8e-5a64-9a87-185cf86bd0d1",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betonrår armeret",
    "_id": "be4ae27b-cff6-5ad3-89ce-8fa78d94c30d",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonrår armeret",
    "_id": "211b6397-7a29-50e3-a2e0-8e85eebf6714",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betonrår armeret",
    "_id": "4f302490-bca1-546b-a9fe-0ae3f146193b",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betonrår u-armeret",
    "_id": "b84f4d27-dbe7-52b1-b840-31adb607bc58",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betonrår u-armeret",
    "_id": "c82b14cf-6eea-59fc-a077-295f2c37b97c",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betonrår u-armeret",
    "_id": "186373ef-b402-58ee-8646-f5071a81c809",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Betontrappe etagehåj",
    "_id": "77f1f5aa-82c7-5cc0-ba1d-d48e8811e436",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Betontrappe etagehåj",
    "_id": "771ba70b-951d-521a-a4a5-67bc8d1aae25",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Betontrappe etagehåj",
    "_id": "f9d2b151-db01-5f8c-b1f5-12db0474897d",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Bindelag",
    "_id": "9215103a-a1ef-5791-b5fd-8c0aee4b9846",
    "resourceSubType": "Bindelag",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bindelag",
    "_id": "709c75e8-88cb-5330-9e46-4cd7b74d2b29",
    "resourceSubType": "Bindelag",
    "area": "C3"
  },
  {
    "staticFullName": "Bindelag",
    "_id": "d8671a04-cc66-5bf0-a22b-8d5ebd549c83",
    "resourceSubType": "Bindelag",
    "area": "D"
  },
  {
    "staticFullName": "Bitumenemulsion",
    "_id": "8b79def0-b21c-5fe3-aa5b-cf06e514c14c",
    "resourceSubType": "Fabric",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bitumenemulsion",
    "_id": "42059162-3727-5bea-9346-6ec107febdf8",
    "resourceSubType": "Fabric",
    "area": "C3"
  },
  {
    "staticFullName": "Bitumenemulsion",
    "_id": "47da566a-df80-5809-97e8-e1cb36fff560",
    "resourceSubType": "Fabric",
    "area": "C4"
  },
  {
    "staticFullName": "Bitumenklæber",
    "_id": "ce8ff4db-c851-5e14-928a-018fd7945239",
    "resourceSubType": "Bindelag",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bitumenklæber",
    "_id": "d4bfa5b8-c113-566c-a0e8-a8af91e8ec68",
    "resourceSubType": "Bindelag",
    "area": "C3"
  },
  {
    "staticFullName": "Bitumenklæber",
    "_id": "273a150f-6cb8-5818-a1e7-e0ae058673a0",
    "resourceSubType": "Bindelag",
    "area": "C4"
  },
  {
    "staticFullName": "Blyplader",
    "_id": "13183c97-1c55-5c5f-8849-3b9de0ed4244",
    "resourceSubType": "Metal",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Boksventilator 10.000m2/h",
    "_id": "c20378e0-dcd3-5fc0-ad21-86fb356b5766",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Boksventilator 10.000m2/h",
    "_id": "cef517d4-d90a-535c-9dd2-cc729db5e8f6",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Boksventilator 10.000m2/h",
    "_id": "05c9d0e0-3405-5e61-9320-a2f621d2060d",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Boksventilator 10.000m2/h EOL",
    "_id": "7a809251-dc0b-56bc-bcbd-05acbd53c8f0",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Boksventilator 30.000m2/h",
    "_id": "f07b6f4a-9def-5bb9-8b99-1227aa3d363e",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Boksventilator 30.000m2/h",
    "_id": "255bd5b3-ad02-5626-9efb-021e9988741c",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Boksventilator 30.000m2/h",
    "_id": "7e2cd6e7-8c50-5dc1-b25e-8f729386dfef",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Boksventilator 30.000m2/h EOL",
    "_id": "72744d6a-b16a-5e97-a627-647075104eef",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Boksventilator 5.000m2/h",
    "_id": "df423942-cd3a-5fb1-a683-dc202dad45dd",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Boksventilator 5.000m2/h",
    "_id": "52ad08be-ac62-57fe-a10e-753e981f926f",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Boksventilator 5.000m2/h",
    "_id": "8183439d-2156-5dcb-b863-bbe97b6bd7ec",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Boksventilator 5.000m2/h EOL",
    "_id": "d7b7f888-15fb-5d61-b66f-987a90121a50",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Bomuld",
    "_id": "517b6905-3f3d-567e-903d-a0331b5d1395",
    "resourceSubType": "Fabric",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bomuld",
    "_id": "82e8c4eb-d7d5-5bb9-9929-1c164e65e8bb",
    "resourceSubType": "Fabric",
    "area": "C3"
  },
  {
    "staticFullName": "Bomuld",
    "_id": "28894e5a-a94a-590d-b8f1-976c85f8fb42",
    "resourceSubType": "Fabric",
    "area": "D"
  },
  {
    "staticFullName": "Bomuld åkologisk",
    "_id": "5c8c12b3-9f13-51fd-8651-90309162e9d3",
    "resourceSubType": "Fabric",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bomuld åkologisk",
    "_id": "2fdce500-fa0c-56c3-9772-413308f8c16f",
    "resourceSubType": "Fabric",
    "area": "C3"
  },
  {
    "staticFullName": "Bomuld åkologisk",
    "_id": "20935375-7b91-5eda-b553-3b2169470c9d",
    "resourceSubType": "Fabric",
    "area": "D"
  },
  {
    "staticFullName": "Brandsikkertglas",
    "_id": "b678993e-beb8-54b5-bbb3-60404cada6c5",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "BrandsikkertglasPyrobel",
    "_id": "f7067cb5-a1a7-5870-aec3-91396928c540",
    "resourceSubType": "Window",
    "area": "C4"
  },
  {
    "staticFullName": "Brugsvandsrår Alu-PEX",
    "_id": "4449da9a-f1b2-502f-bbe9-69107ed28bbe",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Brugsvandsrår Alu-PEX",
    "_id": "34a17a52-94b9-5fd4-bbdf-e8130f66eae7",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "Brugsvandsrår Alu-PEX",
    "_id": "113a3882-f9b0-595a-a9c8-87974f292566",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Brugsvandsrår PB",
    "_id": "3a47c720-93a0-5561-9d70-28f78cb95aea",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Brugsvandsrår PB",
    "_id": "5516cc99-9f25-5eab-8e42-1f71aee8fbdf",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "Brugsvandsrår PB",
    "_id": "84da4cfd-6af4-5207-840f-11da6209552a",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Brugsvandsrår PEX-Alu-PEX",
    "_id": "b1544eb2-840e-5950-af2c-c4af10e05db3",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Brugsvandsrår PEX-Alu-PEX",
    "_id": "1c5b1dc2-ce3a-5b60-872d-87656696420f",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "Brugsvandsrår PEX-Alu-PEX",
    "_id": "ad539072-3768-5f6f-bc56-164a5671c906",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Brugsvandsrår rustfaststål",
    "_id": "8e7bd60d-f086-50b9-a150-5a563328e686",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Buffertank rustfaststål",
    "_id": "ad104c43-3744-53be-a81f-bccf6ecf1674",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Buffertank rustfaststål",
    "_id": "704b84b1-1f66-50aa-8cad-559308ee114d",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Buffertank rustfaststål",
    "_id": "e995c32e-3f1a-58cf-b732-13a359c9f56b",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Buffertank stål",
    "_id": "2242238c-5f59-57e3-b379-498b015138a8",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Buffertank stål",
    "_id": "97d43434-8d4d-5ae4-ae4b-f9e18c1bd2a4",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Buffertank stål",
    "_id": "8c843bf9-a063-5b92-bc8f-adc03dbe3dc8",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Byggepap",
    "_id": "9ce84f5-8d5c-5644-a85b-dc61abdcfd8c",
    "resourceSubType": "Bindelag",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Byggepap",
    "_id": "ad096a64-73e7-5750-a3b5-d4ea8a3dd5b7",
    "resourceSubType": "Bindelag",
    "area": "C3"
  },
  {
    "staticFullName": "Byggepap",
    "_id": "a1b60df1-d42f-5bb5-90b1-3c63c22ce7a5",
    "resourceSubType": "Bindelag",
    "area": "D"
  },
  {
    "staticFullName": "Bære-/slidlag",
    "_id": "48523eb1-ee95-5c04-a044-f8fc94e983fc",
    "resourceSubType": "Slidlag",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Bære-/slidlag",
    "_id": "d8174941-2631-562c-b97c-b0267c87615d",
    "resourceSubType": "Slidlag",
    "area": "C3"
  },
  {
    "staticFullName": "Bære-/slidlag",
    "_id": "25e45687-0ad8-53f8-b849-6ceae6af7f17",
    "resourceSubType": "Slidlag",
    "area": "D"
  },
  {
    "staticFullName": "Celleglas-isolering115kg/m2",
    "_id": "c2c403f7-70f3-59ac-9973-ff7fef457fc2",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementII325",
    "_id": "bfbd0965-2054-5340-9363-c60fc9eede59",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementII425",
    "_id": "f83abc6c-beaf-5406-8000-eb7b66910cd9",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementII525",
    "_id": "8bcf4f1c-0c3c-5858-b40f-ad02459a3d84",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIIA",
    "_id": "a988af65-ae86-5e1e-b1a9-7f9528df587b",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIIB",
    "_id": "1a7d782e-6766-59a5-893d-cbb5e163db06",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIII425",
    "_id": "196f9896-b991-57c0-989c-1636e40c5172",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIII525",
    "_id": "3f26b87a-b980-5728-9c02-3deb1fd99467",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIV325",
    "_id": "d315cd2a-140f-5333-a304-9a85435f375a",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "CementIV425",
    "_id": "77af5e51-db40-5eb4-8095-b4cfcc4147b9",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Cementbundetspånplade",
    "_id": "da1b460d-f3e8-5ea7-a978-e895254c6e45",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Cementbundetspånplade",
    "_id": "4cc1feed-f2a9-51ce-8a7e-e1698755f75d",
    "resourceSubType": "Concrete",
    "area": "C3"
  },
  {
    "staticFullName": "Cementbundetspånplade",
    "_id": "770d5f2e-a81b-5c41-a9b9-ac8238fc6211",
    "resourceSubType": "Concrete",
    "area": "D"
  },
  {
    "staticFullName": "Cirkulationspumpe250-1000W",
    "_id": "8b543e5f-b7fd-552a-97f1-45d805ac5152",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Cirkulationspumpe250-1000W",
    "_id": "4bde4d28-a788-5ea8-85f0-3255b9185531",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Cirkulationspumpe250-1000W",
    "_id": "8bfcb848-3b49-5521-a2f7-4758c1954161",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Cirkulationspumpe250-1000W EOL",
    "_id": "609441b9-eb0e-568a-8ae1-fcc9eb15656a",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Cirkulationspumpe50-250W",
    "_id": "198c9c2c-2aa1-5112-b891-749d69666d38",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Cirkulationspumpe50-250W",
    "_id": "58916a9e-e8eb-51fe-91ac-7bea5005084e",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Cirkulationspumpe50-250W",
    "_id": "0f6264a1-8ebe-5a78-88a4-f8c9b4129b75",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Cirkulationspumpe50-250W EOL",
    "_id": "742a282e-1145-56d4-8b4a-4c2571a8feca",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Cirkulationspumpe<50W",
    "_id": "ebdb1e5d-67ca-5b0b-9132-8dd773b22731",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Cirkulationspumpe<50W",
    "_id": "f165b7c6-790a-5e46-9d20-e0f5d0141ca9",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Cirkulationspumpe<50W",
    "_id": "4ec7f606-1519-5951-a1e1-09ded6e2df2d",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Cirkulationspumpe<50W EOL",
    "_id": "862e2c6f-1598-51db-b7fa-b0d912db8c48",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder aluminium",
    "_id": "036b0314-1f3c-5616-9157-7f88d923eda9",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder aluminium",
    "_id": "381cfd31-c91c-5cb3-b98a-c9b5f6951fb3",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder aluminium",
    "_id": "407201ac-c324-55d0-8b62-8ba16137a7fe",
    "resourceSubType": "Window",
    "area": "C4"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder aluminium",
    "_id": "9a61ae18-c8b6-57d6-bdd8-971796800de9",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder stål",
    "_id": "96a8fe23-ecb9-58a7-bc28-d428e38ac871",
    "resourceSubType": "Window",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder stål",
    "_id": "76628fce-da8f-56cc-8902-f4ec1b7f319e",
    "resourceSubType": "Window",
    "area": "C3"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder stål",
    "_id": "c1d6c8f2-46d1-5eff-94ce-cf47d64f01c6",
    "resourceSubType": "Window",
    "area": "C4"
  },
  {
    "staticFullName": "Curtainwallfacademed3-lagsruder stål",
    "_id": "d78e9d69-8bbe-5886-8608-27bf684b9346",
    "resourceSubType": "Window",
    "area": "D"
  },
  {
    "staticFullName": "Curtainwallprofiler aluminium",
    "_id": "485f5ae6-20c6-5ceb-b065-8b93154f2e94",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Curtainwallprofiler aluminium",
    "_id": "54f85513-2228-51d8-98d3-9adfed55c3ef",
    "resourceSubType": "Aluminium",
    "area": "C3"
  },
  {
    "staticFullName": "Curtainwallprofiler aluminium",
    "_id": "c88a3fff-8cb7-5938-9d20-4df5f4f09754",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "Curtainwallprofiler stål",
    "_id": "50e7eb47-a893-5d72-8be2-2489861a78ed",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Curtainwallprofiler stål",
    "_id": "5ff6a3dd-b09b-51ec-af73-6c55d253fbfa",
    "resourceSubType": "Aluminium",
    "area": "C3"
  },
  {
    "staticFullName": "Curtainwallprofiler stål",
    "_id": "0be0e919-9215-5484-bee8-b0e8e0e188c6",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "DampspærrePA",
    "_id": "7eecd5f2-ff5a-5fd0-ae89-6ded01e87fe4",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "DampspærrePA",
    "_id": "51f32cfb-e16d-5699-a884-9b23f3cb1c42",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "DampspærrePA",
    "_id": "43467d77-1e7a-58c6-8c3a-4e1d42924dfa",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Dampspærre bitumen",
    "_id": "0949dc07-de7d-5f77-af7d-0ff6dcf3f6b4",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dampspærre bitumen",
    "_id": "390b4fcb-03fc-5bd4-8ec3-43cfa90149cd",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Dampspærre bitumen",
    "_id": "ad8e7699-1036-5919-9bce-62b47ec84a6d",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Datakabel Netværkskabel PVC",
    "_id": "84a3a17e-2840-5f89-b4ac-e34caa036c50",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Datakabel Netværkskabel PVC",
    "_id": "6e31afd4-6e30-5f68-a286-08a7f84ed4d6",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Datakabel Netværkskabel PVC",
    "_id": "5847595a-acf9-5f6f-83e4-97b02b65b2cc",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Dåralu T30/EI30",
    "_id": "b3affa44-1ae1-5694-9433-585b0921209a",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dåralu T30/EI30",
    "_id": "48794e8f-78d7-525c-844d-10436e878065",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dåralu T30/EI30",
    "_id": "1cfbcd4a-c57a-54ba-8034-700b33fafcb7",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dårlu T30/EI30",
    "_id": "8269277a-8086-50b9-ada0-cfa738ecc39a",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "Dåralu T90/EI90",
    "_id": "c85b744a-113d-5a60-a23f-8fdaab9e7846",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dåralu T90/EI90",
    "_id": "9244afd1-208c-539a-b084-3b624bb749c9",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dåralu T90/EI90",
    "_id": "2e2f6b29-56c5-5a99-96e9-01c42cb60711",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dåralu T90/EI90",
    "_id": "fb7709d1-7d72-5cce-9189-2d9cd0c91b53",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "Dåraluhoveddår",
    "_id": "c8bc78d3-624d-5bd8-a28b-ca531665a52a",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dåraluhoveddår",
    "_id": "2b2a6594-efda-5232-844a-07699530cf13",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dåraluhoveddår",
    "_id": "d9d69aeb-99a0-5ef9-ab79-a37066221e3a",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dåraluhoveddår",
    "_id": "ecb09973-3a9c-59d6-833f-ceb11d8417ed",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "Dåralurågdår",
    "_id": "31a49b9d-6071-5132-8eaa-3dbc95048448",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dåralurågdår",
    "_id": "a1ced3ed-cc82-56d9-b309-37d6298028ff",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dåralurågdår",
    "_id": "c83c99ce-c9b9-5639-a0e1-dac581b98e9a",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dåralurågdår",
    "_id": "21ef17f6-5063-50d1-93a7-c0bbbeddebe6",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "Dårindustriport",
    "_id": "a58a3e87-8f59-51f1-ae15-8f9c831d3e66",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dår industriport",
    "_id": "942baac7-d1e8-51bf-9160-524677fdde71",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dår industriport",
    "_id": "067ec01d-949b-5ea3-ad78-c8e9ec318b38",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dår industriport",
    "_id": "54df749f-73da-5d87-a0cd-c54f2554cbc8",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "Dår stål indv/udv/brand/rågmv",
    "_id": "74c59f36-8943-5817-adbc-fa670512a3af",
    "resourceSubType": "Door",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Dår stål indv/udv/brand/rågmv",
    "_id": "fc9a4cbc-2c16-5241-bff8-23f99541cc42",
    "resourceSubType": "Door",
    "area": "C3"
  },
  {
    "staticFullName": "Dår stål indv/udv/brand/rågmv",
    "_id": "c09ba055-ac8d-5663-9ff1-47f4b6957cc2",
    "resourceSubType": "Door",
    "area": "C4"
  },
  {
    "staticFullName": "Dår stål indv/udv/brand/rågmv",
    "_id": "e38da12a-9a79-506e-ad63-24785a7860b3",
    "resourceSubType": "Door",
    "area": "D"
  },
  {
    "staticFullName": "EPDM-tætningtilaluminiumsprofil",
    "_id": "5dbc15c2-ba1e-56c6-b6f9-d76de04d17cf",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EPDM-tætningtilaluminiumsprofil",
    "_id": "f3e39ac9-20a8-5cfe-86f1-36780cafaf94",
    "resourceSubType": "Aluminium",
    "area": "C3"
  },
  {
    "staticFullName": "EPDM-tætningtilaluminiumsprofil",
    "_id": "bcbf85eb-258d-5586-b29e-7055607899fc",
    "resourceSubType": "Aluminium",
    "area": "C4"
  },
  {
    "staticFullName": "EPDM-tætningtilaluminiumsprofil",
    "_id": "8eb20e72-650c-59d5-9685-20f9aa179ae9",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk035",
    "_id": "6c0600bf-40de-56d8-afea-b6d2809ea14b",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk035",
    "_id": "6c6e90c4-5fcd-568a-83a3-808e6983c8c3",
    "resourceSubType": "Aluminium",
    "area": "C4"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk035",
    "_id": "bc91ca27-7413-5e45-b9b9-f4881f5d3a83",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk040",
    "_id": "1b5e19ff-47f0-520b-90e9-6c7ceafa8f9a",
    "resourceSubType": "Aluminium",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk040",
    "_id": "584c641b-9a74-5532-916f-80e3a1309ab6",
    "resourceSubType": "Aluminium",
    "area": "C4"
  },
  {
    "staticFullName": "EPSisoleringtillofter/gulveogkælderydervæg/terrændæk040",
    "_id": "a5fe89b2-09b1-587b-8e59-f217f977bdc6",
    "resourceSubType": "Aluminium",
    "area": "D"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage035",
    "_id": "548fb8f8-44bc-5d6f-8ac2-35da1c5c17b4",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage035",
    "_id": "5fd09186-a02e-5e3d-b334-f2d76a5d1c52",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage035",
    "_id": "037644e8-f1de-515b-92ef-303d2aa90b0c",
    "resourceSubType": "Insulation",
    "area": "D"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage040",
    "_id": "30464d3a-8e50-578c-818c-42aa5ac02c06",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage040",
    "_id": "d0c17f50-282c-58da-8ca4-42d5302d4858",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "EPSisoleringtilvæggeogtage040",
    "_id": "82988ab3-743c-5782-9a6e-aaa48d057c29",
    "resourceSubType": "Insulation",
    "area": "D"
  },
  {
    "staticFullName": "ETICSlimningogmineralskletpuds",
    "_id": "2a1339ca-6808-5c86-82d5-581c5b30bfab",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "ETICSlimningogmineralskletpuds",
    "_id": "d771129b-a294-545f-9d40-891ebc741aaa",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "ETICSlimningogmineralskletpuds",
    "_id": "6a9e6a69-d1e2-5ce1-a21b-f5f843d3ea5a",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "ETICSlimningogsilikonepuds",
    "_id": "8e0c8d53-a754-5edb-bc6b-44730752c935",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "ETICSlimningogsilikonepuds",
    "_id": "b357162a-6f2a-50a0-a076-b49e0a71f8b9",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "ETICSlimningogsilikonepuds",
    "_id": "96417bd1-a1d5-5cd9-ba02-f4a722d3dc39",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "ETICS-limningogbelægningafsilikatdispersionspuds",
    "_id": "f68ec43c-c139-5a05-aa9a-112964767abb",
    "resourceSubType": "Stucko",
    "area": "A1-A3"
  },
  {
    "staticFullName": "ETICS-limningogbelægningafsilikatdispersionspuds",
    "_id": "9687f29c-534c-554a-8706-01a6c508eb3c",
    "resourceSubType": "Stucko",
    "area": "C3"
  },
  {
    "staticFullName": "ETICS-limningogbelægningafsyntetiskharpikspuds",
    "_id": "6d7cb1bf-e257-56df-9d6e-19561de02d5d",
    "resourceSubType": "Stucko",
    "area": "A1-A3"
  },
  {
    "staticFullName": "ETICS-limningogbelægningafsyntetiskharpikspuds",
    "_id": "06324e41-661e-5637-8a59-2db13a4b4fe1",
    "resourceSubType": "Stucko",
    "area": "C3"
  },
  {
    "staticFullName": "ETICS-limningogbelægningafsyntetiskharpikspuds",
    "_id": "2c580b79-8856-597a-9ad9-1d3c063c9cf7",
    "resourceSubType": "Stucko",
    "area": "C4"
  },
  {
    "staticFullName": "EVA-tagmembran",
    "_id": "1a1e31fa-594e-516e-833e-91f459ab0f6a",
    "resourceSubType": "Fabric",
    "area": "A1-A3"
  },
  {
    "staticFullName": "EVA-tagmembran",
    "_id": "81b7220f-2046-59e4-8fcf-c1d0a136d178",
    "resourceSubType": "Fabric",
    "area": "C3"
  },
  {
    "staticFullName": "EVA-tagmembran",
    "_id": "2f0dc6f7-b8c3-533a-a3f1-1c5d6c3579e0",
    "resourceSubType": "Fabric",
    "area": "D"
  },
  {
    "staticFullName": "Ekspanderetglasgranulat",
    "_id": "d50fcd96-a55b-54bd-b405-4406646a66b8",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Ekspanderetskifer",
    "_id": "c3826fb1-dcbb-568a-bd46-01af87905557",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Elektromagnetiskforkobling",
    "_id": "7ecf0439-c792-5c22-8d7e-d9a086496e6a",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Elektromagnetiskforkobling",
    "_id": "c0331080-1276-5871-9122-eeaef30bed0c",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Elektromagnetiskforkobling",
    "_id": "d653e0af-984e-50d1-b877-6a29ced64ec7",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Elektromagnetiskforkobling",
    "_id": "4964b3f0-a101-5b5f-a3fe-3a88023be671",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Elektroniskforkobling",
    "_id": "ad2e709d-decf-5868-beb9-ced1cf5fc0bc",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Elektroniskforkobling",
    "_id": "785c0c7b-0fe1-5804-82bb-a0af86c689f8",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Elektroniskforkobling",
    "_id": "03a93e80-e448-51f5-9fcb-98977efd5a01",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Elektroniskforkobling",
    "_id": "7fbac9b9-7bfd-583d-b323-a970d817d45f",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Facadeklinker",
    "_id": "eed63732-8143-5af0-929c-612d814176aa",
    "resourceSubType": "Klinker",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Facadeklinker",
    "_id": "5a7d34d6-083b-57e3-a748-95e0fda8df1b",
    "resourceSubType": "Klinker",
    "area": "C3"
  },
  {
    "staticFullName": "Facadeklinker",
    "_id": "33b505a5-acc2-5123-b141-7b69aa640c87",
    "resourceSubType": "Klinker",
    "area": "D"
  },
  {
    "staticFullName": "Fastgårelsesmidler/skruerigalvaniseretstål",
    "_id": "8f6c631e-9570-51e6-b373-4f8971abaa37",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Fastgårelsesmidler/skruerirustfritstål",
    "_id": "8c903443-6b50-5aab-ae8f-d9962d780e66",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Fibercementplade",
    "_id": "09655103-ffd4-5960-bc13-76033160f1bb",
    "resourceSubType": "Concrete",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Fibercementplade",
    "_id": "deacee60-760a-56e2-b0e2-2ddf2c257811",
    "resourceSubType": "Concrete",
    "area": "C4"
  },
  {
    "staticFullName": "Fjernvarmeanlæg",
    "_id": "15ee545d-d19e-59ec-b3a3-e6ad427eb321",
    "resourceSubType": "Technical",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Fjernvarmeanlæg",
    "_id": "44264c1a-fd89-5f48-8356-d38e261ed227",
    "resourceSubType": "Technical",
    "area": "C3"
  },
  {
    "staticFullName": "Fjernvarmeanlæg",
    "_id": "b86a4cd2-0919-5704-b213-5498fb7d3fd7",
    "resourceSubType": "Technical",
    "area": "C4"
  },
  {
    "staticFullName": "Fjernvarmeanlæg",
    "_id": "dc76bdc4-d606-5d07-ab95-3385c13eddf1",
    "resourceSubType": "Technical",
    "area": "D"
  },
  {
    "staticFullName": "Gips beta-halvhydrat",
    "_id": "c22bf5a1-fc18-5e40-a1bb-850d28a6e00d",
    "resourceSubType": "Gypsum",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Gips beta-halvhydrat",
    "_id": "1c89a186-7493-5eb0-b0fd-6bee58d90183",
    "resourceSubType": "Gypsum",
    "area": "C4"
  },
  {
    "staticFullName": "Gipsfiberplade10mm",
    "_id": "b3499273-cd9c-5747-88a3-10f19f95dd97",
    "resourceSubType": "Gypsum",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Gipsfiberplade10mm",
    "_id": "ed364b7a-8f38-58e3-a362-2148a647013a",
    "resourceSubType": "Gypsum",
    "area": "C3"
  },
  {
    "staticFullName": "Gipsfiberplade10mm",
    "_id": "bfb0eef1-6ce5-5653-b989-d58e52ef8690",
    "resourceSubType": "Gypsum",
    "area": "C4"
  },
  {
    "staticFullName": "Gipssten",
    "_id": "48caa360-96d4-546a-aa6a-7a2e4687fdb8",
    "resourceSubType": "Gypsum",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Gipssten",
    "_id": "de2e68c7-707b-5340-b174-1c10be5b1b5e",
    "resourceSubType": "Gypsum",
    "area": "C4"
  },
  {
    "staticFullName": "Glas3mm",
    "_id": "a36cabf1-aae5-5757-8dc6-125fa749f28e",
    "resourceSubType": "Glas",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Glas3mm",
    "_id": "3d52bf8b-d707-5bc5-ad7a-1810f301b229",
    "resourceSubType": "Glas",
    "area": "C4"
  },
  {
    "staticFullName": "Glasbyggesten",
    "_id": "db148866-562e-576a-ba8c-4781c3ddeff2",
    "resourceSubType": "Glas",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Glasbyggesten",
    "_id": "0fedfbfc-1b2f-590a-bdaa-e158e47d195e",
    "resourceSubType": "Glas",
    "area": "C4"
  },
  {
    "staticFullName": "Glasfiberdug",
    "_id": "02a03c93-23fb-52e2-8e4b-5e53caebda9e",
    "resourceSubType": "Glas",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Glasfiberdug",
    "_id": "45d04eb8-0d27-528b-b11c-462ccc763518",
    "resourceSubType": "Glas",
    "area": "C3"
  },
  {
    "staticFullName": "Glasfiberdug",
    "_id": "3dcd5b0f-c862-5abf-9a58-b963206b6569",
    "resourceSubType": "Glas",
    "area": "C4"
  },
  {
    "staticFullName": "Grundertilsilikonespuds",
    "_id": "d9994e77-d817-5421-bb43-9ab40496b60e",
    "resourceSubType": "Silicone",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Grundertilsilikonespuds",
    "_id": "34992984-4ade-598f-80d7-ce06e3ad8e8c",
    "resourceSubType": "Silicone",
    "area": "C4"
  },
  {
    "staticFullName": "Grunder silikatdispersion",
    "_id": "15466a42-c79d-5ad9-992a-ed1f8d3d4d12",
    "resourceSubType": "Silicone",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Grunder silikatdispersion",
    "_id": "a90a1a9a-e321-5694-9290-f01c432e6fce",
    "resourceSubType": "Silicone",
    "area": "C4"
  },
  {
    "staticFullName": "Grus2-32mm",
    "_id": "dda735c5-e572-5da7-a210-f37da7721e50",
    "resourceSubType": "Gravel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Grus2-32mm",
    "_id": "2c3714c4-4d0b-539e-9b22-22659acc2c9a",
    "resourceSubType": "Gravel",
    "area": "C3"
  },
  {
    "staticFullName": "Grus2-32mm",
    "_id": "ab956412-9894-525d-a7a0-6f9cef443d21",
    "resourceSubType": "Gravel",
    "area": "D"
  },
  {
    "staticFullName": "Grus2-32mm tårret",
    "_id": "775082f4-1342-522d-a584-a205d84faa14",
    "resourceSubType": "Gravel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Grus2-32mm tårret",
    "_id": "b8e7181a-0f34-502c-884b-99af5d10c810",
    "resourceSubType": "Gravel",
    "area": "C3"
  },
  {
    "staticFullName": "Grus2-32mm tårret",
    "_id": "28d64726-40e7-5b3a-a47d-c5893bcaca4a",
    "resourceSubType": "Gravel",
    "area": "D"
  },
  {
    "staticFullName": "Grus 2-15mm tårret",
    "_id": "49f8bf99-3dbb-5ece-9d90-dd16563067de",
    "resourceSubType": "Gravel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Grus 2-15mm tårret",
    "_id": "297a3598-05d7-5112-ae3d-dfdf5b8ebaf3",
    "resourceSubType": "Gravel",
    "area": "C3"
  },
  {
    "staticFullName": "Grus 2-15mm tårret",
    "_id": "63a3fba3-1706-5c76-91b2-fd8b1f7fa18c",
    "resourceSubType": "Gravel",
    "area": "D"
  },
  {
    "staticFullName": "Gråståbejern",
    "_id": "798699e7-303a-56bd-8066-fcd6a33ca54b",
    "resourceSubType": "Gravel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "GummigulvemedskumbagsideEN1816",
    "_id": "b852c620-8a12-5177-a101-d32737feec53",
    "resourceSubType": "Rubber",
    "area": "A1-A3"
  },
  {
    "staticFullName": "GummigulvemedskumbagsideEN1816",
    "_id": "21e92af1-72e4-5f4f-a348-ecc512a4166c",
    "resourceSubType": "Rubber",
    "area": "C3"
  },
  {
    "staticFullName": "GummigulvemedskumbagsideEN1816",
    "_id": "17c893dc-8d06-5bd4-801d-b848e73d748a",
    "resourceSubType": "Rubber",
    "area": "D"
  },
  {
    "staticFullName": "GummigulveprofileretEN12199",
    "_id": "06d39967-0666-503d-8854-3707875a1596",
    "resourceSubType": "Rubber",
    "area": "A1-A3"
  },
  {
    "staticFullName": "GummigulveprofileretEN12199",
    "_id": "0413326e-989f-5c56-9960-9185062ffacc",
    "resourceSubType": "Rubber",
    "area": "C3"
  },
  {
    "staticFullName": "GummigulveprofileretEN12199",
    "_id": "e83a7849-7511-5e79-bf66-c01397602ff8",
    "resourceSubType": "Rubber",
    "area": "D"
  },
  {
    "staticFullName": "Gummitætning",
    "_id": "b208de59-461d-5d02-8109-b3566226ab7f",
    "resourceSubType": "Rubber",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Gummitætning",
    "_id": "6ceeb2c3-5b35-5731-9781-ec55ced64610",
    "resourceSubType": "Rubber",
    "area": "C3"
  },
  {
    "staticFullName": "Gummitætning",
    "_id": "1946c28b-dd6c-5bb2-99ce-5e7313080455",
    "resourceSubType": "Rubber",
    "area": "D"
  },
  {
    "staticFullName": "HPL-plade",
    "_id": "003843ad-3fb7-5fec-b960-3676a302fd7b",
    "resourceSubType": "Steel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "HPL-plade",
    "_id": "c09df2c1-6e0e-5087-98c7-b0987f2d5aea",
    "resourceSubType": "Steel",
    "area": "C3"
  },
  {
    "staticFullName": "HPL-plade",
    "_id": "ed865c31-aa85-5862-b0c8-29574fc6728e",
    "resourceSubType": "Steel",
    "area": "D"
  },
  {
    "staticFullName": "Kork expanderet",
    "_id": "88aaef32-6572-5700-80ce-df6a307babe1",
    "resourceSubType": "Cork",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Kork expanderet",
    "_id": "5433b8da-98ad-5b66-aa81-6dcd05e3cfdb",
    "resourceSubType": "Cork",
    "area": "C3"
  },
  {
    "staticFullName": "Kork expanderet",
    "_id": "439028db-0e68-5214-b65c-41ffcbf421ce",
    "resourceSubType": "Cork",
    "area": "D"
  },
  {
    "staticFullName": "Korkfliser4mm",
    "_id": "1f4e228e-fe80-59c0-8ab5-36a080f0e34e",
    "resourceSubType": "Cork",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Korkfliser4mm",
    "_id": "988b0214-9be3-5f78-8cd8-389e4455e90a",
    "resourceSubType": "Cork",
    "area": "C3"
  },
  {
    "staticFullName": "Korkfliser4mm",
    "_id": "d2b36a1d-4f7a-5d50-b06f-d8fd8512c097",
    "resourceSubType": "Cork",
    "area": "D"
  },
  {
    "staticFullName": "Korkfliser6mm",
    "_id": "8a649749-5a4a-58fb-87de-bfd343de7581",
    "resourceSubType": "Cork",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Korkfliser6mm",
    "_id": "f2cbac82-6761-5d23-8062-c20f51b65680",
    "resourceSubType": "Cork",
    "area": "C3"
  },
  {
    "staticFullName": "Korkfliser6mm",
    "_id": "6d54eb74-3c84-5f81-b978-6e0c5205b3b4",
    "resourceSubType": "Cork",
    "area": "D"
  },
  {
    "staticFullName": "Korkfliser8mm",
    "_id": "c00ec5a1-3fd8-5a2a-8192-ac08a3eb7b73",
    "resourceSubType": "Cork",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Korkfliser8mm",
    "_id": "64631c20-9075-5934-8899-94316109c2bb",
    "resourceSubType": "Cork",
    "area": "C3"
  },
  {
    "staticFullName": "Korkfliser8mm",
    "_id": "5a85b3cd-1fe0-592b-8875-6e50bf816725",
    "resourceSubType": "Cork",
    "area": "D"
  },
  {
    "staticFullName": "Krydsfinerplade",
    "_id": "5aef45a5-3d12-5cd6-b35b-ffe6250c3069",
    "resourceSubType": "Cork",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Krydsfinerplade",
    "_id": "fad82b0f-3b0e-54eb-a950-49ec40dc6368",
    "resourceSubType": "Cork",
    "area": "C3"
  },
  {
    "staticFullName": "Krydsfinerplade",
    "_id": "18c06d25-622d-5360-8d18-aa3572a4a6d9",
    "resourceSubType": "Cork",
    "area": "D"
  },
  {
    "staticFullName": "Krydslimetplade 3lag",
    "_id": "25739948-515d-55c3-8fd1-3e70d55a7311",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Krydslimetplade 3lag",
    "_id": "06d20f42-b5ad-5bde-8969-314b075f254f",
    "resourceSubType": "CLT",
    "area": "C3"
  },
  {
    "staticFullName": "Krydslimetplade 3lag",
    "_id": "b6c0db27-db5a-59d6-987a-6191e9ee6b2b",
    "resourceSubType": "CLT",
    "area": "D"
  },
  {
    "staticFullName": "Krydslimetplade 3-og5-lag",
    "_id": "e943ceb9-a080-50c7-8654-aa0ae5cf4e5a",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Krydslimetplade 5lag",
    "_id": "eec71c4f-e955-5074-8c26-3012a6981bb3",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Krydslimetplade 5lag",
    "_id": "6cbae7d2-524d-577b-9909-615ce5109ccb",
    "resourceSubType": "",
    "area": "C3"
  },
  {
    "staticFullName": "Krydslimetplade 5lag",
    "_id": "af0ac441-66d8-5de4-bacf-179c2a5f1383",
    "resourceSubType": "",
    "area": "D"
  },
  {
    "staticFullName": "Kuldioxid",
    "_id": "54ffc32a-d967-59c0-9aec-f821fcffece4",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Limtræ nåletræ",
    "_id": "abd65119-71cc-5b22-b90d-49b6310d2df1",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Limtræ nåletræ",
    "_id": "4ac69d4f-d362-56e1-a945-90a1eb2586b7",
    "resourceSubType": "CLT",
    "area": "C3"
  },
  {
    "staticFullName": "Limtræ nåletræ",
    "_id": "e0cc289a-8bb9-56fb-97ee-9194a94db5e2",
    "resourceSubType": "CLT",
    "area": "D"
  },
  {
    "staticFullName": "Limtræ ståendebrædder nåletræ",
    "_id": "f37d7bfc-5c53-5fdd-8aff-f1308069eadf",
    "resourceSubType": "CLT",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Limtræ ståendebrædder nåletræ",
    "_id": "0152f4a5-1b2f-50ad-ba90-a1b1f47d2541",
    "resourceSubType": "CLT",
    "area": "C3"
  },
  {
    "staticFullName": "Limtræ ståendebrædder nåletræ",
    "_id": "99f8c212-b795-53fe-bc4d-2a8e40749317",
    "resourceSubType": "CLT",
    "area": "D"
  },
  {
    "staticFullName": "Mineraluld alm.",
    "_id": "8bd37a93-160d-541d-9e48-85ef492eda6d",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld alm.",
    "_id": "8d9cb2f2-f5a6-501c-a309-3217e8b21fc0",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld alm.",
    "_id": "d6fa7582-7ce8-5100-b067-934fbdde5d91",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "Mineraluld facadesystem",
    "_id": "352ffa4c-e49e-502a-875f-0f52097d829b",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld facadesystem",
    "_id": "1a4f2437-97bd-5135-b2ea-25a50de8729d",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld facadesystem",
    "_id": "5be1abed-e4f4-559a-9bd5-398274d27f02",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "Mineraluld låsfyld",
    "_id": "8d473c2e-163a-5027-8b0e-9fbaf6e9e552",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld låsfyld",
    "_id": "fc7574a2-c68d-5998-9072-ae44e5347b2b",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld låsfyld",
    "_id": "dcef291f-ac64-5537-85b2-6aeffb44dd30",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "Mineraluld skråtag",
    "_id": "9cd91e1a-b67a-5f51-a85c-ed46ad4b9ba6",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld skråtag",
    "_id": "806921d2-d583-54dc-bf78-d3f61feb3db2",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld skråtag",
    "_id": "4e8504d8-e951-521c-9ad6-2a67803cee06",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "Mineraluld stenuld rårskål",
    "_id": "6202b142-5dac-5f98-8891-51f0c5a895dc",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld stenuld rårskål",
    "_id": "8ae5c22e-f636-589a-af59-1998cfbbffd5",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld stenuld tekniskpladeisolering",
    "_id": "5375e93b-cf7b-54c4-9ee4-3957ba2f00af",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld stenuld tekniskpladeisolering",
    "_id": "12ec958a-20a8-55fa-80bd-993e1a14dd4a",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld terræn",
    "_id": "02f9eac3-bb73-5b03-a082-db6e6f0e0200",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld terræn",
    "_id": "faac7a10-d41a-5a5f-af08-764d6c22da4a",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld terræn",
    "_id": "f4c67dfa-5749-5e95-9bb0-dfa977afdd8d",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "Mineraluld trykfasttiltagsystem",
    "_id": "a45b0b77-4a5c-5355-b6a6-283af876f11c",
    "resourceSubType": "Insulation",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Mineraluld trykfasttiltagsystem",
    "_id": "fd9d1ceb-2cc4-5def-a84c-ea1fd4562a7b",
    "resourceSubType": "Insulation",
    "area": "C3"
  },
  {
    "staticFullName": "Mineraluld trykfasttiltagsystem",
    "_id": "f1290ae1-22b7-5208-a10d-1f3df4b8416a",
    "resourceSubType": "Insulation",
    "area": "C4"
  },
  {
    "staticFullName": "PlastprofilSBR",
    "_id": "337bee89-6727-507d-81c1-d12ea29b4831",
    "resourceSubType": "Plastic",
    "area": "A1-A3"
  },
  {
    "staticFullName": "PlastprofilSBR",
    "_id": "ada913df-bf56-5e69-9493-ced4cd34347b",
    "resourceSubType": "Plastic",
    "area": "C3"
  },
  {
    "staticFullName": "PlastprofilSBR",
    "_id": "91489090-e0f6-5531-84e9-9ea09cc775ea",
    "resourceSubType": "Plastic",
    "area": "D"
  },
  {
    "staticFullName": "Polycarbonatplade",
    "_id": "a97808a3-2a42-554b-808a-0460873d5a70",
    "resourceSubType": "Plastic",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Polycarbonatplade",
    "_id": "799bd963-be95-5b8a-b2df-cff220ebcf74",
    "resourceSubType": "Plastic",
    "area": "C3"
  },
  {
    "staticFullName": "Polycarbonatplade",
    "_id": "8bb5d12c-13fc-5fc5-affa-ecc2531e5c04",
    "resourceSubType": "Plastic",
    "area": "D"
  },
  {
    "staticFullName": "Polyethylen-skum",
    "_id": "27aedad2-a53d-56ba-bd0f-d72c34d24a49",
    "resourceSubType": "Plastic",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Polyethylen-skum",
    "_id": "e928362b-a797-5797-9b93-bc162e2c67b6",
    "resourceSubType": "Plastic",
    "area": "C3"
  },
  {
    "staticFullName": "Polyethylen-skum",
    "_id": "f7520768-79e2-55be-9361-04b4c8badb8c",
    "resourceSubType": "Plastic",
    "area": "D"
  },
  {
    "staticFullName": "Sand0-2mm",
    "_id": "af430771-abec-5fad-afb7-fae0b908b161",
    "resourceSubType": "Sand",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Sand0-2mm",
    "_id": "94bc9da9-02e4-5c3b-af06-b3aa2ea17f38",
    "resourceSubType": "Sand",
    "area": "C3"
  },
  {
    "staticFullName": "Sand0-2mm",
    "_id": "aa8273b6-2182-5786-a016-269b5b03d3e0",
    "resourceSubType": "Sand",
    "area": "D"
  },
  {
    "staticFullName": "Sand0-2mm tårret",
    "_id": "155745c3-9c58-5c8d-8f4d-a8e938c7f028",
    "resourceSubType": "Sand",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Sand0-2mm tårret",
    "_id": "f182b221-164d-561e-bb49-4f56b4cd77ae",
    "resourceSubType": "Sand",
    "area": "C3"
  },
  {
    "staticFullName": "Sand0-2mm tårret",
    "_id": "3b987816-4e77-5777-9694-423e8c7ded17",
    "resourceSubType": "Sand",
    "area": "D"
  },
  {
    "staticFullName": "Sand knust tårret",
    "_id": "cda4b669-9faf-5e6c-ba1a-3ba2263ed342",
    "resourceSubType": "Sand",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Sand knust tårret",
    "_id": "c0fc9389-2b67-5acb-8239-9bbd226ac652",
    "resourceSubType": "Sand",
    "area": "C3"
  },
  {
    "staticFullName": "Sand knust tårret",
    "_id": "2ccd1213-5605-538b-a72f-e0714e97313c",
    "resourceSubType": "Sand",
    "area": "D"
  },
  {
    "staticFullName": "Sanitetskeramik",
    "_id": "2ded1752-5f4c-50d7-bb81-bce75fa32069",
    "resourceSubType": "Sand",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Sanitetskeramik",
    "_id": "10fdba57-52ab-5aaf-a5e6-f24fa0654e72",
    "resourceSubType": "Sand",
    "area": "C3"
  },
  {
    "staticFullName": "Solcelleanlæg 1000kWh/m2*a",
    "_id": "f4a51f68-3045-5a99-80b3-7afa43de3c04",
    "resourceSubType": "Solarcell",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Solcelleanlæg 1000kWh/m2*a",
    "_id": "a9c02934-de04-51e9-96cf-c9ac29b27c75",
    "resourceSubType": "Solarcell",
    "area": "C4"
  },
  {
    "staticFullName": "Solcelleanlæg 1000kWh/m2*a",
    "_id": "f3dd64e5-9269-5316-8b04-2faf90632370",
    "resourceSubType": "Solarcell",
    "area": "D"
  },
  {
    "staticFullName": "Solvarmekollektor plan",
    "_id": "c8ebdc01-831b-59f9-b666-c8d7518238d3",
    "resourceSubType": "Solarcell",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Solvarmekollektor plan",
    "_id": "ce1340f8-1343-5cbe-9209-2ae0628c3ee0",
    "resourceSubType": "Solarcell",
    "area": "C3"
  },
  {
    "staticFullName": "Solvarmekollektor plan",
    "_id": "113ceb5e-6280-5f5a-aaab-63e3e072b18b",
    "resourceSubType": "Solarcell",
    "area": "D"
  },
  {
    "staticFullName": "Solvarmekollektor vakuumrår",
    "_id": "8ddd6b01-094e-50e0-8294-6ccc8a392789",
    "resourceSubType": "Solarcell",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Solvarmekollektor vakuumrår",
    "_id": "15197bbd-34e4-5853-b4b0-ac51d2cee8a3",
    "resourceSubType": "Solarcell",
    "area": "C3"
  },
  {
    "staticFullName": "Solvarmekollektor vakuumrår",
    "_id": "3a71022d-7933-535c-926a-f439f86ceb61",
    "resourceSubType": "Solarcell",
    "area": "D"
  },
  {
    "staticFullName": "Stål Smedestål",
    "_id": "257ab361-8054-567e-bb90-050762741f31",
    "resourceSubType": "Steel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Stål Varmgalvaniseretstålplade",
    "_id": "f190d06b-b999-5e68-b0c2-66e55c4799ac",
    "resourceSubType": "Steel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Stål valsedeprofilerogplader",
    "_id": "b7e422e6-1186-56a1-b9be-d17e524fcbc7",
    "resourceSubType": "Steel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Stål valsedeprofilerogplader",
    "_id": "5e5acb2a-a410-5aac-9498-8323e8eeac14",
    "resourceSubType": "Steel",
    "area": "C3"
  },
  {
    "staticFullName": "Stål valsedeprofilerogplader",
    "_id": "b61b32de-b7ad-5d4f-8a01-1663b2d56aa9",
    "resourceSubType": "Steel",
    "area": "D"
  },
  {
    "staticFullName": "Stål varmvalsetplade 2-20mm",
    "_id": "606b9319-b012-54fb-b964-f9f8fc4e20d3",
    "resourceSubType": "Steel",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Stål varmvalsetplade Genanvendelse",
    "_id": "ad19fb2f-d253-5ca1-b164-d6cac0f0e767",
    "resourceSubType": "Steel",
    "area": "C4"
  },
  {
    "staticFullName": "Stål varmvalsetplade Genanvendelse",
    "_id": "44d23632-ebfd-5db3-b72c-c7ddf53cfa4e",
    "resourceSubType": "Steel",
    "area": "D"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "733a07d5-40ed-590f-b303-5ca02cb08db7",
    "resourceSubType": "Asphalt",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "47668d90-5cb3-507c-ac48-8d4451f0dca6",
    "resourceSubType": "Asphalt",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "57100e64-2c28-570b-a5b9-da0a334dce1f",
    "resourceSubType": "Asphalt",
    "area": "C3"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "5d0b40bd-406e-5105-a3aa-0f4b995795ec",
    "resourceSubType": "Asphalt",
    "area": "C3"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "c7f6da60-ce86-56b4-afe5-bdcfe3f889bb",
    "resourceSubType": "Asphalt",
    "area": "C4"
  },
  {
    "staticFullName": "Ståbeasfalt",
    "_id": "6f6a142c-eb8e-5695-8411-65ee05bfe6c9",
    "resourceSubType": "Asphalt",
    "area": "D"
  },
  {
    "staticFullName": "Tagpap bitumentoplag ikke skiferbestrået",
    "_id": "004775b3-963e-5864-afeb-d0da97177da1",
    "resourceSubType": "Tagpap",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Tagpap bitumentoplag ikke skiferbestrået",
    "_id": "7bb42c52-4dd7-546e-bae6-8b9cbce2f41f",
    "resourceSubType": "Tagpap",
    "area": "C3"
  },
  {
    "staticFullName": "Tagpap bitumentoplag ikke skiferbestrået",
    "_id": "fb3dd1bd-a864-5ce7-acf6-40c2c6fd44b9",
    "resourceSubType": "Tagpap",
    "area": "C4"
  },
  {
    "staticFullName": "Tagpap bitumentoplag skiferbestrået",
    "_id": "021d9404-779a-5661-bf70-92760d461647",
    "resourceSubType": "Tagpap",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Tagpap bitumentoplag skiferbestrået",
    "_id": "908f36b6-37c1-57c8-91e6-345d83a52260",
    "resourceSubType": "Tagpap",
    "area": "C3"
  },
  {
    "staticFullName": "Tagpap bitumentoplag skiferbestrået",
    "_id": "fb036ec8-c6a7-5e86-8194-e9be0017ed00",
    "resourceSubType": "Tagpap",
    "area": "C4"
  },
  {
    "staticFullName": "Træ lærk",
    "_id": "ba2ddf89-37b8-584f-a9e8-be32f889527e",
    "resourceSubType": "Wood",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Træ lærk",
    "_id": "10ce115d-151a-5a99-ad7c-2229335ae3f4",
    "resourceSubType": "Wood",
    "area": "C3"
  },
  {
    "staticFullName": "Træ lærk",
    "_id": "b0276199-c576-55ae-8963-16121a80c0df",
    "resourceSubType": "Wood",
    "area": "D"
  },
  {
    "staticFullName": "Træ zeder",
    "_id": "3a719657-0e5e-54b6-bb5e-17d603d15527",
    "resourceSubType": "Wood",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Træ zeder",
    "_id": "17a176db-d7b1-55de-a07f-04e0d9e29532",
    "resourceSubType": "Wood",
    "area": "C3"
  },
  {
    "staticFullName": "Træ zeder",
    "_id": "9f6e1388-7da2-55a5-8c89-3b7efca65f9b",
    "resourceSubType": "Wood",
    "area": "D"
  },
  {
    "staticFullName": "Træbetonplade",
    "_id": "527825d2-1e41-576b-b5ea-a25fd2abebd9",
    "resourceSubType": "Wood",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Træbetonplade",
    "_id": "319e499b-5fda-5592-a2ff-ed4630909674",
    "resourceSubType": "Wood",
    "area": "C3"
  },
  {
    "staticFullName": "Træbetonplade",
    "_id": "c9f66ba9-97f6-5b08-86b8-8baf81ff182c",
    "resourceSubType": "Wood",
    "area": "D"
  },
  {
    "staticFullName": "Træfiberisolering",
    "_id": "f9513679-12fc-588e-8ada-f15a64a246e1",
    "resourceSubType": "Wood",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Træfiberisolering",
    "_id": "02690b39-9c7b-51a2-afbd-ce0c14ab058d",
    "resourceSubType": "Wood",
    "area": "C3"
  },
  {
    "staticFullName": "Træfiberisolering",
    "_id": "6ce06f87-db91-5e74-9a6e-5f6882bf8666",
    "resourceSubType": "Wood",
    "area": "D"
  },
  {
    "staticFullName": "Tæppeflise",
    "_id": "9953036e-0603-589e-b1bc-cdcd0a9726fc",
    "resourceSubType": "Wood",
    "area": "A1-A3"
  },
  {
    "staticFullName": "Tæppeflise",
    "_id": "054c24a5-7906-5eef-8646-a0c0fbc67962",
    "resourceSubType": "Wood",
    "area": "C4"
  },
  {
    "staticFullName": "Tæppeflise",
    "_id": "451b92dd-7c16-5791-aa9c-85fa80f18728",
    "resourceSubType": "Wood",
    "area": "D"
  },
  {
    "staticFullName": "TæppefliseEoL",
    "_id": "8d3fbe8b-ad43-525f-8c1d-26875629cae5",
    "resourceSubType": "Wood",
    "area": "C3"
  }
];
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
      if(this.sourceSoftware?.includes("Grasshopper")){
        for(let categoryType in res.data) {
          if (categoryType?.includes("@")){
            
            let res2 = await getStreamObject(
            this.$route.params.id,
            res.data[categoryType].referencedId
            );
            for (let category in res2.data) {
              if (category?.includes("@")) {
                const cat = categoryType?.replace("@", "");
                const subCategory = []
                res2.data["@{0}"].forEach(e1=>{
                  res2.children.objects.find(e2=>{
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
          }
        }
        this.categories.forEach(e1=>{
          const type = []
          const item = {
            id:e1.id,
            category:e1.category,
            children:[]
            }
            e1.children.forEach(e2=>{
            if(!type.includes(e2.type)){
              type.push(e2.type)
              item.children.push(e2)
            }
            });
          this.uniqueCategories.push(item)
          });
      }
      else{
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
        });
        
        this.uniqueCategories.push(item)
      });
      this.loading = false;
    }
    },

    getConstructionsJSON(){
      var constructionsJSON = new Array();

      for(const cat in this.uniqueCategories){
        let category = this.uniqueCategories[cat].category;
        
        //Create array with children in them

        const elementName = category;

        const data = this.selectedMapper.data;
        const elementUUID = uuidv4();
        const element_properties = {'id': elementUUID,  "name": { "Danish": elementName,"English": elementName,"German": elementName }, "source": "User", "comment": "comment", "enabled": true, "active": true}
        const element_set = {'Element': element_properties}
        const element_node = {'Node': element_set}

        const category_edge_id = uuidv4();
        const category_edge_details = {'id': category_edge_id, 'enabled': true}
        const category_edge_data = [{'CategoryToElement': category_edge_details}, "069983d0-d08b-405b-b816-d28ca9648956", elementUUID]
        const category_edge = {'Edge': category_edge_data}


        constructionsJSON = constructionsJSON.concat(element_node);
        constructionsJSON = constructionsJSON.concat(category_edge);

        var nodes = new Array();

        for(const child in this.uniqueCategories[cat].children){
          let type = this.uniqueCategories[cat].children[child].type;
          let concatName = category + "#" + type;
          let area = this.uniqueCategories[cat].children[child].area;
          let lcabygId = this.currentCategoryMapper[concatName]._id;
          let staticFullName = this.currentCategoryMapper[concatName].staticFullName;
        
          const element_edge_details = {'id': uuidv4(),'amount': area, 'enabled': true}
          const element_edge_data = [{'ElementToConstruction': element_edge_details}, elementUUID, lcabygId]
          const element_edge = {'Edge': element_edge_data}

          nodes = nodes.concat(element_edge)
          
          /*
          const construction_properties = {'id': lcabygId,  'name': {'Danish': staticFullName, 'English': staticFullName},'unit': "M2", 'source': 'User',"comment": "comment",'layer': 1,'locked': true};
        
          const construction_set = {'Construction': construction_properties};

          const construction_node = {'Node': construction_set};
          const beton_uuid = "11c8727c-e603-52e6-882d-ce650729a8a0"

          ////////CONSTRUCTION EDGES

          const construction_edge_id = uuidv4();
          const construction_edge_details = {'id': construction_edge_id,'amount': area / 100, 'unit': "M2", 'lifespan': 50,     'demolition': false,     'enabled': true,     'delayed_start': 0}
          const construction_edge_data = [{'ConstructionToProduct': construction_edge_details}, unique_const_UUID, beton_uuid]
          const construction_edge = {'Edge': construction_edge_data}
          
          nodes = nodes.concat(construction_node)
          nodes = nodes.concat(construction_edge)
          */
        }

        constructionsJSON = constructionsJSON.concat(nodes);
        //const isMultiPart = data[category].isMultiPart;
        //const combinedUnits = data[category].combinedUnits || [];
        
        //if(staticFullName && category.includes('#')){
        

        //    CLASS:category,
        //    MATERIAL:staticFullName,
        //    QUANTITY: this.getMaterialQuantity(category,isMultiPart,combinedUnits),
        //    QTY_TYPE: isMultiPart ? 'M2' : !isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m")) ? 'M3' : 'M',
        //    THICKNESS_MM:'',
        //    TALO2000:'',
        //    COMMENT:''
        //  }
        







        //nodes.push(element_edge)
        //nodes.push(construction_node)
        //nodes.push(construction_edge)
        //}
      }

      //CATEGORY EDGES

      //const constructionsJSON = [];
      //constructionsJSON.push(element_node);
      //constructionsJSON.push(nodes);
      //constructionsJSON.push(category_edge);


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

      return mergedJSON

    },

    downloadJSON(){

      const mergedJSON = this.generateJSON()
      
      console.log(this.subcategories);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(mergedJSON, null, 2)], {
        type: "text/plain"
      }));
      a.setAttribute("download", "specklelca.json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    onStartCalculation() {
      //TODO
      this.loader = 'buttonLoader';
      this.buttonLoader = true
      this.project_data = {}
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

    async startCalculation() {
      const params = {
        username: "pub_test",
        password: "b2251884-a806-455c-bd31-f3cbee726686"
      }


      const data = {
        "priority": 0,
        "job_target": "lcabyg5+br23",
        "job_target_min_ver": "",
        "job_target_max_ver": "",
        "job_arguments": "",
        "input_blob": btoa(this.generateJSON())
      }
  

      // this.chartData = [];
      // if(this.accessToken){
        try {
          const response = await axios.post('https://api1.lcabyg.dk/v2/jobs', data, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Authorization': 'Bearer '+ this.accessTokenLCAbyg,
            }
          })
          if (response.status === 200) {
            console.log("RESULT HAS BEEN SENT");
            const id = response.data.id;
            console.log(id);
            setTimeout(()=>{
              console.log('Getting results...')
              this.getCalculationResults(id);
            },1000) 
          }
        } catch (error) {
          console.log(error)
        }   
      // }else{
      //   alert('Error in access token')
      //   this.buttonLoader = false
      // }
    },

    async getCalculationResults(job_id) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));

     
     console.log("Job ID" , job_id) 

      const data = {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Authorization': 'Bearer ' + this.accessTokenLCAbyg,
        }
      }

      const get_status = async () => { 
        try {
          const response = await axios.get('https:/api1.lcabyg.dk/v2/jobs/' + job_id, data);
          if (response.status === 200) {
            return response.data.status
          }
        }
        catch (error) { console.log(error); return "" }      
      }

      const get_job = async () => {
        try {
          const response = await axios.get('https:/api1.lcabyg.dk/v2/jobs/' + job_id, data);
          if (response.status === 200) {
            return response.data
          }
        }
        catch (error) { console.log(error); return "" }
      }

      var status = await get_status()

      console.log("Status", status)

      while (status == "New" | status == "Started")
      { 
        // This is a delay timer
        await sleep(1000)
        status = await get_status()
        console.log("Sleeping")
        console.log("After wait", status)
      }

      switch (status)
      {
        case "Finished":
          try {
            const response = await axios.get('https:/api1.lcabyg.dk/v2/jobs/' + job_id + '/output', data);
            if (response.status === 200) {
              console.log("RESULTS DATA")
              console.log(response)
              this.loading = false
            }
            // const wb = read(response.data);
            // const wsname = wb.SheetNames[0]
            // const ws = wb.Sheets[wsname]
            // const data = utils.sheet_to_json(ws)
            // this.formulateData(data)

          } catch (error) {
            console.log(error)
            // if (error.response.status === 500) {
            //   alert('Calculation response failed !');
            //   this.loading = false
            //   this.buttonLoader = false
            // } else {
            //   setTimeout(() => {
            //     console.log('Attempting...')
            //     this.getCalculationResults();
            //   }, 5000)
            // }
          }
          break;
        case "Failed":
          this.loading = false
          console.log("REQUEST failed", await get_job() )
          break;
      }

    },

    async getAccessTokenLCAbyg() {
      const params = {
        "username": "pub_test",
        "password": "b2251884-a806-455c-bd31-f3cbee726686"
      }
      try {
        const response = await axios.post('https://api1.lcabyg.dk/v2/login', params);
        if (response.status === 200) {
          this.accessTokenLCAbyg = response.data
        } else {
          throw Error('Unable to login to LCA byg')
        }
      } catch (error) {
        console.log(error)
      }
    },

    async getAccessToken(){
      const body = {
        "username": "linklcaofficial@gmail.com",
        "password": "Link@123"
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
