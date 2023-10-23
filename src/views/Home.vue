<template>
  <v-container fluid fill-height class="home flex-column justify-center align-center primary--text">
    <h1>Hi {{ user.name }}!!</h1>

    <p>Search for a stream in the navigation bar, or pick from one of your latest 👇🏼</p>

    <v-list v-if="streams" max-height="900px" class="overflow-y-auto">
      <v-list-item-group>
        <v-list-item
          v-for="stream in streams.items"
          :key="stream.id"
          @click="navigateToStream(stream.id)"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-row class="pa-0 ma-0">
                {{ stream.name }}
                <v-spacer></v-spacer>
                <span class="primary rounded white--text pl-1 pr-1 caption">{{ stream.id }}</span>
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
import { ref, onMounted } from 'vue'
import { useSpeckleStore } from '@/store/speckle'
import { ref, onMounted } from 'vue'
import { useSpeckleStore } from '@/store/speckle'

export default {
  name: 'Home',
  setup() {
    const store = useSpeckleStore()

    // Fetch streams when the component is mounted.
    onMounted(async () => {
      store.fetchStreams()
    })

    // Function to navigate to a stream.
    const navigateToStream = (streamId) => {
      // Use Vue Router to navigate to the stream.
      router.push(`/streams/${streamId}`)
    }

    // Return the necessary data and functions for the component.
    return {
      user: store.user,
      streams: store.streams,
      navigateToStream
    }
  }
}
</script>
@/utils/SpeckleUtils.js
