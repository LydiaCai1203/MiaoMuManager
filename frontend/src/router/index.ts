import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '../layouts/BasicLayout.vue'
import LoginView from '../views/login/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import ProjectListView from '../views/project/ProjectListView.vue'
import ProjectPartyListView from '../views/project/ProjectPartyListView.vue'
import ProjectDetailView from '../views/project/ProjectDetailView.vue'
import SeedlingListView from '../views/seedling/SeedlingListView.vue'
import AppendageListView from '../views/appendage/AppendageListView.vue'
import HouseListView from '../views/house/HouseListView.vue'
import PriceListView from '../views/price/PriceListView.vue'
import ImportCenterView from '../views/import/ImportCenterView.vue'
import OptionConfigView from '../views/system/OptionConfigView.vue'
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
        { path: 'dashboard', component: DashboardView, meta: { section: '工作台', title: '首页' } },
        { path: 'projects', component: ProjectListView, meta: { section: '项目管理', title: '项目列表' } },
        { path: 'projects/:id', component: ProjectDetailView, meta: { section: '项目管理', title: '项目详情' } },
        { path: 'projects/parties', component: ProjectPartyListView, meta: { section: '项目管理', title: '评估对象' } },
        { path: 'seedling', component: SeedlingListView, meta: { section: '评估业务', title: '苗木评估' } },
        { path: 'appendage', component: AppendageListView, meta: { section: '评估业务', title: '附属物评估' } },
        { path: 'house', component: HouseListView, meta: { section: '评估业务', title: '房屋评估' } },
        { path: 'prices', component: PriceListView, meta: { section: '基础数据', title: '价格库' } },
        { path: 'import', component: ImportCenterView, meta: { section: '基础数据', title: '导入中心' } },
        { path: 'system/options', component: OptionConfigView, meta: { section: '系统管理', title: '下拉配置' } },
        { path: 'system/users', component: UserListView, meta: { section: '系统管理', title: '用户管理' } },
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
