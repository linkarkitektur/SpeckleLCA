import * as types from "./mutation-types";
import {
  exchangeAccessCode,
  speckleLogOut,
  getUserData,
  goToSpeckleAuthPage,
} from "@/utils/speckleUtils";
import router from "@/router";

export const login = () => goToSpeckleAuthPage();

export const logout = ({ commit }) => {
  commit(types.LOGOUT);
  // Wipe the state
  commit(types.SET_USER, null);
  commit(types.SET_SERVER_INFO, null);
  commit(types.SET_STREAM_DETAILS, null);
  // Wipe the tokens
  speckleLogOut();
  router.push("/login");
};
export const getUser = async ({ commit }) => {
  try {
    let json = await getUserData();
    let data = json.data;
    commit(types.SET_USER, data.user);
    commit(types.SET_SERVER_INFO, data.serverInfo);
  } catch (err) {
    console.error(err);
  }
};

export const exchangeAccessCodes = ({ commit }, accessCode) => {
  // Here, we could save the tokens to the store if necessary.
  return exchangeAccessCode(accessCode);
};

export default {
  login,
  logout,
  getUser,
  exchangeAccessCodes,
};
