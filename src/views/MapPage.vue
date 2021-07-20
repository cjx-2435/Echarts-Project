<template>
  <div class="com-page">
    <single-map></single-map>
  </div>
</template>

<script lang='ts'>
import map from "@/components/Map.vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "",
  components: {
    'singleMap':map,
  },
  setup() {},
});
</script>
<style scoped>
</style>