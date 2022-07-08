<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-btn text @click="navigateStream" small>
        <h3 class="text--white">Link LCA</h3>
      </v-btn>

      <v-spacer></v-spacer>

      <stream-search
        v-if="isAuthenticated && $route.path == '/'"
        @selected="$router.push(`/streams/${$event.id}`)"
      />
      <div v-else-if="stream" class="font-weight-bold">{{ stream.name }}</div>

      <v-spacer></v-spacer>

      <v-btn
        class="ma-2"
        small
        outlined
        v-if="!isAuthenticated"
        @click="$store.dispatch('login')"
      >
        <span>Login/Register</span>
      </v-btn>
      <v-menu v-else offset-y open-on-hover>
        <template v-slot:activator="{ on, attrs }">
          <v-avatar v-bind="attrs" v-on="on" size="32" color="grey lighten-3">
            <v-img v-if="user.avatar" :src="user.avatar" />
          </v-avatar>
        </template>
        <v-list dense nav subheader id="login-menu">
          <v-divider class="ma-1"></v-divider>
          <v-list-item link :href="`${serverUrl}/profile`" target="_blank">
            <v-list-item-title>{{ user.name }}</v-list-item-title>
            <v-list-item-icon>
              <v-icon small>mdi-account</v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-list-item link @click="$store.dispatch('logout')">
            <v-list-item-title class="error--text">Log out</v-list-item-title>
            <v-list-item-icon>
              <v-icon small color="error">mdi-logout</v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <transition name="fade">
        <router-view />
      </transition>
    </v-main>
  </v-app>
</template>

<script>
import StreamSearch from "@/components/StreamSearch";

export default {
  name: "App",
  components: { StreamSearch },
  data() {
    return {
      serverUrl: process.env.VUE_APP_SERVER_URL,
    };
  },
  computed: {
    streamId() {
      return this.$route.params.id;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    user() {
      return this.$store.getters.getUserInfo;
    },
    stream() {
      return this.$store.getters.streamDetails;
    },
  },
  methods: {
    navigateStream: function() {
      if (this.streamId) {
        this.$router.push(`/streams/${this.streamId}`);
      }
    },
  },
};
</script>

<style lang="scss">
$heading-font-family: "Space Grotesk";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
