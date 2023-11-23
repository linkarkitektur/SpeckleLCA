import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import Home from '@/views/Home.vue';
import Dashboard from '@/views/Dashboard.vue';
import ProjectSelection from '@/views/ProjectSelection.vue';
import Login from '@/components/SpeckleLogin.vue';

import { useSpeckleStore } from '@/stores/speckle';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: false,
        title: "Landing",
        icon: "",
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        requiresAuth: false,
        title: "Login",
        icon: "",
      },
    },
    {
      path: "/projects",
      name: "Projects",
      component: ProjectSelection,
      meta: {
        requiresAuth: true,
        title: "Project Selection",
        icon: "",
      }
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
      meta: {
        requiresAuth: true,
        title: "Dashboard",
        icon: "",
      }
    },
  ]
})

//TODO: This is causing an infinite authentification loop
const beforeEachGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) => {
  const speckleStore = useSpeckleStore();
  if (to.query.access_code) {
    // If the route contains an access code, exchange it
    let accessCode: string;
    if(Array.isArray(to.query.access_code) && to.query.access_code[0] != null){
      accessCode = to.query.access_code[0].toString();
    } else {
      accessCode = to.query.access_code.toString();
    }

    try {
      await speckleStore.exchangeAccessCodes(accessCode);
      return { name: "Projects" }
    } catch (err) {
      console.warn('exchange failed', err);
      return { name: "Home" }
    }
  }

  // Fetch if the user is authenticated
  await speckleStore.updateUser();
  const isAuth = speckleStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    return { name: 'Login' }
  }
};

router.beforeEach(beforeEachGuard);

export default router;
