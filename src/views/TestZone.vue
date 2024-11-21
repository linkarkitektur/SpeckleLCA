<template>
  <DivergingStackedBar />
</template>

<script>
import DropDown from '@/components/Misc/Dropdown.vue'
import DivergingStackedBar from '@/components/Graphs/DivergingStackedBar.vue'
import { BSAB96 } from '@/models/buildingCode'

export default {
  components: { DivergingStackedBar },
  data() {
    return {
      items: BSAB96
    }
  },
}
</script>