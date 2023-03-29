<template>
    <div style="height: 100px">
        <v-row>
            <v-col lg="6" sm="12" xs="12" class="px-10">
                <v-combobox
                    v-model="mapperName"
                    :items="savedMapperList"
                    item-text="text"
                    label="Select Saved Mapper"
                    :disabled="loading"
                    @change="onMapperChange"
                    >
                    <template v-slot:item="{ item }">
                        {{ item.text }}
                        <v-spacer></v-spacer>
                        <v-list-item-action @click.stop class="flex-row">
                            <v-btn icon @click.stop.prevent="setAsDefault(item)">
                                <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon :color="item.color" v-on="on" v-bind="attrs"
                                    >mdi-check</v-icon
                                    >
                                </template>
                                <span class="tooltip">{{ item.tooltip }}</span>
                                </v-tooltip>
                            </v-btn>
                            <v-btn
                                icon
                                @click.stop.prevent="deleteMapper(item)"
                                v-if="item.color === 'grey'"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-icon color="red" v-on="on" v-bind="attrs"
                                        >mdi-delete</v-icon>
                                    </template>
                                    <span class="tooltip">Delete Mapper</span>
                                </v-tooltip>
                            </v-btn>
                        </v-list-item-action>
                    </template>
                </v-combobox>
            </v-col>
            <v-col lg="6" sm="12" xs="12" class="px-8">
                <v-btn
                    color="primary"
                    class="float-right mt-2"
                    outlined
                    text
                    :disabled="loading"
                    @click="createNew"
                    >
                    Create New Mapping
                </v-btn>
                <v-dialog v-model="dialogMapper" persistent max-width="600px">
                    <v-card>
                        <v-card-title>
                            <span class="text-h5">Mapper Name</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                    label="Mapper name"
                                    required
                                    v-model="mapperName"
                                    ></v-text-field>
                                </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                v-if="savedMapperList[0]"
                                color="blue darken-1"
                                text
                                @click="dialogMapper = false"
                                >
                                Close
                            </v-btn>
                            <v-btn color="blue darken-1" text @click="onSave">
                                Save
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import {
    getDefaultData,
    isObjectEmpty,
} from "@/components/materialMapper/shared/utils/helpers";
import db from "@/firebase/firebaseinit";

export default {
    name: "mapper",
    components: {},
    props: ["info"],
    data() {
        return {
            loading: false,
            savedMapperList: [],
            mapperName: "",
            currentCategoryMapper: {},
            defaultCategoryMapper: {},
            dialogMapper: false,
        }
    },

    async mounted() {
        this.getMappers();
        //This messes up mapping, overwriting the last one sometimes. 
        //Couldnt get watch to work, look over /FS
        this.$store.subscribe((mutation, state) => {
            if (mutation.type.includes('CURRENT_MAPPER') && mutation.type !== 'SET_CURRENT_MAPPER') {
                console.log("updatingMapperList");
                this.updateMapperList();
            }
        });
    },

    computed: {
        isLoading() {
            return this.$store.getters.isLoading;
        },
        currentMapper() {
            return this.$store.getters.getCurrentMapper;
        },
        streamId() {
            return this.$route.params.id;
        },
    },

    watch: {
        isLoading: {
            handler(data){
                this.loading = data;
            },
        },
        streamId: {
            handler: async function (val) {
                if (val) this.getStream();
            },
        },
    },
    methods: {
    async getMappers() {
        const colRef = collection(db, "mappers");
        const docRef = doc(colRef, this.streamId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            this.savedMapperList = Object.values(snap.data());
            for(let ind in this.savedMapperList){
                if(this.savedMapperList[ind].isDefault){
                    this.$store.dispatch('setCurrentMapper', this.savedMapperList[ind]?.data);
                    this.mapperName = this.savedMapperList[ind]?.text;
                }
            }
        } else {
            this.mapperName = "Default";
            this.dialogMapper = true;
        }
        console.log("Loaded mappers correctly");
    },
    async updateMappers(newData) {
        const colRef = collection(db, "mappers");
        const docRef = doc(colRef, this.streamId);
        setDoc(docRef, { ...newData });
    },

    setAsDefault(item) {
        const data = getDefaultData(item, this.savedMapperList);
        this.saveMapper(data);
    },

    deleteMapper(item) {
        console.log("Deleted Mapper " +  item.text);
        this.savedMapperList = this.savedMapperList.filter(
            (el) => el.text !== item.text
        );
        if (this.mapperName === item.text) {
            this.$store.dispatch('setCurrentMapper', this.savedMapperList[0]);
            this.mapperName = this.savedMapperList[0].text;
        }
        this.saveMapper(this.savedMapperList);
    },

    createNew() {
        this.dialogMapper = true;
    },

    async onMapperChange(event) {
        this.mapperName = event.text;
        const i = this.savedMapperList?.findIndex(
            (_element) => _element.text === event.text
        );
        if (i > -1) {
            console.log(this.savedMapperList);
            this.$store.dispatch('setCurrentMapper', this.savedMapperList[i]["data"]);
        }else{
            var objArray = this.$store.getters.getObjectArray;
            for(let ind in objArray){
                var key = objArray[ind];
                var staticFullName = "";
                var id = "";
                var temporary = false;

                this.$store.dispatch('updateCurrentMapper', { key, staticFullName, id, temporary });
            }
            this.savedMapperList.push({
                text: this.mapperName,
                data: {...this.currentMapper},
                color: "grey",
                isDefault: false,
                tooltip: "Make it as default",
            });
        }
    },

    onSave() {
        const i = this.savedMapperList?.findIndex(
        (_element) => _element.text === this.mapperName
        );
        if (i > -1) {
            this.savedMapperList[i]["data"] = {...this.currentMapper};
            this.mapperName = this.savedMapperList[i].text;
        } else {
            var objArray = this.$store.getters.getObjectArray;
            for(let ind in objArray){
                var key = objArray[ind];
                var staticFullName = "";
                var id = "";
                var temporary = false;

                this.$store.dispatch('updateCurrentMapper', { key, staticFullName, id, temporary });
            }
            this.savedMapperList.push({
                text: this.mapperName,
                data: {...this.currentMapper},
                color: this.savedMapperList.length === 0 ? "green" : "grey",
                isDefault: this.savedMapperList.length === 0 ? true : false,
                tooltip:
                this.savedMapperList.length === 0
                    ? "Selected as default"
                    : "Make it as default",
            });
            
        }
        this.dialogMapper = false;
        this.saveMapper(this.savedMapperList);
    },

    async updateMapperList() {
        const i = this.savedMapperList?.findIndex(
            (_element) => _element.text === this.mapperName
        );
        if (i > -1) this.savedMapperList[i]["data"] = {...this.currentMapper};
        this.saveMapper(this.savedMapperList);
    },

    saveMapper(items) {
        if (this.streamId) {
            this.updateMappers(items);
        }
    },
},
};
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
