<template>
  <div class="pie-chart">
    <h1>Chart Section</h1>
  </div>
</template>

<script>
export default {
  props:{
    chartData:{
      type:Array,
      required:true,
      default:null
    }
  },
  mounted(){
    console.log(this.chartData)
  }
}
</script>

<style>

</style>