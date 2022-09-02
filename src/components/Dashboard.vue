<template>
  <div>
    <v-row>
      <v-col cols="6">
        <v-select
          :items="branches"
          label="Branch"
          v-on:change="changeBranch"
          v-model="selectedBranch"
        ></v-select>
      </v-col>
      <v-col cols="6"
        ><v-select
          :items="commits"
          label="Commit"
          v-on:change="changeCommits"
          v-model="selectedCommit"
        ></v-select
      ></v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card height="540px" outlined>
          <div v-if="selectedBranch && selectedCommit">
            <iframe :src="getIframeUrl" width="100%" height="540px" frameborder="0"></iframe>
          </div>
          <div v-else>
            <v-alert type="info" color="primary" height="540px" origin="center">
              Please Select Branch & Commit
            </v-alert>
          </div>
        </v-card>
      </v-col>
      <v-col lg="12" sm="12" xs="12">
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
                    Children Count
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in categories" :key="item.id">
                  <td>{{ item.category }}</td>
                  <td>{{ item.children }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <v-card-actions> </v-card-actions>
        </v-card>
      </v-col>
      <!-- <v-col lg="6" sm="12" xs="12">
        <v-card max-height="500px" min-height="400px" outlined>
          <v-card-title>Graph</v-card-title>
        </v-card>
      </v-col> -->
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
import { getStreamObject } from "@/utils/speckleUtils";

export default {
  name: "Dashboard",
  components: {},
  props: ["streamId", "objectId", "info", "stream"],
  data() {
    return {
      loader: null,
      loading: false,
      commits: [],
      categories: [],
      commitDetails: {},
      expanded: [],
      selectedBranch: "",
      selectedCommit: "",
      headers: [
        {
          text: "Categories",
          align: "left",
          filterable: false,
          value: "category",
        },
        { text: "Children Count", value: "children" },
      ],
    };
  },
  computed: {
    branches() {
      return this.$store.getters.allBranches ?? [];
    },
    branchAndCommits() {
      return this.$store.getters.branchAndCommits;
    },
    getIframeUrl(){
      if(this.selectedBranch && this.selectedCommit){
        const streamObject = this.$store.getters.branchAndCommits[`${this.selectedBranch}`].find(e=>e.message === this.selectedCommit);
        return `${process.env.VUE_APP_SERVER_URL}/embed?stream=${this.$route.params.id}&commit=${streamObject.id}`;
      }
      return null
    }
  },
  async mounted() {
    this.$emit("loaded", true);
    if (this.branches?.includes(localStorage.getItem("branch"))) {
      this.selectedBranch = localStorage.getItem("branch");
      this.changeBranch(localStorage.getItem("branch"));
    }
  },
  watch: {
    branchAndCommits: function(val) {
      if (val && localStorage.getItem("branch")) {
        this.changeBranch(localStorage.getItem("branch"));
      }
    },
  },
  methods: {
    navigateToMapper: function() {
      if (this.stream.id && this.commitDetails?.referencedObject) {
        this.$router.push(
          `/material/${this.stream.id}/${this.commitDetails?.referencedObject}`
        );
      }
    },
    changeBranch: function(event) {
      localStorage.setItem("branch", event);
      this.selectedBranch = event;
      this.commits = [];
      if (
        this.branchAndCommits[event] &&
        !isEmpty(this.branchAndCommits[event])
      ) {
        this.branchAndCommits[event]?.forEach((el) => {
          if (!el?.message?.toLowerCase().includes("objects") && el?.message) {
            this.commits.push(el?.message);
          }
        });
        this.commitDetails = this.branchAndCommits[this.selectedBranch][0];
        if (this.commits?.includes(localStorage.getItem("commit"))) {
          this.selectedCommit = localStorage.getItem("commit");
          this.changeCommits(localStorage.getItem("commit"));
        }else{
          const message = this.$store.getters.branchAndCommits[`${this.selectedBranch}`][0].message;
          this.selectedCommit = message;
          this.changeCommits(message);
        }
      }
    },
    changeCommits: function(event) {
      localStorage.setItem("commit", event);
      this.selectedCommit = event;
      this.commitDetails = this.branchAndCommits[this.selectedBranch].find(
        (el) => el.message === event
      );
      if (this.commitDetails?.referencedObject) {
        this.processStreamObjects(this.commitDetails?.referencedObject);
      }
    },
    async processStreamObjects(objectId) {
      this.loading = true;

      let res = await getStreamObject(this.$route.params.id, objectId);
      this.categories = [];
      let i = 1;
      for (let category in res.data) {
        if (category?.includes("@")) {
          this.categories.push({
            id: i,
            category: category?.replace("@", ""),
            children: res.data[category].length,
          });
          i++;
        }
      }

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
