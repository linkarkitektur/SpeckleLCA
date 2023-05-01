<template>
    <v-row class="p-8 ma-1">
        <v-col cols="6" align="center">
            <v-btn
            class="ma-2"
            :disabled="loading || selectedMapperEmpty"
            color="primary"
            @click="downloadJSON"
            >
            Generate JSON
            </v-btn>
        </v-col>
        <v-col cols="6" align="center">
            <v-btn
            class="ma-2"
            :loading="buttonLoader"
            :disabled="loading || selectedMapperEmpty || buttonLoader"
            color="primary"
            @click="onStartCalculation"
            >
            Start Calculation
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default {
    name: "calculateLCAByg",
    components: {},
    props: ["info"],
    data() {
      return {
        loading: false,
        buttonLoader: false,
        selectedMapperEmpty: false,
      };
    },

    async mounted(){
        this.getAccessTokenLCAbyg();
    },

    computed: {
        uniqueIds() {
            var currMapper = this.$store.getters.getCurrentMapper;
            var tempIds = new Set();
            for (let data in currMapper){
                tempIds.add(currMapper[data]._id);
            }
            return Array.from(tempIds);
        },
        resourceList() {
            return this.$store.getters.getResourceList;
        }
    },

    methods: {
        resourceListId(id) {
            var tempSet = new Set();
            for (let data in this.resourceList){
                if(this.resourceList[data]._id == id)
                    tempSet.add(this.resourceList[data].staticFullName);
            }
            return Array.from(tempSet)[0];
        },
        getConstructionsJSON() {
            var constructionsJSON = new Array();
            //Go through each unique ID in the current mapper
            for (let idIndex in this.uniqueIds){
                var id = this.uniqueIds[idIndex];
                if (id != "" && id != undefined){
                    //Elements act as categories and are the upper level of the json
                    const elementName = encodeURI(this.resourceListId(id));
                    const elementUUID = uuidv4();

                    const element_properties = {
                        id: elementUUID,
                        name: {
                            Danish: elementName,
                            English: elementName,
                            German: elementName,
                        },
                        source: "User",
                        comment: "comment",
                        enabled: true,
                        active: true,
                    };
                    //Create the element for the json
                    const element_set = { Element: element_properties };
                    const element_node = { Node: element_set };

                    const category_edge_id = uuidv4();
                    const category_edge_details = { id: category_edge_id, enabled: true };
                    const category_edge_data = [
                        { CategoryToElement: category_edge_details },
                        "069983d0-d08b-405b-b816-d28ca9648956",
                        elementUUID,
                    ];
                    const category_edge = { Edge: category_edge_data };

                    constructionsJSON = constructionsJSON.concat(element_node);
                    constructionsJSON = constructionsJSON.concat(category_edge);

                    //Amount set to 1 as LCAByg is always working with Areas
                    const element_edge_details = {
                        id: uuidv4(),
                        amount: 1,
                        enabled: true,
                    };
                    // Create the edges towards element, using the standard constructions
                    const element_edge_data = [
                        { ElementToConstruction: element_edge_details },
                        elementUUID,
                        id,
                    ];
                    const element_edge = { Edge: element_edge_data };

                    constructionsJSON = constructionsJSON.concat(element_edge);
                }
            }

            //Working method for doing all calculations in LCAByg with no remapping
            //Loop through all categories and find each object and map that to areas
            /*
            for (const cat in materialMapper.uniqueCategories) {
                let category = materialMapper.uniqueCategories[cat].category;
                
                if (
                category == "Walls" ||
                category == "Roofs" ||
                category == "Floors"
                    ) {
                    //Elements act as categories and are the upper level of the json
                    const elementName = category;

                    const elementUUID = uuidv4();
                    const element_properties = {
                        id: elementUUID,
                        name: {
                        Danish: elementName,
                        English: elementName,
                        German: elementName,
                        },
                        source: "User",
                        comment: "comment",
                        enabled: true,
                        active: true,
                    };
                    //Create the element for the json
                    const element_set = { Element: element_properties };
                    const element_node = { Node: element_set };

                    const category_edge_id = uuidv4();
                    const category_edge_details = { id: category_edge_id, enabled: true };
                    const category_edge_data = [
                        { CategoryToElement: category_edge_details },
                        "069983d0-d08b-405b-b816-d28ca9648956",
                        elementUUID,
                    ];
                    const category_edge = { Edge: category_edge_data };

                    constructionsJSON = constructionsJSON.concat(element_node);
                    constructionsJSON = constructionsJSON.concat(category_edge);

                    //Go through each child of the category to find subcategories
                    for (const child in materialMapper.uniqueCategories[cat].children) {
                        //Create the needed elements from current mapper and unique categories
                        var nodes = new Array();
                        let type = materialMapper.uniqueCategories[cat].children[child].type;
                        let concatName = category + "#" + type;
                        let area = materialMapper.uniqueCategories[cat].children[child].area;
                        let lcabygId = materialMapper.currentCategoryMapper[concatName]._id;
                        let staticFullName = materialMapper.currentCategoryMapper[concatName].staticFullName;

                        const element_edge_details = {
                        id: uuidv4(),
                        amount: area,
                        enabled: true,
                        };
                        // Create the edges towards element, using the standard constructions
                        const element_edge_data = [
                        { ElementToConstruction: element_edge_details },
                        elementUUID,
                        lcabygId,
                        ];
                        const element_edge = { Edge: element_edge_data };

                        nodes = nodes.concat(element_edge);
                        constructionsJSON = constructionsJSON.concat(nodes);
                    }
                }
                */
                //This is the part that creates the constructions commented out for now
                //Should be integrated with custom creation of constructions
                //See https://github.com/Curiosit/Excel_to_JSON_LCAByg
                /*
                const construction_properties = {'id': lcabygId,  'name': {'Danish': staticFullName, 'English': staticFullName},'unit': "M2", 'source': 'User',"comment": "comment",'layer': 1,'locked': true};
                
                const construction_set = {'Construction': construction_properties};

                const construction_node = {'Node': construction_set};
                const beton_uuid = "11c8727c-e603-52e6-882d-ce650729a8a0"

                ////////CONSTRUCTION EDGES

                const construction_edge_id = uuidv4();
                const construction_edge_details = {'id': construction_edge_id,'amount': area / 100, 'unit': "M2", 'lifespan': 50,     'demolition': false,     'enabled': true,     'delayed_start': 0}
                const construction_edge_data = [{'ConstructionToProduct': construction_edge_details}, unique_const_UUID, beton_uuid]
                const construction_edge = {'Edge': construction_edge_data}
                
                nodes = nodes.concat(construction_node)
                nodes = nodes.concat(construction_edge)
                */

                //const isMultiPart = data[category].isMultiPart;
                //const combinedUnits = data[category].combinedUnits || [];

                //if(staticFullName && category.includes('#')){

                //    CLASS:category,
                //    MATERIAL:staticFullName,
                //    QUANTITY: this.getMaterialQuantity(category,isMultiPart,combinedUnits),
                //    QTY_TYPE: isMultiPart ? 'M2' : !isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m")) ? 'M3' : 'M',
                //    THICKNESS_MM:'',
                //    TALO2000:'',
                //    COMMENT:''
                //  }

                //nodes.push(element_edge)
                //nodes.push(construction_node)
                //nodes.push(construction_edge)
                //}
            //}

            //CATEGORY EDGES

            //const constructionsJSON = [];
            //constructionsJSON.push(element_node);
            //constructionsJSON.push(nodes);
            //constructionsJSON.push(category_edge);

            return constructionsJSON;
        },

        //Creates dummy for now
        //@TODO: this should be split up so we can add with interfaces
        loadJSONtemplate() {
            var templateJson = require("@/assets/lcaByg/merged_rest.json");
            return templateJson;
        },

        //Creates dummy for now, 
        //@TODO: this should be added through a more proper way with an interface
        generateBuildingJSON() {
            var buildingJSON = require("@/assets/lcaByg/dummy_building.json");

            return buildingJSON;
        },

        // Create the Json
        //@TODO: Dummy data, this should be all seperated files that can be manipulated through app
        generateJSON() {
            const constructionsJSON = this.getConstructionsJSON();
            const buildingJSON = this.generateBuildingJSON();
            const templateJson = this.loadJSONtemplate();

            var mergedJSON = new Array();

            mergedJSON = mergedJSON.concat(buildingJSON);
            mergedJSON = mergedJSON.concat(constructionsJSON);
            mergedJSON = mergedJSON.concat(templateJson);

            return mergedJSON;
        },

        downloadJSON() {
            const mergedJSON = this.generateJSON();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(
                new Blob([JSON.stringify(mergedJSON, null, 2)], {
                type: "text/plain",
                })
            );
            a.setAttribute("download", "specklelca.json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        
        onStartCalculation() {
            //TODO
            this.loader = "buttonLoader";
            this.buttonLoader = true;
            this.project_data = {};
            this.startCalculation();
        },

        async getAccessTokenLCAbyg() {
            const params = {
            username: process.env.VUE_APP_LCABYG_USER,
            password: process.env.VUE_APP_LCABYG_PASSWORD,
            };

            const response = await axios.post(
            "https://api1.lcabyg.dk/v2/login",
            params
            );
            if (response.status === 200) {
                this.accessTokenLCAbyg = response.data;
                console.log(response);
            } else {
                throw Error("Unable to login to LCA byg");
            }

        },

        async startCalculation() {

            const data = {
                priority: 10,
                job_target: "lcabyg5+br23",
                job_target_min_ver: "",
                job_target_max_ver: "",
                job_arguments: "",
                input_blob: btoa(JSON.stringify(this.generateJSON())),
            };

            //console.log(btoa(JSON.stringify(this.generateJSON())))

            // this.chartData = [];
            if(this.accessTokenLCAbyg){
                try {
                
                    const response = await axios.post(
                    "https://api1.lcabyg.dk/v2/jobs",
                    data,
                    {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            Authorization: "Bearer " + this.accessTokenLCAbyg,
                        },
                    }
                    );
                    if (response.status === 200) {
                        console.log("RESULT HAS BEEN SENT");
                        const id = response.data.id;
                        console.log(id);
                        setTimeout(() => {
                            console.log("Getting results...");
                            this.getCalculationResults(id);
                        }, 1000);
                    }
                } catch (error) {
                    console.log(error);
                }
            }else{
                alert('Error No access token for LCAbyg')
                this.buttonLoader = false
            }
        },

        //Loading results and adding to ResourceEmissions
        loadResults (results){       
            console.log("Loading results");
            console.log(results);
            //Loop through modeldata to find ids that are mapped towards resource list id
            //TODO: Dont know lambda in JS this could be much cleaner with some nice lambda
            for (let modelIndex in results.model){
                var modelData = results.model[modelIndex];
                var object = {};
                var childObjects = [];
                var parentId;
                var childId = [];
                var modelId = false;

                //Loop through resource list Ids and map them at the highest level
                for (let index in this.uniqueIds){
                    var id = this.uniqueIds[index];
                    if(modelData.model_id === id){
                        modelId = id
                        parentId = modelData.id;

                        object[modelId] = {
                            "parentId": parentId,
                            "parentName": modelData.name.English,
                            "metric": modelData.construction_amount_unit,
                        };

                        //Loop through results again to find children
                        //This should be optimized
                        for(let childIndex in results.model){
                            var childData = results.model[childIndex];
                            if(childData.parent == parentId){
                                var child = {
                                    "childId": childData.id,
                                    "childName": childData.name.English,
                                };
                                childId.concat(childData.id);
                                childObjects.push(child);
                            }
                        }
                        //Loop through results and create GWP mapping on all children
                        for (let resultID in results.results) {
                            for (var i = 0; i < childObjects.length; i++) {
                                if(childObjects[i].childId == resultID){
                                    var childGWP = {
                                        "A1A3": "A1to3" in results.results[resultID] ? 
                                        results.results[resultID]["A1to3"]["2022"]["GWP"] : 0,
                                        "A4": "A4" in results.results[resultID] ? 
                                        results.results[resultID]["A4"]["2022"]["GWP"] : 0,
                                        "A5": "A5" in results.results[resultID] ? 
                                        results.results[resultID]["A5"]["2022"]["GWP"] : 0,
                                        "C3": "C3" in results.results[resultID] ? 
                                        results.results[resultID]["C3"]["2071"]["GWP"] : 0,
                                        "C4": "C4" in results.results[resultID] ?  
                                        results.results[resultID]["C4"]["2071"]["GWP"] : 0,
                                    };
                                    childObjects[i].GWP = childGWP;
                                }
                            }
                        } 
                    }
                }
                if(childObjects.length > 0){
                    console.log("resource missions object");
                    console.log(object[modelId]);
                    object[modelId].children = childObjects;

                    var sumGWP = {
                        A1A3: childObjects.reduce((total, obj) => total + obj.GWP.A1A3, 0),
                        A4: childObjects.reduce((total, obj) => total + obj.GWP.A4, 0),
                        A5: childObjects.reduce((total, obj) => total + obj.GWP.A5, 0),
                        C3: childObjects.reduce((total, obj) => total + obj.GWP.C3, 0),
                        C4: childObjects.reduce((total, obj) => total + obj.GWP.C4, 0),
                    };
                    object[modelId].GWP = sumGWP;

                    var emissionData = [modelId, object];
                    this.$store.dispatch('updateResourceEmissions', emissionData);
                }
            }
            console.log("Resource Emissions updated");
            console.log(this.$store.getters.getResourceEmissions);
        },

        createData () {
            console.log("Creating graph data")
            var resourceEmissions = this.$store.getters.getResourceEmissions;
            var currentMapper = this.$store.getters.getCurrentMapper;

            console.log(currentMapper);

            var catResult = Object.keys(currentMapper).filter((item) => !item.includes("#"));
            var catArray = [];
            for(let resIndex in catResult){

                var resName = catResult[resIndex];
                var subArray = [];
                var typeResult = Object.keys(currentMapper).filter(item => item.includes("#") && item.includes(resName));
                for(let typeIndex in typeResult){

                    var typeName = typeResult[typeIndex];
                    var childArray = [];
                    if(currentMapper[typeName]._id != "" && currentMapper[typeName]._id != undefined) {
                        var childResult = Object.keys(resourceEmissions).filter(item => item.includes(currentMapper[typeName]._id));
                        for(let resourceIndex in childResult){
                        
                            var resourceId = childResult[resourceIndex];
                            for(let childIndex in resourceEmissions[resourceId].children){

                                var gwpArray = [];
                                for(let gwp in resourceEmissions[resourceId].children[childIndex].GWP){
                                
                                    var gwpObject = {
                                        "name": gwp,
                                        "size": resourceEmissions[resourceId].children[childIndex].GWP[gwp] * currentMapper[typeName].area,
                                    }
                                    
                                    gwpArray.push(gwpObject);

                                }
                                var childObject = {
                                    "name": resourceEmissions[resourceId].children[childIndex].childName,
                                    "children": gwpArray,
                                }
                                
                                childArray.push(childObject);
                            }
                        }
                    }
                
                    var typeObject = {
                        "name": typeName,
                        "children": childArray
                    }
                    if(childArray.length > 0)
                        subArray.push(typeObject);
                }

                var catObject = {
                    "name": resName,
                    "children": subArray
                }
                if(subArray.length > 0)
                    catArray.push(catObject);
            }

            var modelObject = {
                "name": "model",
                "children": catArray
            }
            console.log("Updated results:");
            console.log(modelObject);
            this.$store.dispatch("setResults", modelObject);
            return modelObject;
        },

        async getCalculationResults(job_id) {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

            console.log("Job ID", job_id);

            const data = {
                headers: {
                "Access-Control-Allow-Origin": "*",
                Authorization: "Bearer " + this.accessTokenLCAbyg,
                },
            };

            const get_status = async () => {
                try {
                    const response = await axios.get(
                        "https://api1.lcabyg.dk/v2/jobs/" + job_id,
                        data
                    );
                    if (response.status === 200) {
                        return response.data.status;
                    }
                } catch (error) {
                    console.log(error);
                    return "";
                }
            };

            const get_job = async () => {
                try {
                    const response = await axios.get(
                        "https://api1.lcabyg.dk/v2/jobs/" + job_id,
                        data
                    );
                    if (response.status === 200) {
                        return response.data;
                    }
                } catch (error) {
                    console.log(error);
                    return "";
                }
            };

            var status = await get_status();

            console.log("Status", status);

            while ((status == "New") | (status == "Started")) {
                // This is a delay timer
                await sleep(1000);
                status = await get_status();
                console.log("Sleeping");
                console.log("After wait", status);
            }

            switch (status) {
                case "Ready":
                try {
                    const response = await axios.get(
                    "https://api1.lcabyg.dk/v2/jobs/" + job_id + "/output",
                    data
                    );
                    if (response.status === 200) {
                        console.log("RESULTS DATA");
                        //console.log(response.data)
                        const data = response.data;
                        this.results = JSON.parse(atob(data));
                        this.loadResults(this.results);
                        this.createData();
                        console.log(this.$store.getters.getResults);
                        this.loading = false;
                        this.buttonLoader = false;
                    }
                    // const wb = read(response.data);
                    // const wsname = wb.SheetNames[0]
                    // const ws = wb.Sheets[wsname]
                    // const data = utils.sheet_to_json(ws)
                    // this.formulateData(data)
                } catch (error) {
                    console.log(error);
                    // if (error.response.status === 500) {
                    //   alert('Calculation response failed !');
                    //   this.loading = false
                    //   this.buttonLoader = false
                    // } else {
                    //   setTimeout(() => {
                    //     console.log('Attempting...')
                    //     this.getCalculationResults();
                    //   }, 5000)
                    // }
                }
                break;
                case "Failed":
                    this.loading = false;
                    console.log("REQUEST failed", await get_job());
                    break;
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.bg {
  background-color: #f8f8f8;
}
.pdiv {
  width: 100%;
  background-color: #e6e6e6;
  padding-left: 10px;
  padding-right: 10px;
  vertical-align: middle;
}
.row:first-child > .pdiv {
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
}
.row:last-child > .pdiv {
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
.cdiv {
  background-color: #f8f8f8;
  width: 100%;
  padding: 10px;
  vertical-align: middle;
}
.cdiv2 {
  background-color: #f8f8f8;
  width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  vertical-align: middle;
}
.tooltip {
  width: 100px;
  word-wrap: break-word;
}

.scroll-box {
  overflow: scroll;
  padding: 1em;
}

.v-card {
  display: flex !important;
  flex-direction: column;
}

.v-card__text {
  flex-grow: 1;
  overflow: auto;
}

.v-input .v-input__control .v-text-field__details,
.c-input
  .v-input
  .v-input__control
  .v-text-field.v-text-field--enclosed
  .v-text-field__details {
  margin: 0 !important;
}
</style>