export default {
  isLoading: (state) => state.loading == true || state.buttonLoader == true,
  isResults: (state) => Object.keys(state.results).length > 1,

  openAsignMaterials: (state) => state.asignMaterials.open == true,
  getAssignMaterials: (state) => state.asignMaterials,

  getResults: (state) => state.results,
  getUniqueCategories: (state) => state.objectCategories,
  getResourceList: (state) => state.resourceList,
  getResourceEmissions: (state) => state.resourceEmissions,
  getObjectArray: state => state.objectArr,

  getCurrentMapper: (state) => state.currentMapper,
  getKeyMapper: (state) => key => state.currentMapper[key],

};
  