<template>
  <div class="com-page">
    <trend></trend>
  </div>
</template>

<script lang='ts'>
import trend from "@/components/Trend.vue";
import { defineComponent, getCurrentInstance, inject, onMounted } from "vue";
export default defineComponent({
  name: "",
  components: {
    trend,
  },
  setup() {
  },
});
</script>
<style scoped>
</style>