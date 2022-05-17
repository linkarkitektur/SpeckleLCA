<template>
  <div>
    <v-row>
      <v-col cols="6">
        <v-select
          :items="branches"
          label="Branch"
          v-on:change="changeBranch"
        ></v-select>
      </v-col>
      <v-col cols="6"
        ><v-select
          :items="commits"
          label="Commit"
          v-on:change="changeCommits"
        ></v-select
      ></v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card max-height="400px" min-height="400px" outlined>
          <v-card-title>3D View</v-card-title>
        </v-card>
      </v-col>
      <v-col lg="6" sm="12" xs="12">
        <v-card
          max-height="400px"
          min-height="400px"
          outlined
          @click="navigateToMapper"
        >
          <v-card-title class="px-8">Material mapper</v-card-title>
          <v-container
            v-if="loading"
            class="d-flex flex-column justify-center align-center"
          >
            <v-progress-circular
              :size="30"
              :width="5"
              color="primary"
              indeterminate
            ></v-progress-circular>
            <p class="body-2 mt-2 primary--text">Loading...</p>
          </v-container>
          <v-simple-table class="px-5" height="300">
            <template v-slot:default>
              <thead>
                <tr>
                  <th id="1" class="text-left">
                    Category
                  </th>
                  <th id="2" class="text-left">
                    Family
                  </th>
                  <th id="3" class="text-left">
                    Children Count
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in categories" :key="item.id">
                  <td>{{ item.category }}</td>
                  <td>{{ item.family }}</td>
                  <td>{{ item.children }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-card-actions> </v-card-actions>
        </v-card>
      </v-col>
      <v-col lg="6" sm="12" xs="12">
        <v-card max-height="500px" min-height="400px" outlined>
          <v-card-title>Graph</v-card-title>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card max-height="400px" min-height="400px" outlined>
          <v-card-title>Bench Marking</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { isEmpty } from "lodash";
import ObjectLoader from "@speckle/objectloader";
import { TOKEN, getStreamObject } from "@/speckleUtils";

export default {
  name: "Dashboard",
  components: {},
  props: ["streamId", "objectId", "info", "stream"],
  selectedBranch: "",
  selectedCommit: "",
  data() {
    return {
      loader: null,
      loading: false,
      commits: [],
      categories: [],
      commitDetails: {},
    };
  },
  computed: {
    branches() {
      return this.$store.getters.allBranches;
    },
    branchAndCommits() {
      return this.$store.getters.branchAndCommits;
    },
  },
  async mounted() {
    this.$emit("loaded", true);
  },
  watch: {},
  methods: {
    navigateToMapper: function() {
      if (this.stream.id && this.commitDetails?.referencedObject) {
        this.$router.push(
          `/material/${this.stream.id}/${this.commitDetails?.referencedObject}`
        );
      }
    },
    changeBranch: function(event) {
      this.selectedBranch = event;
      console.log(
        "#### this.branchAndCommits[event]",
        this.branchAndCommits[event]
      );
      if (
        this.branchAndCommits[event] &&
        !isEmpty(this.branchAndCommits[event])
      ) {
        this.branchAndCommits[event]?.forEach((el) => {
          if (!el?.message?.toLowerCase().includes("objects")) {
            this.commits.push(el?.message);
            // this.categories.push(el);
          }
        });
        // console.log("###this.categories", this.categories);
      }
    },
    changeCommits: function(event) {
      this.selectedCommit = event;
      console.log(
        "### this.branchAndCommits[event]",
        this.branchAndCommits[this.selectedBranch],
        event
      );
      this.commitDetails = this.branchAndCommits[this.selectedBranch].find(
        (el) => el.message === event
      );
      if (this.commitDetails?.referencedObject) {
        this.processStreamObjects(this.commitDetails?.referencedObject);
      }
    },
    async processStreamObjects(objectId) {
      this.loading = true;
      this.loader = new ObjectLoader({
        serverUrl: process.env.VUE_APP_SERVER_URL,
        streamId: this.$route.params.id,
        objectId: objectId,
        token: localStorage.getItem(TOKEN),
      });
      console.log(
        "###  this.loader",
        this.loader,
        this.loader.getObjectIterator()
      );
      // Initialize placeholders
      const newCategoryMap = {};
      this.categories = [];
      for await (let obj of this.loader.getObjectIterator()) {
        // Get all types in the document
        if (
          obj.speckle_type.endsWith("FamilyInstance") &&
          !newCategoryMap[obj.category]
        ) {
          // console.log("### obj 1244", obj);
          newCategoryMap[obj.category] = obj; // Map type to category
          this.categories.push({
            id: obj.id,
            category: obj.category,
            family: obj.family,
            children: obj.totalChildrenCount,
          });
        }
      }

      console.log("### catsPerLevel", newCategoryMap);
      this.categoryList = newCategoryMap;
      this.loading = false;
    },
  },
};
</script>

<style scoped>
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
</style>
