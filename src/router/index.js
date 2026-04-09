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
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
