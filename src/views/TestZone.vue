<template>
  <!--DivergingStackedBar / -->
  <div class="w-screen h-96">
  <GaugeChart />
  </div>

</template>

<script>
import DropDown from '@/components/Base/Dropdown.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import GaugeChart from '@/components/Graphs/GaugeChart.vue';
import { BSAB96 } from '@/models/buildingCode'

export default {
  components: { 
    DivergingStackedBar,
    GaugeChart
  },
  data() {
    return {
      items: BSAB96
    }
  },
}
</script>