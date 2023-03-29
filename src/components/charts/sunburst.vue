<template>
  <div id="chart-sun" class="container-fluid">
    <sunburst 
      class="sunburst"
      :data="data"
      :max-label-text="20"
      :centralCircleRelativeSize=25
      :showLabels=true
      :colorScheme=colorScheme
    >
    <!-- Should add colorScale here -->
      <breadcrumbTrail
        slot="legend"
        slot-scope="{ nodes, colorGetter, width }"
        :current="nodes.mouseOver"
        :root="nodes.root"
        :colorGetter="colorGetter"
        :from="nodes.zoomed"
        :width="width"
      />

      <nodeInfoDisplayer
        slot="top"
        slot-scope="{ nodes }"
        :current="nodes.mouseOver"
        :root="nodes.root"
        :clicked="nodes.clicked"
        description="total GWP"
      />

      <template slot-scope="{ on, actions }">
        <highlightOnHover v-bind="{ on, actions }" />
        <zoomOnClick v-bind="{ on, actions }" />
      </template>

    </sunburst>
  </div>
</template>
<script>
  import {
  breadcrumbTrail,
  highlightOnHover,
  nodeInfoDisplayer,
  popUpOnHover,
  sunburst,
  zoomOnClick
} from 'vue-d3-sunburst';
import "vue-d3-sunburst/dist/vue-d3-sunburst.css";
import * as d3 from "d3";

export default {
  data() {
    return {
      colorScheme: "schemePastel1",
    };
  },
  components: {
    breadcrumbTrail,
    highlightOnHover,
    nodeInfoDisplayer,
    sunburst,
    zoomOnClick
  },
  computed: {
    data () {
      return this.$store.getters.getResults;
    },
    colorScale () {
      console.log(this.data.children.length + 1);
      return d3.scaleOrdinal(d3.schemeCategory10);
    }
  },
  watch: {
    data: function() {
    }
  }
}
</script>
  
<style lang="scss" scoped>
#chart-sun {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  height: 1200px;
  .pop-up {
    background-color: white;
    border: black;
    pointer-events: none;
    opacity: 0.92;
  }
  .main-row {
    height: 800px;
  }
  .control-middle {
    height: 600px;
  }
  .father {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }
  .sunburst {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .custo-checkbox {
    display: flex;
    justify-content: space-between;
  }
}
  </style>