<template>
  <v-card v-if="selectedcategory" max-height="87vh" min-height="87vh" outlined>
    <v-card-title>
      <span class="text-h5">Assign Material</span>
    </v-card-title>
    <div max-height="80vh" min-height="80vh" outlined class="px-5 py-5">
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="12" class="py-0 mx-0 my-0">
          <v-text-field
            label="Search by keyword"
            solo
            dense
            v-model="filterData.keyword"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Resource SubType"
            :items="subTypes"
            hide-selected
            solo
            dense
            v-model="filterData.subType"
            clearables
            @change="subTypeChange"
          ></v-combobox>
        </v-col>
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Areas"
            :items="areasObj[filterData.subType]"
            hide-selected
            solo
            dense
            v-model="filterData.area"
          ></v-combobox>
        </v-col>
      </v-row>
      <v-row class="py-0 mx-0 my-0">
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-combobox
            label="Is Multipart"
            :items="multiPart"
            hide-selected
            solo
            dense
            v-model="filterData.multipart"
          ></v-combobox>
        </v-col>
        <v-col lg="6" class="py-0 mx-0 my-0">
          <v-btn outlined text dense class="float-right" @click="onSearch">
            Search</v-btn
          >
        </v-col>
      </v-row>

      <v-row>
        <v-col lg="12">
          <v-simple-table class="px-5" height="44vh">
            <template v-slot:default>
              <thead>
                <tr>
                  <th
                    v-for="item in headers"
                    :key="item.value"
                    :id="item.value"
                    class="text-left"
                  >
                    {{ item.text }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredList"
                  :key="item._id"
                  @dblclick="onRowClick(item)"
                >
                  <td>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <div
                          class="text-truncate"
                          style="max-width: 130px;"
                          v-bind="attrs"
                          v-on="item.staticFullName ? on : null"
                        >
                          {{ item.staticFullName }}
                        </div>
                      </template>
                      <span class="tooltip">{{ item.staticFullName }}</span>
                    </v-tooltip>
                  </td>
                  <td>{{ item.resourceSubType }}</td>
                  <td>
                    {{
                      item.combinedUnits.length > 0
                        ? item.combinedUnits.join(",")
                        : ""
                    }}
                  </td>
                  <td>{{ item.isMultiPart }}</td>
                  <td>{{ item.area }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </div>
    <v-card-actions>
      <span>* double click the row to assign the material to the group</span>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "FilterMaterial",
  components: {},
  data() {
    return {
      filterData: {
        keyword: "",
        subType: "",
        area: "",
        multipart: "",
      },
    };
  },
  async mounted() {},
  computed: {
    streamId() {
      return this.$route.params.id;
    },
  },
  methods: {
    async getStream() {},
  },
  watch: {},
};
</script>

<style scoped></style>
