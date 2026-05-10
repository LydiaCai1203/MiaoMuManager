import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '../layouts/BasicLayout.vue'
import LoginView from '../views/login/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ProjectListView from '../views/project/ProjectListView.vue'
import SeedlingListView from '../views/seedling/SeedlingListView.vue'
import AppendageListView from '../views/appendage/AppendageListView.vue'
import HouseListView from '../views/house/HouseListView.vue'
import PriceListView from '../views/price/PriceListView.vue'
import ImportCenterView from '../views/import/ImportCenterView.vue'
import UserListView from '../views/system/UserListView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/',
      component: BasicLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: DashboardView },
        { path: 'projects', component: ProjectListView },
        { path: 'seedling', component: SeedlingListView },
        { path: 'appendage', component: AppendageListView },
        { path: 'house', component: HouseListView },
        { path: 'prices', component: PriceListView },
        { path: 'import', component: ImportCenterView },
        { path: 'system/users', component: UserListView },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.path === '/login') {
    return true
  }
  if (!authStore.isLoggedIn) {
    return '/login'
  }
  return true
})

export default router
