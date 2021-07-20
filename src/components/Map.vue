<template>
  <div class="com-container">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script lang='ts'>
import axios from "axios";
import { defineComponent, getCurrentInstance,onMounted, onUnmounted, reactive, ref } from "vue";
import { TestService } from "@/api/Map";
import "@/echarts_theme/chalk.js";
import * as echarts from "echarts";
import { EChartsOption, EChartsType, SeriesOption } from "echarts";
//@ts-ignore
import { getProvinceMapInfo } from "@/utils/map_utils.js";
export default defineComponent({
  name: "",
  setup(props,{expose}) {
    const map_ref = ref<HTMLElement>();
    const instance = ref<EChartsType>();
    const allData = ref();
    const titleFontSize = ref(0);
    let mapData = reactive({});

    const initChart = async () => {
      instance.value = echarts.init(map_ref.value as HTMLElement, "chalk");
      const { data } = await axios.get(
        "http://localhost:8080/static/china.json"
      );
      echarts.registerMap("china", data);
      const initOption = reactive<EChartsOption>({
        title: {
          text: "▍商家分布",
          left: 20,
          top: 20,
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#2e72bf",
            borderColor: "#333",
          },
        },
      });
      instance.value.setOption(initOption);
      //@ts-ignore
      instance.value.on("click", async ({ name }: any) => {
        const { key, path } = getProvinceMapInfo(name);
        if (!key) return;
        //@ts-ignore
        if (!mapData[key]) {
          const { data } = await axios.get("http://localhost:8080" + path);
          //@ts-ignore
          mapData[key] = data;
          echarts.registerMap(key, data);
        }

        instance.value?.setOption({
          geo: {
            map: key,
          },
        });
      });
    };
    const getData = async (url: string) => {
      allData.value = await TestService.request(url);
      updateChart();
    };
    const updateChart = () => {
      const seriesArr = allData.value.map(
        ({ name, children }: any) =>
          <SeriesOption>{
            //如果需要在地图中显示散点数据，需要多配置一项coordinateSystem:'geo'
            type: "effectScatter",
            name: name,
            data: children,
            coordinateSystem: "geo",
            rippleEffect: {
              scale: 5,
              brushType: "stroke",
            },
          }
      );
      const legendArr = allData.value.map(({ name }: any) => name);

      const dataOption = reactive<EChartsOption>({
        series: seriesArr,
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "vertical",
          data: legendArr,
        },
      });
      (instance.value as EChartsType).setOption(dataOption);
    };
    const screenAdapter = () => {
      titleFontSize.value =
        ((map_ref.value as HTMLElement).offsetWidth / 100) * 3.6;
      const adapterOption = reactive<EChartsOption>({
        title: {
          textStyle: {
            fontSize: titleFontSize.value,
          },
        },
        legend: {
          itemWidth: titleFontSize.value / 2,
          itemHeight: titleFontSize.value / 2,
          itemGap: titleFontSize.value / 2,
          textStyle: {
            fontSize: titleFontSize.value / 2,
          },
        },
      });
      (instance.value as EChartsType).setOption(adapterOption);
      (instance.value as EChartsType).resize();
    };
    expose({
      screenAdapter
    })

    onMounted(() => {
      initChart();
      getData("/api/map");
      screenAdapter();
      map_ref.value?.addEventListener("dblclick", () => {
        instance.value?.setOption({
          geo: {
            map: "china",
          },
        });
      });
      window.addEventListener("resize", screenAdapter);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", screenAdapter);
    });

    return {
      map_ref,
    };
  },
});
</script>
<style scoped>
</style>