<template>
  <div class="com-container">
    <div class="title" @click="show = !show" :style="comStyle">
      <span>▍{{ currentType }}</span>
      <span class="iconfont icon-arrow-down" :style="comStyle"></span>
      <div class="select-con" v-show="show">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="select(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  toRaw,
  watchEffect,
} from "vue";
import "@/echarts_theme/chalk.js";
import * as echarts from "echarts";
import { ECharts, EChartsOption, EChartsType, SeriesOption } from "echarts";
import { TestService } from "@/api/Map";
import { HttpResponse } from "@/types";
export default defineComponent({
  name: "",
  setup(props, { expose }) {
    const trend_ref = ref<HTMLElement>();
    let instance = reactive({});
    const type = ref<any[]>([]);
    const currentType = ref();
    const show = ref(false);
    const keySet = ref<any[]>([]);
    const tid = ref(1);
    const current = ref<number>(1);
    const titleFontSize = ref(0);
    let serie = reactive<SeriesOption[]>([]);
    const length = ref(0);
    const selectTypes = computed(() => {
      if (type.value.length != 0) {
        return type.value.filter((item: any) => {
          return item.text != currentType.value;
        });
      } else return [];
    });
    const comStyle = computed(() => {
      return {
        fontSize: titleFontSize.value + "px",
      };
    });
    const select = (param: string) => {
      const { key, text } = type.value.find((item: any) => item.key == param);
      currentType.value = text;
      updateChart(key);
    };

    let allData = reactive<HttpResponse | object>({});

    const initChart = () => {
      if (!trend_ref.value) return;
      const initOption = reactive<EChartsOption>({
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
        },
        tooltip: {
          trigger: "axis",
          triggerOn: "mousemove|click",
        },
        legend: {
          left: 20,
          top: "15%",
          icon: "circle",
        },
        grid: {
          left: "3%",
          top: "35%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
      });
      instance = echarts.init(trend_ref.value, "chalk");
      (instance as EChartsType).setOption(initOption);
    };

    const getData = async (url: string) => {
      allData = await TestService.request(url);
      keySet.value = (allData as any).type.map(({ key }: any) => key);
      type.value = (allData as any).type;
      currentType.value = type.value[0].text;
      tid.value = startInterval();
      updateChart();
    };

    const startInterval = () => {
      return window.setInterval(() => {
        if (current.value >= type.value.length) current.value = 0;
        select(keySet.value[current.value++]);
      }, 3000);
    };

    const updateChart = (key: string = "map") => {
      const colorArr1 = [
        "rgba(11,168,44,0.5)",
        "rgba(44,110,255,0.5)",
        "rgba(22,242,217,0.5)",
        "rgba(254,33,30,0.5)",
        "rgba(250,105,0,0.5)",
      ];
      const colorArr2 = [
        "rgba(11,168,44,0)",
        "rgba(44,110,255,0)",
        "rgba(22,242,217,0)",
        "rgba(254,33,30,0)",
        "rgba(250,105,0,0)",
      ];

      //类目轴数据
      const timeArr = (allData as any).common.month;
      //y轴数据
      const valueArr = (allData as any)[key].data;

      serie = valueArr.map(
        ({ name, data }: any, index: number) =>
          <EChartsOption>{
            type: "line",
            name,
            data,
            stack: "map",
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: colorArr1[index],
                },
                {
                  offset: 1,
                  color: colorArr2[index],
                },
              ]),
            },
            symbolSize: titleFontSize.value / 3,
          }
      );

      const legend = valueArr.map(({ name }: any) => name);

      const dataOption = reactive<EChartsOption>({
        xAxis: {
          data: timeArr,
        },
        series: serie,
        legend: {
          data: legend,
        },
      });

      (instance as EChartsType).setOption(dataOption);
    };

    const screenAdapter = () => {
      if (!trend_ref.value) return;
      titleFontSize.value = (trend_ref.value.offsetWidth / 100) * 3.6;
      const size = new Array(serie.length).fill(
        { symbolSize: titleFontSize.value / 3 },
        0
      );

      const adapterOption = reactive<EChartsOption>({
        legend: {
          itemWidth: titleFontSize.value,
          itemHeight: titleFontSize.value,
          itemGap: titleFontSize.value,
          textStyle: {
            fontSize: titleFontSize.value / 2,
          },
        },
        series: size,
      });
      (instance as EChartsType).setOption(adapterOption);
      (instance as EChartsType).resize();
    };

    // 优先使用计算属性
    // watchEffect(() => {
    //   selectTypes.value = type.value.filter(
    //     (item: any) => item.text != currentType.value
    //   );
    // });

    expose({
      screenAdapter,
    });
    onMounted(() => {
      initChart();
      getData("/api/trend");
      window.addEventListener("resize", screenAdapter);
      screenAdapter();
      (instance as EChartsType).on("mouseover", () => {
        clearInterval(tid.value);
      });
      (instance as EChartsType).on("mouseout", () => {
        tid.value = startInterval();
      });
    });
    onUnmounted(() => {
      window.removeEventListener("resize", screenAdapter);
      clearInterval(tid.value);
    });
    return {
      trend_ref,
      select,
      type,
      currentType,
      show,
      selectTypes,
      comStyle,
    };
  },
});
</script>
<style lang="scss" scoped>
.com-container {
  position: relative;
  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
    color: #fff;
    .select-con {
      background-color: #fff;
      color: #000;
      border-radius: 10px;
      .select-item {
        border-bottom: 1px solid #000;
        &:last-child {
          border-bottom: none;
        }
      }
    }
    span,
    div {
      cursor: pointer;
    }
  }
}
</style>