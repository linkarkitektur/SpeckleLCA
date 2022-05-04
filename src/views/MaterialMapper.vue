<template>
  <v-row class="px-10 py-10">
    <v-col lg="5" sm="12" xs="12">
      <v-card max-height="800px" min-height="400px" outlined>
        <v-card-title>Material mapper</v-card-title>
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
          <v-row v-for="(value, name, index) in categoryList" :key="index">
            <v-col lg="4" sm="12" xs="12">
              {{ name }}
            </v-col>
            <v-col lg="5" sm="12" xs="12">
              <v-text-field
                label="No Material Assigned"
                solo
                dense
              ></v-text-field>
            </v-col>
            <v-col lg="3" sm="12" xs="12">
              <v-btn outlined text> Assign</v-btn>
            </v-col>
          </v-row>
        </div>
        <v-card-actions class="mt-5">
          <v-row>
            <v-col lg="8"
              ><v-text-field label="Text" solo dense></v-text-field
            ></v-col>
            <v-col lg="4"
              ><v-btn color="primary" outlined text>
                Save & Continue</v-btn
              ></v-col
            >
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col lg="7" sm="12" xs="12">
      <v-card max-height="800px" min-height="400px" outlined class="px-5 py-5">
        <v-row>
          <v-col lg="12"
            ><v-text-field label="Search by keyword" solo dense></v-text-field
          ></v-col>
        </v-row>
        <v-row>
          <v-col lg="6"
            ><v-combobox
              label="Main material dropdown"
              hide-selected
              solo
            ></v-combobox
          ></v-col>
          <v-col lg="6"
            ><v-combobox
              label="Location dropdown"
              hide-selected
              solo
            ></v-combobox
          ></v-col>
        </v-row>
        <v-row>
          <v-col lg="6"
            ><v-text-field label="Optional Filter 1" solo dense></v-text-field
          ></v-col>
          <v-col lg="6"
            ><v-text-field label="Optional Filter 2" solo dense></v-text-field
          ></v-col>
        </v-row>
        <v-row>
          <v-col lg="8"></v-col>
          <v-col lg="4"
            ><v-btn outlined text class="float-right"> Search</v-btn></v-col
          >
        </v-row>

        <v-simple-table class="px-5">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Project
                </th>
                <th class="text-left">
                  Stream
                </th>
                <th class="text-left">
                  Objects
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categories" :key="item.stream">
                <td>{{ item.name }}</td>
                <td>{{ item.stream }}</td>
                <td>{{ item.calories }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <v-row class="mt-5">
          <v-col lg="8"
            >Double click the row to assign the material to the group or click
            the assign button</v-col
          >
          <v-col lg="4"
            ><v-btn outlined text class="float-right">Assign</v-btn></v-col
          >
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import ObjectLoader from "@speckle/objectloader";
import { TOKEN } from "@/speckleUtils";

export default {
  name: "MaterialMapper",
  components: {},
  props: ["info"],
  data() {
    return {
      categoryList: {},
      loader: null,
      stream: null,
      objectId: null,
      totals: {
        levels: 0,
        elements: 0,
        views: 0,
        families: 0,
        types: 0,
      },
      loading: true,
      categories: [
        {
          name: "Main",
          stream: "Stream 1",
          calories: 159,
        },
        {
          name: "Project LCA",
          stream: "Stream 2",
          calories: 237,
        },
        {
          name: "Main",
          stream: "Stream 3",
          calories: 262,
        },
        {
          name: "Main",
          stream: "Stream 4",
          calories: 237,
        },
        {
          name: "Main",
          stream: "Stream 5",
          calories: 262,
        },
      ],
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
  },
  methods: {
    async getStream() {
      this.$store.dispatch("getStreamAction", {
        streamId: this.streamId,
        limit: 1,
        cursor: null,
      });
    },

    async processStreamObjects() {
      this.loader = new ObjectLoader({
        serverUrl: process.env.VUE_APP_SERVER_URL,
        streamId: this.$route.params.id,
        objectId: this.selectedCommit.referencedObject,
        token: localStorage.getItem(TOKEN),
      });
      console.log("### this.loader", this.loader);

      // Initialize placeholders
      const newCategoryMap = {};

      for await (let obj of this.loader.getObjectIterator()) {
        // Get all types in the document
        if (obj.speckle_type.endsWith("FamilyInstance")) {
          newCategoryMap[obj.category] = obj; // Map type to category
        }
      }

      console.log("### catsPerLevel", newCategoryMap);
      this.categoryList = newCategoryMap;
      this.loading = false;
    },
  },
};
</script>

<style>
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
