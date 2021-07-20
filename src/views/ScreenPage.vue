<template>
  <div
    class="screen-container"
    :style="
      theme.mode == 'dark'
        ? { color: '#fff', backgroundColor: '#161522' }
        : { color: '#161522', backgroundColor: '#fff' }
    "
  >
    <header class="screen-header">
      <div>
        <img :src="theme.border" alt="" />
      </div>
      <span class="logo">
        <img :src="theme.logo" alt="" />
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="theme.qiehuan" @click="themeChange" class="qiehuan" alt="" />
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="fullScreenStatus.trend ? 'fullscreen' : ''">
          <Trend ref="trend"></Trend>
          <div class="resize" @click="Change('trend')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.trend
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="left-bottom"
          :class="fullScreenStatus.seller ? 'fullscreen' : ''"
        >
          <Seller ref="seller"></Seller>
          <div class="resize" @click="Change('seller')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.seller
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="fullScreenStatus.map ? 'fullscreen' : ''">
          <Map ref="map"></Map>
          <div class="resize" @click="Change('map')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="middle-bottom"
          :class="fullScreenStatus.rank ? 'fullscreen' : ''"
        >
          <Rank ref="rank"></Rank>
          <div class="resize" @click="Change('rank')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="fullScreenStatus.hot ? 'fullscreen' : ''">
          <Hot ref="hot"></Hot>
          <div class="resize" @click="Change('hot')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="right-bottom"
          :class="fullScreenStatus.stock ? 'fullscreen' : ''"
        >
          <Stock ref="stock"></Stock>
          <div class="resize" @click="Change('stock')">
            <span
              :class="[
                'iconfont',
                fullScreenStatus.stock
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang='ts'>
import {
  defineComponent,
  defineAsyncComponent,
  reactive,
  ref,
  onMounted,
  nextTick,
  getCurrentInstance,
  onUnmounted,
} from "vue";
const Hot = defineAsyncComponent(() => import("@/components/Hot.vue"));
const Map = defineAsyncComponent(() => import("@/components/Map.vue"));
const Seller = defineAsyncComponent(() => import("@/components/Seller.vue"));
const Stock = defineAsyncComponent(() => import("@/components/Stock.vue"));
const Trend = defineAsyncComponent(() => import("@/components/Trend.vue"));
const Rank = defineAsyncComponent(() => import("@/components/Ranks.vue"));
export default defineComponent({
  components: {
    Stock,
    Hot,
    Map,
    Seller,
    Trend,
    Rank,
  },
  name: "",
  setup() {
    const fullScreenStatus = reactive<any>({
      trend: false,
      stock: false,
      hot: false,
      map: false,
      rank: false,
      seller: false,
    });
    const trend = ref();
    const stock = ref();
    const hot = ref();
    const map = ref();
    const rank = ref();
    const seller = ref();
    const theme = reactive({
      mode: "dark",
      logo: `/static/image/logo_dark.png`,
      border: `/static/image/header_border_dark.png`,
      qiehuan: `/static/image/qiehuan_dark.png`,
    });
    const themeChange = () => {
      ws.send({
        action: "themeChange",
        socketType: "themeChange",
        chartName: "",
        value: theme.mode == "dark" ? "light" : "dark",
      });
    };
    const {
      proxy: { $socket: ws },
    }: any = getCurrentInstance();

    const recvData = (data: any) => {
      const chartName = data.chartName;
      const targetValue = data.value;
      fullScreenStatus[chartName] = targetValue;
      nextTick(() => {
        eval(`${chartName}.value.screenAdapter()`);
      });
    };
    const themeData = (data: any) => {
      theme.mode = data.value;
      if (theme.mode == "dark") {
        theme.mode = "dark";
        theme.logo = `/static/image/logo_dark.png`;
        theme.border = `/static/image/header_border_dark.png`;
        theme.qiehuan = `/static/image/qiehuan_dark.png`;
      } else {
        theme.mode = "light";
        theme.logo = `/static/image/logo_light.png`;
        theme.border = `/static/image/header_border_light.png`;
        theme.qiehuan = `/static/image/qiehuan_light.png`;
      }
    };
    ws.registerCallBack("fullScreen", recvData);
    ws.registerCallBack("themeChange", themeData);

    const Change = (key: string) => {
      //   fullScreenStatus[key] = !fullScreenStatus[key];
      //   nextTick(() => {
      //     eval(`${key}.value.screenAdapter()`);
      //   });
      const targetValue = !fullScreenStatus[key];
      ws.send({
        action: "fullScreen",
        socketType: "fullScreen",
        chartName: key,
        value: targetValue,
      });
    };
    onMounted(() => {});
    onUnmounted(() => {
      ws.unRegisterCallBack("fullScreen");
      ws.unRegisterCallBack("themeChange");
    });
    return {
      fullScreenStatus,
      Change,
      trend,
      stock,
      hot,
      map,
      rank,
      seller,
      theme,
      themeChange,
    };
  },
});
</script>
<style lang='scss' scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>