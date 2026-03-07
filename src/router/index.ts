import { createRouter, createWebHistory } from '@ionic/vue-router'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

import Tabs from '../views/Tabs.vue'
import Plants from '../views/Plants.vue'
import AddPlant from '../views/AddPlant.vue'
import Profile from '../views/Profile.vue'

const routes = [

  {
    path: '/',
    component: Login
  },

  {
    path: '/register',
    component: Register
  },

  // Tabs Layout
  {
    path: '/tabs/',
    component: Tabs,
    children: [

      {
        path: 'home',
        component: Plants
      },

      {
        path: 'add',
        component: AddPlant
      },
      {
        path: 'plants',
        component: () => import('../views/MyPlants.vue')
      },

      {
        path: 'profile',
        component: Profile
      },

      {
        path: '',
        redirect: '/tabs/home'
      }

    ]
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router