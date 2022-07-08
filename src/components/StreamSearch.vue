<template>
  <v-autocomplete
      v-model="selectedSearchResult"
      :items="streams.items"
      :search-input.sync="search"
      no-filter
      counter="2"
      rounded
      filled
      dense
      flat
      hide-no-data
      hide-details
      placeholder="Streams Search"
      item-text="name"
      item-value="id"
      return-object
      clearable
      append-icon=""
      @update:search-input="debounceInput"
  >
    <template #item="{ item }" color="background">
      <v-list-item-content>
        <v-list-item-title>
          <v-row class="pa-0 ma-0">
            {{ item.name }}
            <v-spacer></v-spacer>
            <span class="primary rounded white--text pl-1 pr-1 caption">{{ item.id }}</span>
          </v-row>
        </v-list-item-title>
        <v-list-item-subtitle class="caption primary--text">
          Updated
          <timeago :datetime="item.updatedAt"></timeago>
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script>
import {debounce} from "debounce"
import {searchStreams} from "@/utils/speckleUtils";

export default {
  name: "StreamSearch",
  data: () => ({
    search: "",
    streams: {items: []},
    selectedSearchResult: null
  }),
  watch: {
    selectedSearchResult(val) {
      this.search = ""
      this.streams.items = []
      if (val)
        this.$emit("selected", val)
    }
  },
  methods: {
    async fetchSearchResults(e) {
      if (!e || e?.length < 3) return
      var json = await searchStreams(e)
      this.streams = json.data.streams
    },
    debounceInput: debounce(function (e) {
      this.fetchSearchResults(e)
    }, 300)
  }
}

</script>

<style scoped>

</style>