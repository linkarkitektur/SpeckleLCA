<template>
  <div>
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
          @click="$router.push(`/material/${stream.id}`)"
        >
          <v-card-title class="px-8">Material mapper</v-card-title>
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
export default {
  name: "Dashboard",
  components: {},
  props: ["streamId", "objectId", "info", "stream"],
  data() {
    return {
      loader: null,
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
  computed: {},
  async mounted() {
    this.$emit("loaded", true);
  },
  watch: {},
  methods: {},
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
