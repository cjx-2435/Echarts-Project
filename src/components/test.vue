<template>
  <div></div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, ref, reactive } from "vue";
export default defineComponent({
  name: "",
  setup() {

    const msg = ref('相当于Vue2中data(){return{出来的数据}}')
    //等同于Vue2的mounted(){}
    onMounted(() => {
        
    });
    return {
        //通过setup的return将需要用的属性方法暴露出去给视图层用
        msg
    };
  },
});
</script>
<style scoped>
</style>