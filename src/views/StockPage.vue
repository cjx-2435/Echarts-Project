<template>
  <div class="com-page">
      <stock></stock>
  </div>
</template>

<script lang='ts'>
import stock from '@/components/Stock.vue'
import { defineComponent } from 'vue'
export default defineComponent({
      name: '',
      components:{
          stock
      },
      setup() {}
  });
</script>
<style scoped>
</style>