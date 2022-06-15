<template>
  <v-container fill-height>
    <v-container
      v-if="loading"
      class="d-flex flex-column justify-center align-center"
    >
      <v-progress-circular
        :size="70"
        :width="7"
        color="primary"
        indeterminate
        :value="progress"
      ></v-progress-circular>
      <p class="body-2 mt-2 primary--text">Loading...</p>
    </v-container>
    <v-container fluid v-show="!loading">
      <dashboard
        v-if="selectedCommit"
        :object-id="selectedCommit.referencedObject"
        @loaded="loading = !$event"
        @progress="progress = $event"
        :stream="stream"
      >
      </dashboard>
    </v-container>
  </v-container>
</template>

<script>
import Dashboard from "@/components/Dashboard";

export default {
  name: "Stream",
  components: { Dashboard },
  data() {
    return {
      serverUrl: process.env.VUE_APP_SERVER_URL,
      loading: true,
      progress: 0,
    };
  },
  async mounted() {
    if (this.streamId) {
      this.getStream();
    }
  },
  computed: {
    streamId() {
      return this.$route.params.id;
    },
    stream() {
      return this.$store.getters.streamDetails;
    },
    selectedCommit() {
      return this.$store.getters.selectedCommit;
    },
    allCommits() {
      return this.$store.getters.allCommits;
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
  },
  watch: {
    streamId: {
      handler: async function(val) {
        if (val) this.getStream();
      },
    },
  },
};
</script>

<style scoped>
.bg-img {
  background-position: center;
  background-repeat: no-repeat;
}

.max-h {
  max-height: 400px;
  height: 400px;
}
</style>
