import { getStreamCommits } from "@/utils/speckleUtils";
import { isEmpty } from "lodash";
import { groupBy } from "./../../helper";
import * as types from "./mutation-types";
export const getStreamAction = async ({ commit }, data) => {
  try {
    const res = await getStreamCommits(data.streamId, data.limit, data.cursor);
    const arr = res.data.stream?.commits?.items?.map((el, key) => {
      return { id: el.id, text: el?.message ?? "Commit " + key };
    });
    let groupedArr = {};
    let branchArr = [];
    if (
      res.data.stream?.commits?.items &&
      !isEmpty(res.data.stream?.commits?.items)
    ) {
      groupedArr = groupBy(res.data.stream?.commits?.items, "branchName");
      branchArr = res.data.stream?.commits?.items?.map(function(el) {
        return el?.branchName;
      });
    }

    commit(types.SET_STREAM_DETAILS, res.data.stream);
    commit(types.SET_COMMIT, res.data.stream.commits.items?.[0]);
    commit(types.SET_ALL_COMMITS, arr);
    commit(types.SET_ALL_BRANCHES, [...new Set(branchArr)]);
    commit(types.SET_BRANCH_AND_COMMITS, groupedArr);
  } catch (err) {
    console.error(err);
  }
};
export default {
  getStreamAction,
};
