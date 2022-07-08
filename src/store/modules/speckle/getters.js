/* ============
 * Getters for the speckle module
 * ============
 *
 * The getters that are available on the
 * speckle module.
 */

export default {
  streamDetails: (state) => state.streamDetails,
  selectedCommit: (state) => state.selectedCommit,
  allCommits: (state) => state.allCommits,
  allBranches: (state) => state.allBranches,
  branchAndCommits: (state) => state.branchAndCommits,
};
