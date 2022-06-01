<template>
  <v-row class="justify-center py-5">
    <v-col lg="8" sm="12" xs="12">
      <v-card max-height="90vh" min-height="400px" outlined>
        <v-card-title>Material mapper</v-card-title>
        <v-row>
          <v-col lg="6" sm="12" xs="12" class="px-10">
            <v-select
              v-model="selectedMapper"
              :items="savedMapperList"
              item-text="text"
              label="Select Saved Mapper"
              return-object
              single-line
              onchange="onMapperChange"
            ></v-select>
          </v-col>
          <v-col lg="6" sm="12" xs="12" class="px-8 ">
            <v-dialog v-model="dialogMapper" persistent max-width="600px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  class="float-right mt-2"
                  outlined
                  text
                  v-bind="attrs"
                  v-on="on"
                >
                  Save Current Mapping</v-btn
                >
              </template>
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

        <div class="overflow-y-auto px-5 py-4">
          <v-container
            v-if="loading"
            class="d-flex flex-column justify-center align-center"
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
            class="d-flex justify-center"
          >
            <v-col lg="1" sm="12" xs="12"> </v-col>
            <v-col lg="2" sm="12" xs="12">
              {{ item.category }}
            </v-col>
            <v-col lg="5" sm="12" xs="12">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    v-on="on"
                    v-model="
                      currentCategoryMapper[item.category]['staticFullName']
                    "
                    label="No Material Assigned"
                    readonly
                    solo
                    dense
                  ></v-text-field>
                </template>
                <span class="tooltip">{{
                  currentCategoryMapper[item.category]["staticFullName"]
                }}</span>
              </v-tooltip>
            </v-col>
            <v-col lg="3" sm="12" xs="12">
              <v-btn color="primary" @click="openAssignMaterial(item.category)">
                Assign
              </v-btn>
              <v-dialog
                v-model="dialog"
                overlay-opacity="4"
                :retain-focus="false"
                overlay-color="black"
                hide-overlay
                light
                width="80vw"
              >
                <v-card>
                  <v-card-title>
                    <span class="text-h5">Assign Material</span>
                  </v-card-title>
                  <v-card
                    max-height="800px"
                    min-height="400px"
                    outlined
                    class="px-10 py-5"
                  >
                    <v-row>
                      <v-col lg="12"
                        ><v-text-field
                          label="Search by keyword"
                          solo
                          dense
                          v-model="filterData.keyword"
                        ></v-text-field
                      ></v-col>
                    </v-row>
                    <v-row>
                      <v-col lg="6"
                        ><v-combobox
                          label="Resource SubType"
                          :items="subTypes"
                          hide-selected
                          solo
                          dense
                          v-model="filterData.subType"
                          clearable
                        ></v-combobox
                      ></v-col>
                      <v-col lg="6"
                        ><v-combobox
                          label="Areas"
                          :items="areasObj[filterData.subType]"
                          hide-selected
                          solo
                          dense
                          v-model="filterData.area"
                        ></v-combobox
                      ></v-col>
                    </v-row>
                    <v-row>
                      <v-col lg="6"
                        ><v-combobox
                          label="Is Multipart"
                          :items="multiPart"
                          hide-selected
                          solo
                          dense
                          v-model="filterData.multipart"
                        ></v-combobox
                      ></v-col>
                      <v-col lg="6"
                        ><v-btn
                          outlined
                          text
                          dense
                          class="float-right"
                          @click="onSearch"
                        >
                          Search</v-btn
                        ></v-col
                      >
                    </v-row>

                    <v-row>
                      <v-col lg="12">
                        <v-data-table
                          height="38vh"
                          v-model="selected"
                          show-select
                          :single-select="singleSelect"
                          :headers="headers"
                          :items="filteredList"
                          item-key="_id"
                        >
                          <template #item.searchString="{ item }">
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <div
                                  class="text-truncate"
                                  style="max-width: 130px;"
                                  v-bind="attrs"
                                  v-on="on"
                                >
                                  {{ item.searchString }}
                                </div>
                              </template>
                              <span class="tooltip">{{
                                item.searchString
                              }}</span>
                            </v-tooltip>
                          </template>
                        </v-data-table>
                      </v-col>
                    </v-row>
                  </v-card>
                  <v-card-actions>
                    <span
                      >Double click the row to assign the material to the group
                      or click the assign button</span
                    >
                    <v-spacer></v-spacer>
                    <v-btn @click="dialog = false">
                      Cancel
                    </v-btn>

                    <v-btn color="primary" @click="materialAssign">
                      Assign
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { getStreamObject } from "@/speckleUtils";
import json from "../../resource_dump.json";

export default {
  name: "MaterialMapper",
  components: {},
  props: ["info"],
  data() {
    return {
      dialog: false,
      dialogMapper: false,
      selectedMapper: {},
      categoryList: {},
      loader: null,
      stream: null,
      objectId: null,
      loading: false,
      categories: [],
      savedMapperList: [],
      mapperName: "",
      resourceList: json,
      areas: [],
      areasObj: {},
      subTypes: [],
      multiPart: ["True", "False", "Both"],
      filteredList: [],
      filterData: {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      },
      selected: [],
      singleSelect: true,
      headers: [
        {
          text: "ID",
          align: "left",
          filterable: false,
          value: "_id",
        },
        { text: "Search String", value: "searchString" },
        { text: "Resource SubType", value: "resourceSubType" },
        { text: "Is Multipart", value: "isMultiPart" },
        { text: "Area", value: "area" },
        { text: "Epd Program", value: "epdProgram" },
      ],
      categoryMapper: {},
      currentCategoryMapper: {},
      selectedcategory: "",
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
    if (this.streamId) {
      this.getStream();
    }
    if (this.resourceList && this.resourceList?.resources) {
      this.resourceList?.resources?.forEach((el) => {
        if (!this.subTypes.includes(el.resourceSubType) && el.resourceSubType) {
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
      });
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
    selectedMapper: {
      handler: function(val) {
        this.onMapperChange(val);
      },
    },
  },
  methods: {
    openAssignMaterial(category) {
      this.dialog = true;
      this.categoryMapper[category] = { staticFullName: "" };
      this.selectedcategory = category;
    },
    materialAssign() {
      this.categoryMapper[this.selectedcategory] = { ...this.selected?.[0] };
      this.currentCategoryMapper[this.selectedcategory] = {
        ...this.selected?.[0],
      };
      this.dialog = false;
    },
    onSearch() {
      const multipart =
        this.filterData?.multipart === "True"
          ? true
          : this.filterData?.multipart === "False"
          ? false
          : "Both";

      this.filteredList = this.resourceList?.resources?.filter(
        (el) =>
          el.area === this.filterData?.area &&
          (el?.searchString?.includes(this.filterData?.keyword) ||
            el?.resourceSubType?.includes(this.filterData?.keyword) ||
            el?._id?.includes(this.filterData?.keyword)) &&
          el.resourceSubType === this.filterData?.subType &&
          ((multipart === "Both" &&
            (el.isMultiPart === true || el.isMultiPart === false)) ||
            (multipart !== "Both" && el.isMultiPart === multipart))
      );
    },
    onMapperChange(event) {
      this.mapperName = event.text;
      console.log("### event", event, this.categoryMapper);
      const i = this.savedMapperList.findIndex(
        (_element) => _element.text === this.mapperName
      );
      if (i > -1) {
        this.currentCategoryMapper = this.savedMapperList[i]?.data;
      } else {
        this.currentCategoryMapper = { ...this.categoryMapper };
      }
      console.log("### this.savedMapperList", this.savedMapperList);
    },
    onSave() {
      const i = this.savedMapperList.findIndex(
        (_element) => _element.text === this.mapperName
      );
      if (i > -1) this.savedMapperList[i] = { ...this.categoryMapper };
      else
        this.savedMapperList.push({
          text: this.mapperName,
          data: { ...this.categoryMapper },
        });
      console.log("### this.savedMapperList", this.savedMapperList);
      this.dialogMapper = false;
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
      for (let category in res) {
        if (category?.includes("@")) {
          const cat = category?.replace("@", "");
          this.categories.push({
            id: i,
            category: cat,
            children: res[category].length,
          });
          this.categoryMapper[cat] = { staticFullName: "" };
          this.currentCategoryMapper[cat] = { staticFullName: "" };
          i++;
        }
      }

      this.loading = false;
    },
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
