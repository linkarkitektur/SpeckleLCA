<template>
  <v-row class="justify-center py-5 px-5">
    <v-col lg="5" sm="12" xs="12">
      <v-card max-height="87vh" min-height="87vh" outlined>
        <v-card-title>Material mapper</v-card-title>

        <div style="height:100px">
          <v-row>
            <v-col lg="6" sm="12" xs="12" class="px-10">
              <v-combobox
                v-model="selectedMapper"
                :items="savedMapperList"
                item-text="text"
                label="Select Saved Mapper"
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

        <div class="overflow-y-auto px-5 py-4 ">
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
          <v-row
            v-for="item in categories"
            :key="item.id"
            class="d-flex flex-1 align-start pl-3"
          >
            <v-col lg="4" sm="12" xs="12">
              {{ item.category }}
            </v-col>
            <v-col lg="6" sm="12" xs="12">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    v-on="
                      currentCategoryMapper[item.category]['staticFullName']
                        ? on
                        : null
                    "
                    v-model="
                      currentCategoryMapper[item.category]['staticFullName']
                    "
                    label="No Material Assigned"
                    readonly
                    solo
                    dense
                  ></v-text-field>
                </template>
                <span
                  class="tooltip"
                  v-if="currentCategoryMapper[item.category]['staticFullName']"
                  >{{
                    currentCategoryMapper[item.category]["staticFullName"]
                  }}</span
                >
              </v-tooltip>
            </v-col>
            <v-col lg="1" sm="12" xs="12">
              <v-btn
                :key="item.id"
                :color="
                  selectedcategory === item.category ? 'green' : 'primary'
                "
                @click="openAssignMaterial(item.category)"
              >
                Assign
              </v-btn>
            </v-col>
          </v-row>
          <div class="text-center" v-if="!loading">
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
        <v-row class="pt-8">
          <v-col cols="6" align="center">
            <v-btn
              depressed
              @click="downloadExcel"
              color="primary"
              :disabled="loading || !selectedMapperEmpty"
            >
              Generate Excel
            </v-btn>
          </v-col>
          <v-col cols="5">
            <v-file-input
              label="Upload Excel"
              outlined
              dense
              :disabled="loading || !selectedMapperEmpty"
            ></v-file-input>
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
        <v-card-title>
          <span class="text-h5">Assign Material</span>
        </v-card-title>
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
          class="px-5 py-5"
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
                label="Resource SubType"
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
                label="Areas"
                :items="areasObj[filterData.subType]"
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
                label="Is Multipart"
                :items="multiPart"
                hide-selected
                solo
                dense
                v-model="filterData.multipart"
              ></v-combobox>
            </v-col>
            <v-col lg="6" class="py-0 mx-0 my-0">
              <v-btn outlined text dense class="float-right" @click="onSearch">
                Search</v-btn
              >
            </v-col>
          </v-row>

          <v-row>
            <v-col lg="12">
              <v-simple-table class="px-5" height="44vh">
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
                  <tbody>
                    <tr
                      v-for="item in filteredList"
                      :key="item._id"
                      @dblclick="onRowClick(item)"
                    >
                      <td>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <div
                              class="text-truncate"
                              style="max-width: 130px;"
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
                      <td>
                        {{
                          item.combinedUnits.length > 0
                            ? item.combinedUnits.join(",")
                            : ""
                        }}
                      </td>
                      <td>{{ item.isMultiPart }}</td>
                      <td>{{ item.area }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
          <v-card-actions>
            <span
              >* double click the row to assign the material to the group</span
            >
            <v-spacer></v-spacer>
          </v-card-actions>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { getStreamObject } from "@/utils/speckleUtils";
import { getDoc, updateDoc } from "@firebase/firestore";
import {
  FILTER_COUNTRIES,
  COMBINED_UNIT_LIST,
  MULTIPART,
  HEADERS,
} from "./../shared/constants";
import { filterDataFromList, getDefaultData, isObjectEmpty } from "./../shared/helper";
import {utils , writeFile} from "xlsx";

import mapperDB from "./../firebase/firebaseinit";

export default {
  name: "MaterialMapper",
  components: {},
  props: ["info"],
  data() {
    return {
      dialog: false,
      dialogMapper: false,
      selectedMapper: null,
      categoryList: {},
      loader: null,
      stream: null,
      objectId: null,
      loading: false,
      categories: [],
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
      selectedMapperEmpty:false
    };
  },
  computed: {
    streamId() {
      return this.$route.params.id;
    },
    selectedCommit() {
      return this.$store.getters.selectedCommit;
    },
  },
  async mounted() {
    this.getResourceList();
    this.getMappers();

    if (this.streamId) {
      this.getStream();
    }
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
        this.selectedMapperEmpty = !isObjectEmpty(val.data);
      },
      deep: true,
    }
  },
  methods: {
    async getMappers() {
      const docSnap = await getDoc(mapperDB, "data");

      if (docSnap.exists()) {
        console.log(docSnap.data());
        const newArr = docSnap.data();
        this.savedMapperList = newArr?.data?.[this.streamId] ?? [];
        this.savedMapperList?.forEach((el) => {
          if (el.isDefault) {
            this.selectedMapper = { ...el };
            this.currentCategoryMapper = { ...el.data };
          }
        });
        if (!this.savedMapperList?.[0]) {
          this.mapperName = "Default";
          this.dialogMapper = true;
        }
      }
    },
    async updateMappers(data) {
      await updateDoc(mapperDB, { data });
    },
    getResourceList() {
      const ACCEESS_TOKEN = `${process.env.VUE_APP_SPECKLE_NAME}.OCAccessToken`;
      const SERVER_URL = process.env.VUE_APP_ONE_CLICK_SERVER_URL;
      let access_token = localStorage.getItem(ACCEESS_TOKEN);
      var bearer = "Bearer " + access_token;
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
          console.log(result);
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
    },

    subTypeChange(val) {
      this.filterData.area = "";
    },

    onRowClick(item) {
      this.selected = item;
      this.currentCategoryMapper[this.selectedcategory] = {
        ...this.currentCategoryMapper[this.selectedcategory],
        ...item,
      };
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
      if(!this.currentCategoryMapper[this.selectedcategory].isTemporary){
        this.saveMapper(this.savedMapperList);
      }
    },

    createNew() {
      this.dialogMapper = true;
    },

    openAssignMaterial(category) {
      this.dialog = true;
      this.selectedcategory = category;
      this.filteredList = [];
      this.filterData = {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      };
    },

    onSearch() {
      this.filteredList = this.resourceList?.filter((el) =>
        filterDataFromList(el, this.filterData)
      );
    },

    onMapperChange(event) {
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
          this.currentCategoryMapper[el.category] = { staticFullName: "" };
        });
      });
    },

    saveMapper(items) {
      if (this.streamId) {
        this.updateMappers({ [this.streamId]: items });
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
          const parameters = []
          res.data[category].forEach(e1=>{
            res.children.objects.forEach((e2)=>{
              if(e1.referencedId === e2.id){
                parameters.push({...e2.data.parameters,...e2.data.height})
              }
            })
          })
          this.categories.push({
            id: i,
            category: cat,
            children: res.data[category].length,
            parameters:parameters
          });
          if (!this.currentCategoryMapper[cat]) {
            this.currentCategoryMapper[cat] = { staticFullName: "" };
            this.defaultCategoryMapper[cat] = { staticFullName: "" };
          }
          i++;
        }
      }

      this.loading = false;
    },

    downloadExcel(){
      const rows = [];
      const data = this.selectedMapper.data;
      
      for(const category  in data){
        const staticFullName = data[category].staticFullName;
        const isMultiPart = data[category].isMultiPart;
        const combinedUnits = data[category].combinedUnits || [];

        if(staticFullName){
          let item = {
            CLASS:category,
            MATERIAL:staticFullName,
            QUANTITY: this.getMaterialQuantity(category,isMultiPart,combinedUnits),
            QTY_TYPE: isMultiPart ? 'M2' : !isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m")) ? 'M3' : 'M',
            THICKNESS_MM:'',
            TALO2000:'',
            COMMENT:''
          }
          rows.push(item)
        }
      }
      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "DATA");
      writeFile(workbook,`${this.selectedMapper.text}.xlsx`);
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

    calculateMaterialQuantity(category,parameter,divideBy=1){
      let sum = 0
      this.categories.forEach(e1=>{
        if(e1.category === category){
          e1.parameters.forEach(e2=>{
            sum = sum + e2[`${parameter}`].value/divideBy
          })
        }
      })
        return sum;
    },

    addCategory(){
      if(this.className && this.quantity){
         this.assignMaterialdialog = false;
         let category = {
          id:this.categories.length+1,
          category:this.className,
          parameters:[{
            HOST_AREA_COMPUTED: {
              value:Number(this.quantity)
            },
            HOST_VOLUME_COMPUTED: {
              value:Number(this.quantity)
            },
            height: {
              value:Number(this.quantity)
            }
          }]
         }
         this.currentCategoryMapper[this.className]={ staticFullName: "", isTemporary:true };
         this.categories.push(category);
      }
    }

  },
};
</script>

<style lang="scss" scoped>
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
