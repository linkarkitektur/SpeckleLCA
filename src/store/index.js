import Vue from "vue";
import Vuex from "vuex";

import {
  exchangeAccessCode,
  getUserData,
  goToSpeckleAuthPage,
  speckleLogOut,
  getStreamCommits,
} from "@/speckleUtils";
import router from "@/router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    serverInfo: null,
    streamDetails: null,
    selectedCommit: null,
    allCommits: null,
  },
  getters: {
    isAuthenticated: (state) => state.user != null,
    streamDetails: (state) => state.streamDetails,
    selectedCommit: (state) => state.selectedCommit,
    allCommits: (state) => state.allCommits,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setServerInfo(state, info) {
      state.serverInfo = info;
    },
    setStreamDetails(state, data) {
      state.streamDetails = data;
    },
    setCommit(state, data) {
      state.selectedCommit = data;
    },
    setAllCommits(state, data) {
      state.allCommits = data;
    },
  },
  actions: {
    logout(context) {
      // Wipe the state
      context.commit("setUser", null);
      context.commit("setServerInfo", null);
      // Wipe the tokens
      speckleLogOut();
      router.push("/login");
    },
    exchangeAccessCode(context, accessCode) {
      // Here, we could save the tokens to the store if necessary.
      return exchangeAccessCode(accessCode);
    },
    async getUser(context) {
      try {
        var json = await getUserData();
        var data = json.data;
        context.commit("setUser", data.user);
        context.commit("setServerInfo", data.serverInfo);
      } catch (err) {
        console.error(err);
      }
    },
    async getStreamAction(context, data) {
      try {
        const res = await getStreamCommits(
          data.streamId,
          data.limit,
          data.cursor
        );
        context.commit("setStreamDetails", res.data.stream);
        context.commit("setCommit", res.data.stream.commits.items?.[0]);
      } catch (err) {
        console.error(err);
      }
    },
    redirectToAuth() {
      goToSpeckleAuthPage();
    },
  },
  modules: {},
});
