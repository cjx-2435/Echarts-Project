<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script lang='ts'>
import * as echarts from "echarts";
import "@/echarts_theme/chalk";
import { EChartsOption, EChartsType, SeriesOption } from "node_modules/echarts";
import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import { TestService } from "@/api/Map";
export default defineComponent({
  name: "",
  setup(props,{expose}) {
    const stock_ref = ref<HTMLElement>();
    let instance: EChartsType;
    let allData: any;
    const currentPage = ref(1);
    const pageSize = ref(5);
    const totalPage = ref(1);
    const titleFontSize = ref(0);
    const tid = ref(0);

    const initChart = () => {
      instance = echarts.init(stock_ref.value as HTMLElement, "chalk");
      const initOption = reactive<EChartsOption>({
        title: {
          text: "▍库存和销量分析",
          top: 20,
          left: 20,
        },
      });
      instance.setOption(initOption);
    };
    const getData = async (url: string) => {
      allData = await TestService.request(url);
      totalPage.value = Math.ceil(allData.length / pageSize.value);
      updateChart();
      tid.value = startInterval();
    };
    const startInterval = () => {
      if (tid.value) clearInterval(tid.value);
      return window.setInterval(() => {
        currentPage.value++;
        if (currentPage.value > totalPage.value) {
          currentPage.value = 0;
        }
        updateChart();
      }, 3000);
    };
    const updateChart = () => {
      const centerArr = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const showData = allData.slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
      );
      const colorArr = [
        ["#4ff778", "#0ba82c"],
        ["#e5dd45", "#e8b11c"],
        ["#e8821c", "#e55445"],
        ["#5052ee", "#ab6ee5"],
        ["#23e5e5", "#2e72bf"],
      ];
      const seriesArr = showData.map(
        ({ name, sales, stock }: any, index: number) =>
          <SeriesOption>{
            type: "pie",
            center: centerArr[index],
            label: {
              position: "center",
              color: colorArr[index][0],
            },
            data: [
              {
                name: name + "\n" + sales,
                value: stock,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                    { offset: 0, color: colorArr[index][0] },
                    { offset: 1, color: colorArr[index][1] },
                  ]),
                },
              },
              {
                value: sales,
                itemStyle: {
                  color: "#333843",
                },
              },
            ],
            hoverAnimation: false,
            labelLine: {
              show: false,
            },
          }
      );
      const dataOption = reactive<EChartsOption>({
        series: seriesArr,
      });
      instance.setOption(dataOption);
    };
    const screenAdapter = () => {
      titleFontSize.value = (stock_ref.value!.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize.value * 2.6;
      const outterRadius = innerRadius * 1.125;
      const adapterOption = reactive<EChartsOption>({
        title: {
          textStyle: {
            fontSize: titleFontSize.value,
          },
        },
        series: [
          {
            type: "pie",
            label: {
              fontSize: titleFontSize.value,
            },
            radius: [outterRadius, innerRadius],
          },
          {
            type: "pie",
            label: {
              fontSize: titleFontSize.value,
            },
            radius: [outterRadius, innerRadius],
          },
          {
            type: "pie",
            label: {
              fontSize: titleFontSize.value,
            },
            radius: [outterRadius, innerRadius],
          },
          {
            type: "pie",
            label: {
              fontSize: titleFontSize.value,
            },
            radius: [outterRadius, innerRadius],
          },
          {
            type: "pie",
            label: {
              fontSize: titleFontSize.value,
            },
            radius: [outterRadius, innerRadius],
          },
        ],
      });
      instance.setOption(adapterOption);
      instance.resize();
    };
    
    expose({
      screenAdapter
    })
    onMounted(() => {
      initChart();
      getData("/api/stock");
      screenAdapter();
      window.addEventListener("resize", screenAdapter);
      instance.on("mouseover", () => {
        clearInterval(tid.value);
      });
      instance.on("mouseout", () => {
        tid.value = startInterval();
      });
    });
    onUnmounted(() => {
      window.removeEventListener("resize", screenAdapter);
      clearInterval(tid.value);
    });
    return {
      stock_ref,
    };
  },
});
</script>
<style scoped>
</style>