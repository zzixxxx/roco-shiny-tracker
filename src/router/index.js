import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/counter',
    name: 'counter',
    component: () => import('../views/CounterPage.vue'),
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import('../views/CollectionPage.vue'),
  },
  {
    path: '/log',
    name: 'log',
    component: () => import('../views/LogPage.vue'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/StatsPage.vue'),
  },
  {
    path: '/egg',
    name: 'egg',
    component: () => import('../views/EggToolsPage.vue'),
  },
  // 旧路由兼容：自动重定向到合并后的 /egg + 对应 tab
  { path: '/hatch-time', redirect: { path: '/egg', query: { tab: 'hatch' } } },
  { path: '/breeding',   redirect: { path: '/egg', query: { tab: 'group' } } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
