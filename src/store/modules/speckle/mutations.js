/* ============
 * Mutations for the speckle module
 * ============
 *
 * The mutations that are available on the
 * speckle module.
 */

import {
  SET_STREAM_DETAILS,
  SET_COMMIT,
  SET_ALL_COMMITS,
  SET_ALL_BRANCHES,
  SET_BRANCH_AND_COMMITS,
} from "./mutation-types";

/* eslint-disable no-param-reassign */
export default {
  [SET_STREAM_DETAILS](state, data) {
    state.streamDetails = data;
  },
  [SET_COMMIT](state, data) {
    state.selectedCommit = data;
  },
  [SET_ALL_COMMITS](state, data) {
    state.allCommits = data;
  },
  [SET_ALL_BRANCHES](state, data) {
    state.allBranches = data;
  },
  [SET_BRANCH_AND_COMMITS](state, data) {
    state.branchAndCommits = data;
  },
};
