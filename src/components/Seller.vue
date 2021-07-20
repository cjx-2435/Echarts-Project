<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import { TestService } from "@/api/Map";
import * as echarts from "echarts";
import "@/echarts_theme/chalk.js";
import { HttpResponse } from "@/types";
import { ECharts, EChartsOption, EChartsType } from "echarts";
export default defineComponent({
  name: "seller",
  setup(props,{expose}) {
    /**************属性定义*****************/
    //接收dom元素
    const seller_ref = ref();
    //当前页
    const currentPage = ref(1);
    //条目数 每页5条
    const pageSize = ref(5);
    //总页数
    const totalPage = ref(0);
    //定时器id
    const intervalId = ref();
    //初始化配置
    const initOption = reactive<echarts.EChartsOption>({
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "category",
      },
      title: {
        text: "▍商家销售统计",
        left: "4%",
        top: "4%",
      },
      grid: {
        top: "15%",
        left: "3%",
        right: "6%",
        bottom: "3%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            type: "solid",
            color: "#535c68",
          },
          z: 1,
        },
        triggerOn: "mousemove|click",
      },
      series: [
        {
          type: "bar",
          label: {
            show: true,
            position: "right",
            color: "#fff",
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#4834d4" },
              { offset: 1, color: "#e056fd" },
            ]),
          },
        },
      ],
    });
    //接收echarts实例对象
    let instance = reactive({});
    //接收请求数据
    let allData = reactive<HttpResponse | any[]>([]);
    /**************方法定义*****************/
    //初始化图表
    const initChart = (dom: HTMLElement) => echarts.init(dom, "chalk");
    //请求数据
    const getData = async (url: string) => {
      allData = await TestService.request(url);
      (allData as any).sort((a: any, b: any) => a.value - b.value);
      //计算总页数
      //@ts-ignore
      totalPage.value = Math.ceil(allData.length / pageSize.value);
      updateChart();
      intervalId.value = startInterval();
    };
    //更新数据
    const updateChart = () => {
      let data = (allData as any[]).slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
      );
      const nameData = data.map((item: any) => item.name);
      const valueData = data.map((item: any) => item.value);

      const option = reactive<echarts.EChartsOption>({
        yAxis: {
          data: nameData,
        },
        series: [
          {
            data: valueData,
          },
        ],
      });
      (instance as echarts.EChartsType).setOption(option);
    };

    //开始循环
    const startInterval = () => {
      return setInterval(() => {
        ++currentPage.value == totalPage.value + 1
          ? (currentPage.value = 1)
          : "";
        updateChart();
      }, 3000);
    };

    //屏幕适配
    const screenAdapter = () => {
      const titleFontSize = (seller_ref.value.offsetWidth / 100) * 3.6;
      const adapterOption = reactive<echarts.EChartsOption>({
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      });
      (instance as echarts.ECharts).setOption(adapterOption);
      (instance as echarts.ECharts).resize();
    };

    expose({
      screenAdapter
    })
    onMounted(() => {
      //初始化图表
      instance = initChart(seller_ref.value);
      
      (instance as EChartsType).setOption(initOption);
      //鼠标移入取消定时器
      (instance as EChartsType).on("mouseover", () => {
        clearInterval(intervalId.value);
      });
      
      (instance as EChartsType).on("mouseout", () => {
        intervalId.value = startInterval();
      });
      //获取数据
      getData("/api/seller");
      screenAdapter();
      window.onresize = ({ currentTarget }: any) => {
        screenAdapter();
      };
    });
    onUnmounted(() => {
      console.log("Seller组件销毁");
      clearInterval(intervalId.value);
      window.removeEventListener("resize", screenAdapter);
    });
    return {
      seller_ref,
    };
  },
});
</script>
<style scoped>
</style>