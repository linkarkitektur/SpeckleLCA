<template>
    <v-row class="p-8 ma-1">
        <v-col cols="6" align="center">
            <v-btn class="ma-2" :disabled="loading || selectedMapperEmpty" color="primary" @click="generateExcel">
                Generate Excel
            </v-btn>
        </v-col>
        <v-col cols="6" align="center">
            <v-btn class="ma-2" :loading="buttonLoader" :disabled="loading || selectedMapperEmpty || buttonLoader"
                color="primary" @click="onStartCalculation">
                Start Calculation
            </v-btn>
        </v-col>
    </v-row>
</template>

<script>
import axios from "axios";
import { utils, writeFile, read, write } from "xlsx";

// Loading the token once at the head of the file.
const securityToken = VUE_APP_ONE_CLICK_LCA_SECURITY_TOKEN

const axiosBody = {
    'fileToken': this.fileToken,
    'securityToken': securityToken,
    'bearerToken': this.accessToken
}

export default {
    name: "calculateOneClick",
    components: {},
    props: ["info"],
    data() {
        return {
            loading: false,
            buttonLoader: false,
            selectedMapperEmpty: false,
        };
    },

    async mounted() {
        this.getAccessToken();
    },

    computed: {
        headCategories() {
            var currMapper = this.$store.getters.getCurrentMapper;
            var tempCats = new Set();
            for (let data in currMapper) {
                var head = data.split('#')[0]
                tempCats.add(head);
            }
            return Array.from(tempCats);
        },

        selectedMapper() {
            return this.$store.getters.getCurrentMapper;
        }
    },

    methods: {
        async sendRequest(axiosBody,) {
            try {
                const response = await axios.post('https://cors-anywhere.herokuapp.com/https://oneclicklcaapp.com/app/api/startCalculationRequest', formData, {
                    headers: {
                        'Authorization': 'Bearer ' + this.accessToken,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (response.status === 200) {
                    setTimeout(() => {
                        console.log('Getting results...')
                        this.getCalculationResults();
                    }, 1000)
                }
            } catch (error) {
                console.log(error)
            }
        },

        generateExcel() {
            const rows = this.getExcelRows();
            console.log("getExcelRows");
            console.log(rows);
            const worksheet = utils.json_to_sheet(rows);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "DATA");
            writeFile(workbook, `${this.selectedMapper.text}.xlsx`);
        },

        getExcelRows() {
            const rows = [];
            const data = this.selectedMapper;
            for (const category in data) {
                const staticFullName = data[category].staticFullName;
                const isMultiPart = true;
                //data[category].isMultiPart;
                const combinedUnits = data[category].combinedUnits || [];
                if (staticFullName && category.includes('#')) {
                    let item = {
                        CLASS: category,
                        MATERIAL: staticFullName,
                        QUANTITY: 1,
                        QTY_TYPE: isMultiPart ? 'M2' : !isMultiPart && (combinedUnits.includes("m3") || combinedUnits.includes("m")) ? 'M3' : 'M',
                        THICKNESS_MM: '',
                        TALO2000: '',
                        COMMENT: ''
                    }
                    rows.push(item)
                }
            }
            return rows;
        },

        onStartCalculation() {
            this.loader = 'buttonLoader';
            this.buttonLoader = true
            const rows = this.getExcelRows();
            const worksheet = utils.json_to_sheet(rows);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, `${this.selectedMapper.text}.xlsx`);
            const wopts = { bookType: "xlsx", bookSST: false, type: "array" };
            const wbout = write(workbook, wopts);
            this.excelFile = new Blob([wbout], { type: "application/octet-stream" });
            this.startCalculation();
        },

        calculateMaterialQuantity(category, parameter, divisor = 1) {
            let sum = 0
            if (category.includes('#')) {
                this.categories.forEach(e1 => {
                    if (e1.category === category.split('#')[0]) {
                        e1.children.forEach(e2 => {
                            if (e2.type === category.split('#')[1]) {
                                sum = sum + e2.parameter[parameter] / divisor
                            }
                        })
                    }
                })
            }
            return sum
        },

        async startCalculation() {
            this.chartData = [];
            if (this.accessToken) {
                const formData = new FormData()
                this.fileToken = `LINK-LCA-${Date.now()}`
                formData.append('fileToken', this.fileToken);
                formData.append('importFile', this.excelFile);
                formData.append('securityToken', securityToken); //TODO: @fabianlinkflink add the token to the .env
                formData.append('APICalculation', 'TRUE');
                try {
                    const response = await axios.post('https://cors-anywhere.herokuapp.com/https://oneclicklcaapp.com/app/api/startCalculationRequest', formData, {
                        headers: {
                            'Authorization': 'Bearer ' + this.accessToken,
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    if (response.status === 200) {
                        setTimeout(() => {
                            console.log('Getting results...')
                            this.getCalculationResults();
                        }, 1000)
                    }
                } catch (error) {
                    console.log(error)
                }
            } else {
                alert('Error in access token')
                this.buttonLoader = false
            }
        },

        async getCalculationResults() {
            const body = {
                'fileToken': this.fileToken,
                'securityToken': securityToken, //TODO: @fabianlinkflink same as above. The requests could also implement more DRY principles. (Demo just above here.)
                'bearerToken': this.accessToken
            }
            try {
                const response = await axios.get('https://cors-anywhere.herokuapp.com/https://oneclicklcaapp.com/app/api/getCalculationResults', {
                    params: body,
                    responseType: 'arraybuffer'
                });
                if (response.status === 200) {
                    this.loading = false
                }
                const wb = read(response.data);
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = utils.sheet_to_json(ws)
                this.loadResults(data)
                this.createData();
                console.log(this.$store.getters.getResults);
                this.loading = false;
                this.buttonLoader = false;
            } catch (error) {
                console.log(error)
                if (error.response.status === 500) {
                    alert('Calculation response failed !');
                    this.loading = false
                    this.buttonLoader = false
                } else {
                    setTimeout(() => {
                        console.log('Attempting...')
                        this.getCalculationResults();
                    }, 5000)
                }

            }
        },

        async getAccessToken() {
            const body = {
                "username": process.env.VUE_APP_ONE_CLICK_LCA_USERNAME,
                "password": process.env.VUE_APP_ONE_CLICK_LCA_PASSWORD
            };
            try {
                const response = await axios.post('https://cors-anywhere.herokuapp.com/https://oneclicklcaapp.com/app/api/login', body);
                if (response.status === 200) {
                    this.accessToken = response.data.access_token;
                    console.log(response);
                } else {
                    throw Error('Unable to login')
                }
            } catch (error) {
                console.log(error)
                alert()
                if (window.prompt('The was an error obtaining the LCAbyg auth toke\nThis most likely has to do with missing access to the development proxy.\nTry requesting demo access on the follownig website.', 'https://cors-anywhere.herokuapp.com/corsdemo'))
                    location.href = 'https://cors-anywhere.herokuapp.com/corsdemo';
            }
        },

        //Loading results and adding to ResourceEmissions
        loadResults(results) {
            console.log("Loading results");
            console.log(results);

            //Loop through resource list Ids and map them at the highest level
            for (let catIndex in this.headCategories) {
                var cat = this.headCategories[catIndex];
                var object = {};
                var childObjects = [];
                var modelId = false;

                object[cat] = {
                    "parentId": cat,
                    "parentName": cat,
                    "metric": "m2",
                    //"metric": data.UNIT? data.UNIT : "m2",
                }

                for (let resIndex in results) {
                    var data = results[resIndex];

                    if (data.CLASS.split("#")[0] == cat && data.RESULT_STATUS == "SUCCESS") {
                        var child = {
                            "childType": data.CLASS,
                            "childMaterial": data.IFCMATERIAL,
                            "GWP": {
                                A1A3: data.RESULT_ABSOLUTE,
                                A4: 0,
                                A5: 0,
                                C3: 0,
                                C4: 0,
                            }
                        }

                        childObjects.push(child);
                    }
                }

                if (childObjects.length > 0) {
                    console.log("resource missions object");
                    console.log(object[cat]);

                    object[cat].children = childObjects;

                    var sumGWP = {
                        A1A3: childObjects.reduce((total, obj) => total + obj.GWP.A1A3, 0),
                        A4: childObjects.reduce((total, obj) => total + obj.GWP.A4, 0),
                        A5: childObjects.reduce((total, obj) => total + obj.GWP.A5, 0),
                        C3: childObjects.reduce((total, obj) => total + obj.GWP.C3, 0),
                        C4: childObjects.reduce((total, obj) => total + obj.GWP.C4, 0),
                    };
                    object[cat].GWP = sumGWP;

                    console.log(object);
                    var emissionData = [cat, object];
                    this.$store.dispatch('updateResourceEmissions', emissionData);
                }
            }
            console.log("Resource Emissions updated");
            console.log(this.$store.getters.getResourceEmissions);
        },

        createData() {
            console.log("Creating graph data")
            var resourceEmissions = this.$store.getters.getResourceEmissions;
            var currentMapper = this.$store.getters.getCurrentMapper;

            console.log(currentMapper);

            //Get the upper most category without #
            var catResult = Object.keys(currentMapper).filter((item) => !item.includes("#"));
            var catArray = [];
            for (let resIndex in catResult) {

                //Get the type names for category after #
                var resName = catResult[resIndex];
                var subArray = [];


                //Get children from resourceEmisions underneath type
                if (resName in resourceEmissions) {
                    var childEmission = resourceEmissions[resName];
                    for (let childId in childEmission.children) {
                        var childArray = [];
                        var childObject = childEmission.children[childId];
                        //Find GWP values from children
                        var gwpObject = {
                            "name": childObject.childMaterial,
                            "size": childObject.GWP.A1A3 * currentMapper[childObject.childType].area,
                        }
                        childArray.push(gwpObject);

                        var typeObject = {
                            "name": childObject.childType,
                            "children": childArray
                        }

                        subArray.push(typeObject);
                    }
                }
                var catObject = {
                    "name": resName,
                    "children": subArray
                }
                if (subArray.length > 0)
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

.row:first-child>.pdiv {
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
}

.row:last-child>.pdiv {
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
.c-input .v-input .v-input__control .v-text-field.v-text-field--enclosed .v-text-field__details {
    margin: 0 !important;
}
</style>