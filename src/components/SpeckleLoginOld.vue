<template>
    <v-container
        fill-height
        class="home flex-column justify-center align-center primary--text"
        v-if="!isAuthenticated"
    >
        <h1>Welcome to SpeckLCA</h1>
        <button class="outlined-button" @click="login">Please Login</button>
    </v-container>

    <v-container
        fill-height
        class="home flex-column justify-center align-center primary--text"
        v-else
    >
        <h1>Welcome to SpeckleLCA {{ store.user?.name }}</h1>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useSpeckleStore } from '@/stores/speckle'

export default defineComponent({
    name: 'LoginComponent',
    setup() {
        const store = useSpeckleStore()

        const isAuthenticated = computed(() => store.isAuthenticated)
        const login = () => {
            store.login()
        }

        return {
            isAuthenticated,
            login,
            store,
        }
    },
})
</script>
