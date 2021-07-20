<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script lang='ts'>
import { EChartsOption, EChartsType } from "node_modules/echarts";
import * as echarts from "echarts";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
} from "vue";
import { HttpResponse } from "@/types";
import { TestService } from "@/api/Map";
import "@/echarts_theme/chalk";
export default defineComponent({
  name: "",
  setup(props,{expose}) {
    const rank_ref = ref<HTMLElement>();
    const instance = ref<EChartsType>();
    let allData: any;
    const titleFontSize = ref(0);
    const startValue = ref(0);
    const endValue = ref(9);
    const tid = ref(0);

    const initChart = () => {
      instance.value = echarts.init(rank_ref.value as HTMLElement, "chalk");
      const initOption = reactive<EChartsOption>({
        title: {
          text: "▍地区销量排行",
          left: 20,
          top: 20,
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
          },
        ],
        grid: {
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel: true,
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove|click",
        },
      });
      toRaw(instance.value as EChartsType).setOption(initOption);
    };
    const getData = async (url: string) => {
      allData = await TestService.request(url);
      allData.sort(({ value: a }: any, { value: b }: any) => b - a);

      updateChart();
      tid.value = startInterval();
    };
    const updateChart = () => {
      if (!instance.value) return;

      const nameData = (allData as any[]).map(({ name }: any) => name);
      const valueData = (allData as any[]).map(({ value }: any) => value);

      const dataOption = reactive<EChartsOption>({
        xAxis: {
          data: nameData,
        },
        dataZoom: {
          show: false,
          startValue: startValue.value,
          endValue: endValue.value,
        },
        series: [
          {
            data: valueData,
            itemStyle: {
              //@ts-ignore
              color: ({ value }: number) => {
                if (value > 300) {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#4cd137",
                    },
                    {
                      offset: 1,
                      color: "#10ac84",
                    },
                  ]);
                } else if (value > 200) {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#48dbfb",
                    },
                    {
                      offset: 1,
                      color: "#22a6b3",
                    },
                  ]);
                } else
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#4834d4",
                    },
                    {
                      offset: 1,
                      color: "#be2edd",
                    },
                  ]);
              },
            },
          },
        ],
      });
      toRaw(instance.value as EChartsType).setOption(dataOption);
    };
    const screenAdapter = () => {
      titleFontSize.value = (rank_ref.value!.offsetWidth / 100) * 3.6;
      const adapterOption = reactive<EChartsOption>({
        title: {
          textStyle: {
            fontSize: titleFontSize.value,
          },
        },
        series: [
          {
            barWidth: titleFontSize.value,
            itemStyle: {
              borderRadius: [
                titleFontSize.value / 2,
                titleFontSize.value / 2,
                0,
                0,
              ],
            },
          },
        ],
      });

      toRaw(instance.value as EChartsType).setOption(adapterOption);
      toRaw(instance.value as EChartsType).resize();
    };
    
    expose({
      screenAdapter
    })
    
    const startInterval = () => {
      if (tid.value) clearInterval(tid.value);
      return window.setInterval(() => {
        startValue.value++;
        endValue.value++;
        if (endValue.value >= allData.length - 1) {
          startValue.value = 0;
          endValue.value = 9;
        }
        updateChart();
      }, 2000);
    };

    onMounted(() => {
      initChart();
      getData("/api/rank");
      screenAdapter();
      window.addEventListener("resize", screenAdapter);
      toRaw(instance.value as EChartsType).on("mouseover", () => {
        clearInterval(tid.value);
      });
      toRaw(instance.value as EChartsType).on("mouseout", () => {
        tid.value = startInterval();
      });
    });
    onUnmounted(() => {
      window.removeEventListener("resize", screenAdapter);
      clearInterval(tid.value);
    });
    return {
      rank_ref,
    };
  },
});
</script>
<style scoped>
</style>