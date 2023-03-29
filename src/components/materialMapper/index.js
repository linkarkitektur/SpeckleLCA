import Vue from "vue";
import Vuex from "vuex";

// Modules
import speckle from "./modules/speckle";
import auth from "./modules/auth";

const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

export default new Vuex.Store({
  /**
   * Assign the modules to the store.
   */
  modules: {
    auth,
    speckle,
  },

  /**
   * If strict mode should be enabled.
   */
  strict: debug,

  /**
   * Plugins used in the store.
   */
  plugins: [],
  // plugins: debug ? [createLogger()] : [],
});
