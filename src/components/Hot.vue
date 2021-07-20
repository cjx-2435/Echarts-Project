<template>
  <div class="com-container">
    <div class="iconfont left" :style="size" @click="changeLeft">&#xe6ef;</div>
    <div class="com-chart" ref="hot_ref"></div>
    <div class="iconfont right" :style="size" @click="changeRight">
      &#xe6ed;
    </div>
    <div class="active" :style="size">{{ current }}</div>
  </div>
</template>

<script lang='ts'>
import { EChartsOption, EChartsType } from "node_modules/echarts";
import * as echarts from "echarts";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import "@/echarts_theme/chalk";
import { TestService } from "@/api/Map";
export default defineComponent({
  name: "",
  setup(props,{expose}) {
    console.log(getCurrentInstance());
    
    const {
      proxy: { $socket: ws },
    }: any = getCurrentInstance();
    const hot_ref = ref<HTMLElement>();
    let instance: EChartsType;
    let allData: any;
    const index = ref(0);
    const titleFontSize = ref(0);
    const current = ref("");
    const size = computed(() => {
      return { fontSize: +titleFontSize.value + "px" };
    });

    const initChart = () => {
      instance = echarts.init(hot_ref.value as HTMLElement, "chalk");

      const initOption = reactive<EChartsOption>({
        title: {
          text: "▍热销商品销售金额占比统计",
          left: 20,
          top: 20,
        },
        legend: {
          top: "13%",
          icon: "circle",
        },
        series: [
          {
            type: "pie",
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
              },
              labelLine: {
                lineStyle: {
                  color: "#fff",
                },
              },
            },
          },
        ],
      });
      instance.setOption(initOption);
    };

    const getData = (data?: any) => {
      allData = data;
      // allData = await TestService.request("/api/hotproduct");
      updateChart();
    };

    ws.registerCallBack("hotproductData", getData);

    const updateChart = () => {
      if (!instance) return;
      current.value = allData[index.value].name;
      const classData = allData[index.value].children;

      const dataOption = reactive<EChartsOption>({
        series: [
          {
            data: classData,
          },
        ],
        legend: {
          name: classData.map(({ name }: any) => name),
        },
        //@ts-ignore
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove|click",
          formatter: ({ data }: any) => {
            const res = data.children.map(({ name, value }: any) => {
              return name + " " + ((value / data.value) * 100).toFixed(2) + "%";
            });
            return res.join("</br>");
          },
        },
      });
      instance.setOption(dataOption);
    };

    const screenAdapter = () => {
      if (!instance) return;
      titleFontSize.value =
        ((hot_ref.value as HTMLElement).offsetWidth / 100) * 3.6;
        
      const adapterOption = reactive<EChartsOption>({
        title: {
          textStyle: {
            fontSize: titleFontSize.value,
          },
        },
        series: [
          {
            radius: titleFontSize.value * 5,
            center: ["50%", "60%"],
          },
        ],
        legend: {
          itemWidth: titleFontSize.value,
          itemHeight: titleFontSize.value,
          itemGap: titleFontSize.value / 2,
          textStyle: {
            fontSize: titleFontSize.value,
          },
        },
      });
      instance.setOption(adapterOption);
      instance.resize();
    };
    expose({
      screenAdapter
    })
    const changeLeft = () => {
      if (index.value <= 0) {
        index.value = allData.length - 1;
      } else index.value--;

      updateChart();
    };
    const changeRight = () => {
      if (index.value >= allData.length - 1) {
        index.value = 0;
      } else index.value++;

      updateChart();
    };

    onMounted(() => {
      initChart();
      // getData();
      ws.send({
        action: "getData",
        socketType: "hotproductData",
        chartName: "hotproduct",
        value: "",
      });
      screenAdapter();
      window.addEventListener("resize", screenAdapter);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", screenAdapter);
      ws.unRegisterCallBack("hotproductData");
    });

    return {
      hot_ref,
      changeRight,
      changeLeft,
      current,
      size,
    };
  },
});
</script>
<style lang='scss' scoped>
.com-container {
  position: relative;
  .left,
  .right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #fff;
    font-size: 50px;
    z-index: 1;
    cursor: pointer;
  }
  .left {
    left: 20%;
  }
  .right {
    right: 20%;
  }
  .active {
    position: absolute;
    bottom: 20%;
    right: 20%;
    color: #fff;
  }
}
</style>