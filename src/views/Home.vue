<template lang="html">
  <v-container
    fluid
    fill-height
    class="home flex-column justify-center align-center primary--text"
  >
    <h1>Hi {{ $store.state.user.name }}!!</h1>
    <p>
      Search for a stream in the navigation bar, or pick from one of your latest
      👇🏼
    </p>
    <v-list v-if="streams" max-height="900px" class="overflow-y-auto">
      <v-list-item-group>
        <v-list-item
          v-for="stream in streams.items"
          :key="stream.id"
          @click="$router.push(`/streams/${stream.id}`)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-row class="pa-0 ma-0">
                {{ stream.name }}
                <v-spacer></v-spacer>
                <span class="primary rounded white--text pl-1 pr-1 caption">{{
                  stream.id
                }}</span>
              </v-row>
            </v-list-item-title>
            <v-list-item-subtitle class="caption primary--text">
              Updated
              <timeago :datetime="stream.updatedAt"></timeago>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-container>
</template>

<script>
import { getStreams } from "@/speckleUtils";

export default {
  name: "Home",
  data() {
    return {
      streams: null,
    };
  },
  async mounted() {
    this.streams = await getStreams();
  },
  methods: {},
};
</script>

<style lang="scss">
#viewer {
  min-height: 500px;
}

.v-data-footer__select {
  display: none !important;
}
</style>
