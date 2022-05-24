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
import { isEmpty } from "lodash";
import { groupBy } from "./helper";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    serverInfo: null,
    streamDetails: null,
    selectedCommit: null,
    allCommits: null,
    allBranches: null,
    branchAndCommits: null,
  },
  getters: {
    isAuthenticated: (state) => state.user != null,
    streamDetails: (state) => state.streamDetails,
    selectedCommit: (state) => state.selectedCommit,
    allCommits: (state) => state.allCommits,
    allBranches: (state) => state.allBranches,
    branchAndCommits: (state) => state.branchAndCommits,
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
    setAllBranches(state, data) {
      state.allBranches = data;
    },
    setBranchAndCommits(state, data) {
      state.branchAndCommits = data;
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
        const arr = res.data.stream?.commits?.items?.map((el, key) => {
          return { id: el.id, text: el?.message ?? "Commit " + key };
        });
        let groupedArr = {};
        let branchArr = [];
        let commitsArr = [];
        if (
          res.data.stream?.commits?.items &&
          !isEmpty(res.data.stream?.commits?.items)
        ) {
          groupedArr = groupBy(res.data.stream?.commits?.items, "branchName");
          branchArr = res.data.stream?.commits?.items?.map(function(el) {
            return el?.branchName;
          });
        }
        console.log(
          "### arr",
          [...new Set(branchArr)],
          [...new Set(commitsArr)],
          groupedArr,
          arr,
          res.data.stream?.commits
        );
        context.commit("setStreamDetails", res.data.stream);
        context.commit("setCommit", res.data.stream.commits.items?.[0]);
        context.commit("setAllCommits", arr);
        context.commit("setAllBranches", [...new Set(branchArr)]);
        context.commit("setBranchAndCommits", groupedArr);
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
