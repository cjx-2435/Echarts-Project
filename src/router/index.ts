import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ScreenPage from '../views/ScreenPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: 'screen'
  },
  {
    path:'/screen',
    name:'screen',
    component:ScreenPage
  },
  {
    path: '/sellerPage',
    name: 'SellerPage',
    component: () => import('@/views/SellerPage.vue')
  },
  {
    path: '/trendPage',
    name: 'TrendPage',
    component: () => import('@/views/TrendPage.vue')
  },
  {
    path: '/mapPage',
    name: 'MapPage',
    component: () => import('@/views/MapPage.vue')
  },
  {
    path: '/rankPage',
    name: 'RankPage',
    component: () => import('@/views/RankPage.vue')
  },
  {
    path: '/hotPage',
    name: 'HotPage',
    component: () => import('@/views/HotPage.vue')
  },
  {
    path: '/stockPage',
    name: 'StockPage',
    component: () => import('@/views/StockPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
