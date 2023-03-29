export default {
    START_LOADING (state) {
        state.loading = true;
    },

    STOP_LOADING (state) {
        state.loading = false;
    },

    SET_OPEN_ASIGN_MATERIALS(state, { bool, category, type }) {
        state.asignMaterials.open = bool;
        state.asignMaterials.category = category;
        state.asignMaterials.type = type;
    },

    CLOSE_ASIGN_MATERIALS(state) {
        state.asignMaterials.open = false;
    },

    SET_OBJECT_CATEGORIES(state, data) {
        state.objectCategories = data;
    },

    SET_RESULTS(state, data) {
        state.results = data;
    },

    SET_CURRENT_MAPPER(state, data) {
        for (let dataKey in data) {
            if(Object.keys(state.currentMapper).includes(dataKey)){
                state.currentMapper[dataKey].staticFullName = data[dataKey].staticFullName;
                state.currentMapper[dataKey]._id = data[dataKey]._id;
                state.currentMapper[dataKey].isTemporary = data[dataKey].isTemporary;
                if(data[dataKey].area > 0)
                    state.currentMapper[dataKey].area = data[dataKey].area;
                if(data[dataKey].volume > 0)
                    state.currentMapper[dataKey].volume = data[dataKey].volume;
            }
            else{
                state.currentMapper[dataKey] = {
                    staticFullName: data[dataKey].staticFullName,
                    _id: data[dataKey]._id,
                    isTemporary: data[dataKey].isTemporary,
                    "area": data[dataKey].area,
                    "volume": data[dataKey].volume,
                }
            }
        }
    },

    SET_OBJECT_ARRAY(state, data) {
        state.objectArr = data;
    },

    UPDATE_CURRENT_MAPPER(state, {key, staticFullName, id, temporary}) {
        if (staticFullName != undefined || id != undefined) {
            if(Object.keys(state.currentMapper).includes(key)){
                state.currentMapper[key].staticFullName = staticFullName;
                state.currentMapper[key]._id = id;
                state.currentMapper[key].isTemporary = temporary;
            }else{
                state.currentMapper[key] =  {
                    "staticFullName": staticFullName,
                    "_id": id,
                    isTemporary: temporary,
                    area: 0.0,
                    volume: 0.0,
                };
            }
        }
    },
    
    UPDATE_CURRENT_MAPPER_AREA(state, {key, temporary, area, volume}) {
        if(Object.keys(state.currentMapper).includes(key)){
            state.currentMapper[key].isTemporary = temporary;
            if(area > 0)
                state.currentMapper[key].area = area;
            if(volume > 0)
                state.currentMapper[key].volume = volume;
        }else{
            state.currentMapper[key] = {
                staticFullName: "",
                _id: "",
                isTemporary: false,
                "area": area,
                "volume": volume,
            };
        }
    },

    SET_RESOURCELIST(state, data){
        state.resourceList = data;
    },

    UPDATE_RESOURCE_EMISSIONS(state, data){
        var modelId = data[0];
        var emissionObject = data[1];
        state.resourceEmissions[modelId] = emissionObject[modelId];
    },
};
  