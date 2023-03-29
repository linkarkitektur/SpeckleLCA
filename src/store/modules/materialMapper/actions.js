export const startLoading = ({ commit }) => {
    commit('START_LOADING');
};

export const stopLoading = ({ commit }) => {
    commit('STOP_LOADING');
};

export const openAsignMaterials = ({ commit }, {category, type}) => {
    var bool = true;
    commit('SET_OPEN_ASIGN_MATERIALS', {
        bool,
        category,
        type,
    });
}

export const closeAsignMaterials = ({ commit }) => {
    commit('CLOSE_ASIGN_MATERIALS');
}

export const setResults = ({ commit }, data) => {
    commit('START_LOADING');
    commit('SET_RESULTS', data);
    commit('STOP_LOADING');
}

export const setUniqueCategories = ({ commit }, data) => {
    commit('START_LOADING');
    commit('SET_UNIQUE_CATEGORIES', data);
    commit('STOP_LOADING');
}

export const setResourceList = ({ commit }, data) => {
    commit('START_LOADING');
    commit('SET_RESOURCELIST', data);
    commit('STOP_LOADING');
}

export const setCurrentMapper = ({ commit }, data) => {
    commit('START_LOADING');
    commit('SET_CURRENT_MAPPER', data);
    commit('STOP_LOADING');
}

export const setObjectArray = ({ commit }, data) => {
    commit('START_LOADING');
    commit('SET_OBJECT_ARRAY', data);
    commit('STOP_LOADING');
}

export const updateCurrentMapper = ({ commit }, { key, staticFullName, id, temporary} ) => {
    commit('START_LOADING');
    commit('UPDATE_CURRENT_MAPPER', { key, staticFullName, id, temporary});
    commit('STOP_LOADING');
}

export const updateCurrentMapperArea = ({ commit }, { key, temporary, area, volume } ) => {
        commit('START_LOADING');
        commit('UPDATE_CURRENT_MAPPER_AREA', { key, temporary, area, volume});
        commit('STOP_LOADING');
    }

export const updateResourceEmissions = ({ commit }, data ) => {
    commit('START_LOADING');
    commit('UPDATE_RESOURCE_EMISSIONS', data);
    commit('STOP_LOADING');
}

export default{
    startLoading,
    stopLoading,
    openAsignMaterials,
    closeAsignMaterials,
    setResults,
    setUniqueCategories,
    setResourceList,
    setCurrentMapper,
    setObjectArray,
    updateCurrentMapper,
    updateCurrentMapperArea,
    updateResourceEmissions,
}
