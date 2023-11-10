import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import Home from '../views/Home.vue'
import Login from '@/components/Login.vue'

import { useSpeckleStore } from '@/stores/speckle';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
        title: "Dashboard",
        icon: "",
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        requiresAuth: false,
        title: "Login | Dashboard",
        icon: "",
      },
    }
  ]
})

const beforeEachGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
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
    } catch (err) {
      console.warn('exchange failed', err);
    }
    // Whatever happens, go home.
    return next('/');
  }

  // Fetch if the user is authenticated
  await speckleStore.updateUser();
  const isAuth = speckleStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuth) {
    if (from.name !== 'Login') {
      return next({ name: 'Login' });
    }
  } else if(!to.meta.requiresAuth && isAuth) {
    return next('/');
  }

  // Any other page
  next();
};

router.beforeEach(beforeEachGuard);

export default router;
