<template>
  <DropDown :items="items" />
</template>

<script>
import DropDown from '@/components/Misc/Dropdown.vue'
import { BSAB96 } from '@/models/material';

export default {
  components: { DropDown },
  data() {
    return {
      items: BSAB96
    }
  },
}
</script>