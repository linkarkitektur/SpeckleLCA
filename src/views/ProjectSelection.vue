<template>
  <div class="home-container">
    <h1>Hi {{ user.name }}!!</h1>
    <p>
      Search for a stream in the navigation bar, or pick from one of your latest 👇🏼
    </p>

    <div>
      <ul>
        <li v-for="proj in projects">{{ proj.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useSpeckleStore } from '@/stores/speckle'

export default {
  name: 'ProjectSelection',
  setup() {
    const speckleStore = useSpeckleStore();
    // Fetch streams when the component is mounted.
    onMounted(async () => {
      await speckleStore.updateProjects();
    });
    const projects = computed(() => speckleStore.allProjects);
    const user = computed(() => speckleStore.user);

    // Function to navigate to a stream.
    const navigateToStream = (streamId) => {
      // Use Vue Router to navigate to the stream.
      router.push(`/streams/${streamId}`);
    };
    // Return the necessary data and functions for the component.
    return {
      user,
      projects,
      navigateToStream
    };
  },
  components: {
  }
}
</script>