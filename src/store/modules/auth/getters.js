export default {
  isAuthenticated: (state) => state.user != null,
  getUserInfo: (state) => state.user,
};
