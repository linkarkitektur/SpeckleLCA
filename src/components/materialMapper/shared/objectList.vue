<template>
  <div class="overflow-y-auto px-2">
    <v-container
      v-if="isLoading"
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
            @click="toggle(item.id, item.children.length)"
            :class="{ opened: opened.includes(item.id) }"
            class="pdiv"
          >
              <td
                style="width: 30%; cursor: pointer"
                :style="{
                  'pointer-events':
                  item.children.length > 1 ? 'all' : 'none',
                }"
              >
              {{ item.category }}
              <v-icon
                small
                v-if="
                item.children.length > 1 && !opened.includes(item.id)
                "
              >
                mdi-chevron-right
              </v-icon>
              <v-icon
                small
                v-if="
                item.children.length > 1 && opened.includes(item.id)
                "
              >
                mdi-chevron-down
              </v-icon>
              </td>
              <td style="width: 45%">
                <v-tooltip bottom v-if="currentMapper[item.category]">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      class="mt-6"
                      v-bind="attrs"
                      v-on="
                      currentMapper[item.category]['staticFullName']
                        ? on
                        : null
                      "
                      v-model="
                      currentMapper[item.category]['staticFullName']
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
                      currentMapper[item.category]['staticFullName']"
                  >
                    {{ currentMapper[item.category]["staticFullName"] }}
                  </span>
                </v-tooltip>
              </td>
              <td style="width: 15%; text-align: center">
              <span v-if="item.area" class="mt-5 d-block text-caption">
                  {{ item.area.toFixed(2) }} m2
              </span>
              </td>
              <td style="width: 10%; padding-left: 10px">
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
              <td style="width: 30%">
                  {{ child.type }}
              </td>
              <td style="width: 45%">
                <v-tooltip bottom v-if="currentMapper[item.category + '#' + child.type]">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                    class="mt-6"
                    v-bind="attrs"
                    v-on="
                      currentMapper[item.category + '#' + child.type]['staticFullName']
                      ? on
                      : null
                    "
                    v-model="
                      currentMapper[item.category + '#' + child.type]['staticFullName']"
                    label="No Material Assigned"
                    readonly
                    solo
                    dense
                    ></v-text-field>
                  </template>
                  <span
                    class="tooltip"
                    v-if="
                    currentMapper[item.category + '#' + child.type]['staticFullName']"
                  >
                    {{ currentMapper[item.category + "#" + child.type]["staticFullName"] }}
                  </span>
                </v-tooltip>
              </td>
              <td style="width: 15%; text-align: center">
                <span
                v-if="child.parameter.HOST_AREA_COMPUTED"
                class="mt-5 d-block text-caption"
                >
                  {{ child.area.toFixed(2) }} m2
                </span>
              </td>
              <td style="width: 10%; padding-left: 10px">
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
      <div class="text-center ma-2" v-if="!isLoading">
      <v-dialog v-model="assignMaterialdialog" width="500">
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
            <v-btn color="primary" text @click="addCategory()">
            Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
  
<script>
import { getStreamObject } from "@/utils/speckleUtils";

export default {
  name: "objectList",
  components: {},
  props: ["info"],
  data() {
    return {
      opened: [],
      dialog: false,
      categoryList: {},
      loader: null,
      stream: null,
      objectId: null,
      sourceSoftware: null,
      categories: [],
      uniqueCategories: [],
      resourceList: [],
      areas: [],
      areasObj: {},
      subTypes: [],
      filteredList: [],
      filterData: {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      },
      selected: {},
      singleSelect: true,
      currentCategoryMapper: {},
      defaultCategoryMapper: {},
      selectedcategory: "",
      rules: [(value) => !!value || "Required."],
      assignMaterialdialog: false,
      className: null,
      quantity: null,
      selectedType: "",
      docSnap: null,
      fileToken: null,
      buttonLoader: false,
    };
  },
  computed: {
    streamId() {
      return this.$route.params.id;
    },
    selectedCommit() {
      return this.$store.getters.selectedCommit;
    },
    currentMapper() {
      return this.$store.getters.getCurrentMapper;
    },
    isLoading() {
      return this.$store.getters.isLoading;
    }
  },
  async mounted() {  
    if (this.streamId) {
      this.getStream();
    }
  },
  watch: {
    streamId: {
      handler: async function (val) {
        if (val) this.getStream();
      },
    },
    selectedCommit: {
      handler: async function () {
        this.sourceSoftware = this.selectedCommit.sourceApplication;
        this.objectId = this.selectedCommit.referencedObject;
      },
    },
    objectId: {
      handler: function () {
        this.processStreamObjects();
      },
    },
  },
  methods: {
    toggle(id, length) {
      if (length <= 1) {
        return;
      }
      const index = this.opened.indexOf(id);
      if (index > -1) {
        this.opened.splice(index, 1);
      } else {
        this.opened.push(id);
      }
    },

    openAssignMaterial(category, type) {
      if (!type) {
        type = "";
      } 
      this.$store.dispatch('openAsignMaterials', { category, type });
    },

    async getStream() {
      this.$store.dispatch("getStreamAction", {
        streamId: this.streamId,
        limit: 1,
        cursor: null,
      });
    },

    async processStreamObjects() {
      this.$store.dispatch('startLoading');

      let res = await getStreamObject(
        this.$route.params.id,
        this.$route.params.objectId
      );
      var objectList = [];
      this.categories = [];
      let i = 1;
      // If Grasshopper then we have to drill down one more level to get speckle information
      // This might be structured differently forward
      if (this.sourceSoftware?.includes("Grasshopper")) {
        for (let categoryType in res.data) {
          if (categoryType?.includes("@")) {
            let res2 = await getStreamObject(
              this.$route.params.id,
              res.data[categoryType].referencedId
            );
            for (let category in res2.data) {
              if (category?.includes("@")) {
                const cat = categoryType?.replace("@", "");
                const subCategory = [];
                res2.data["@{0}"].forEach((e1) => {
                  res2.children.objects.find((e2) => {
                    if (
                      e1.referencedId === e2.id &&
                      e2.data.type !== null &&
                      (e2.data.height ||
                        e2.data.parameters.HOST_AREA_COMPUTED.value ||
                        e2.data.parameters.HOST_VOLUME_COMPUTED.value)
                    ) {
                      let item = {
                        id: e2.id,
                        type: e2.data.type,
                        parameter: {
                          height: e2.data.height,
                          HOST_AREA_COMPUTED:
                            e2.data.parameters.HOST_AREA_COMPUTED.value,
                          HOST_VOLUME_COMPUTED:
                            e2.data.parameters.HOST_VOLUME_COMPUTED.value,
                        },
                      };
                     
                      subCategory.push(item);
                    }
                  });
                });
                if (subCategory.length) {
                  this.categories.push({
                    id: i,
                    category: cat,
                    children: subCategory,
                  });
                  i++;
                }

                key = cat;
                staticFullName = "";
                id = "";
                temporary = false;
                if (!this.$store.getters.getCurrentMapper[key]) {
                  this.$store.dispatch('updateCurrentMapper', {key, staticFullName, id, temporary});
                }
                objectList.push(key);
              }
            }
          }
        }
        this.categories.forEach((e1) => {
          const type = [];
          const item = {
            id: e1.id,
            category: e1.category,
            children: [],
            area: 0,
          };
          e1.children.forEach((e2) => {
            if (!type.includes(e2.type)) {
              e2.area = 0;
              type.push(e2.type);
              item.children.push(e2);
            }
            if (e2.parameter?.HOST_AREA_COMPUTED) {
              item.area += e2.parameter?.HOST_AREA_COMPUTED;
            }
          });

          item.children.forEach((t) => {
            let sum = 0;
            let sumVol = 0;
            e1.children.forEach((e2) => {
              if (t.type === e2.type && e2.parameter?.HOST_AREA_COMPUTED) {
                sum += e2.parameter.HOST_AREA_COMPUTED;
              }
              if (t.type === e2.type && e2.parameter?.HOST_VOLUME_COMPUTED) {
                sumVol += e2.parameter.HOST_VOLUME_COMPUTED;
              }
            });
            t.area = sum;
            t.volume = sumVol;
            
            var area = t.area;
            var volume = t.volume;
            var key = item.category + "#" + t.type;
            var temporary = false;
            objectList.push(key);
            if (!this.$store.getters.getCurrentMapper[key]) {
              this.$store.dispatch('updateCurrentMapperArea', {key, temporary, area, volume});
            }

          });

          this.uniqueCategories.push(item);
        });
      } else {
        for (let category in res.data) {
          if (category?.includes("@")) {
            const cat = category?.replace("@", "");
            const subCategory = [];
            res.data[category].forEach((e1) => {
              res.children.objects.find((e2) => {
                if (
                  e1.referencedId === e2.id &&
                  e2.data.type !== null &&
                  (e2.data.height ||
                    e2.data.parameters.HOST_AREA_COMPUTED.value ||
                    e2.data.parameters.HOST_VOLUME_COMPUTED.value)
                ) {
                  let item = {
                    id: e2.id,
                    type: e2.data.type,
                    parameter: {
                      height: e2.data.height,
                      HOST_AREA_COMPUTED:
                        e2.data.parameters.HOST_AREA_COMPUTED.value,
                      HOST_VOLUME_COMPUTED:
                        e2.data.parameters.HOST_VOLUME_COMPUTED.value,
                    },
                  };
                  subCategory.push(item);
                  
                }
              });
            });

            if (subCategory.length) {
              this.categories.push({
                id: i,
                category: cat,
                children: subCategory,
              });
              i++;
            }

            var key = cat;
            var staticFullName = "";
            var id = "";
            var temporary = false;
            if (!this.$store.getters.getCurrentMapper[key]) {
              this.$store.dispatch('updateCurrentMapper', {key, staticFullName, id, temporary});
            }
            objectList.push(key);
          }
        }
        this.categories.forEach((e1) => {
          const type = [];
          const item = {
            id: e1.id,
            category: e1.category,
            children: [],
            area: 0,
            volume: 0,
          };
          e1.children.forEach((e2) => {
            if (!type.includes(e2.type)) {
              type.push(e2.type);
              item.children.push(e2);

              if (e2.parameter?.HOST_AREA_COMPUTED) {
                item.area += e2.parameter?.HOST_AREA_COMPUTED;
              }
            }
          });
          
          item.children.forEach((t) => {
            let sum = 0;
            let sumVol = 0;
            e1.children.forEach((e2) => {
              if (t.type === e2.type && e2.parameter?.HOST_AREA_COMPUTED) {
                sum += e2.parameter.HOST_AREA_COMPUTED;
              }
              if (t.type === e2.type && e2.parameter?.HOST_VOLUME_COMPUTED) {
                sumVol += e2.parameter.HOST_VOLUME_COMPUTED;
              }
            });
            t.area = sum;
            t.volume = sumVol;
            
            var area = t.area;
            var volume = t.volume;
            var key = item.category + "#" + t.type;
            var temporary = false;
            objectList.push(key);
            if (!this.$store.getters.getCurrentMapper[key]) {
              this.$store.dispatch('updateCurrentMapperArea', {key, temporary, area, volume});
            }

          });

          this.uniqueCategories.push(item);
        });
      }
      console.log("Updating Objectlist");
      this.$store.dispatch('setObjectArray', objectList);
      console.log("Updated currentMapper");
      console.log(this.$store.getters.getCurrentMapper);
      this.$store.dispatch('stopLoading');
    },

    addCategory() {
      if (this.className && this.quantity) {
        this.assignMaterialdialog = false;
        let category = {
          id: this.categories.length + 1,
          category: this.className,
          children: [
            {
              id: this.categories.length + 1,
              type: this.className,
              parameter: {
                HOST_AREA_COMPUTED: Number(this.quantity),
                HOST_VOLUME_COMPUTED: Number(this.quantity),
                height: Number(this.quantity),
              },
            },
          ],
          isTemporary: true,
        };

        var key = this.className;
        var staticFullName = "";
        var id = "";
        var temporary = true;
        this.$store.dispatch('updateCurrentMapper', { key, staticFullName, id, temporary});

        this.categories.push(category);
        this.uniqueCategories.push(category);
      }
    },
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
  