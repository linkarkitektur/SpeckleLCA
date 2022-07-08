import { SET_USER, SET_SERVER_INFO } from "./mutation-types";

/* eslint-disable no-param-reassign */
export default {
  [SET_USER](state, user) {
    console.log("### state, user", state, user);
    state.user = user;
  },

  [SET_SERVER_INFO](state, info) {
    state.serverInfo = info;
  },
};
