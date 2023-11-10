<template>
  <div>
    <header class="app-bar" style="background-color: #1976D2;">
      <button class="text-btn" @click="navigateToProject">SpeckLCA</button>
      <div class="spacer"></div>
      <button class="outlined-button" @click="login">Login/Register</button>
      <div v-if="isAuthenticated" class="menu">
        <div class="avatar-container">
          <img v-if="user?.avatar" :src="user.avatar" alt="User Avatar" class="avatar" />
        </div>
        <!-- <div class="menu-items" id="login-menu">
          <div class="divider"></div>
          <a :href="`${serverUrl}/profile`" target="_blank" class="list-item">
            {{ user?.name }}
            <i class="icon-small">mdi-account</i>
          </a>
          <div class="list-item" @click="logout">
            Log out
            <i class="icon-small error-color">mdi-logout</i>
          </div>
        </div> -->
      </div>
    </header>
    <main>
      <div class="fade">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent, ref, computed } from 'vue';
import { useSpeckleStore } from './stores/speckle';
import router from './router';
import './index.css'

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const serverUrl = ref(import.meta.env.VITE_APP_SERVER_URL);

    const store = useSpeckleStore();
    const isAuthenticated = computed(() => store.isAuthenticated);
    const user = computed(() => store.getUserInfo);
    const project = computed(() => store.getProjectDetails);

    const projectId = computed(() => store.getProjectDetails?.id);

    const navigateToVersionPage = () => {
      if (projectId.value) {
        router.push(`/streams/${projectId.value}`);
      }
    };
    
    const navigateToProject = (event: any) => {
      router.push(`/`);
    };

    const login = () => {
      store.login();
    };

    const logout = () => {
      store.logout;
    };

    return {
      serverUrl,
      isAuthenticated,
      user,
      project,
      navigateToProject,
      navigateToVersionPage,
      login,
      logout,
    };
  },
});
</script>

<template>
    <header>
        <img
            alt="Vue logo"
            class="logo"
            src="@/assets/logo.svg"
            width="125"
            height="125"
        />

        <div class="wrapper">
            <HelloWorld msg="You did it!" />

            <nav>
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />
</template>

<style>
.app-bar {
  background-color: #1976D2;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.text-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
}

.spacer {
  flex: 1;
}

.outlined-button {
  border: 2px solid #1976D2;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #1976D2;
  cursor: pointer;
}

.menu {
  position: relative;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.menu-items {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.divider {
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.list-item {
  padding: 10px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.icon-small {
  font-size: 16px;
  margin-left: 5px;
}

.error-color {
  color: #f00;
}

.fade {
  transition: opacity 0.5s;
}

.outlined-button {
  background-color: transparent;
  border: 2px solid #2196F3; /* Blue border color, customize as needed */
  color: #2196F3; /* Blue text color, matching the border color */
  padding: 10px 20px; /* Adjust padding as needed */
  font-size: 16px; /* Adjust font size as needed */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.outlined-button:hover {
  background-color: #2196F3; /* Blue background color on hover, matching the text and border color */
  color: #fff; /* White text color on hover */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.cursor-pointer {
  cursor: pointer;
}

header {
    line-height: 1.5;
    max-height: 100vh;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

nav {
    width: 100%;
    font-size: 12px;
    text-align: center;
    margin-top: 2rem;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }

    nav {
        text-align: left;
        margin-left: -1rem;
        font-size: 1rem;

        padding: 1rem 0;
        margin-top: 1rem;
    }
}
</style>