<template>
  <div class="layout-shell">
    <aside class="sidebar">
      <div class="brand">资产评估系统</div>
      <nav class="nav-list">
        <div class="nav-group">
          <div class="nav-group-title">工作台</div>
          <RouterLink to="/dashboard">首页</RouterLink>
        </div>
        <div class="nav-group">
          <div class="nav-group-title">项目管理</div>
          <RouterLink to="/projects">项目列表</RouterLink>
          <RouterLink to="/projects/parties">评估对象</RouterLink>
        </div>
        <div class="nav-group">
          <div class="nav-group-title">评估业务</div>
          <RouterLink to="/seedling">苗木评估</RouterLink>
          <RouterLink to="/appendage">附属物评估</RouterLink>
          <RouterLink to="/house">房屋评估</RouterLink>
        </div>
        <div class="nav-group">
          <div class="nav-group-title">基础数据</div>
          <RouterLink to="/prices">价格库</RouterLink>
          <RouterLink to="/import">导入中心</RouterLink>
        </div>
        <div class="nav-group">
          <div class="nav-group-title">系统管理</div>
          <RouterLink to="/system/options">下拉配置</RouterLink>
          <RouterLink to="/system/users">用户管理</RouterLink>
        </div>
      </nav>
    </aside>
    <main class="content-shell">
      <header class="topbar">
        <div class="topbar-title-group">
          <div class="topbar-section">{{ currentSection }}</div>
          <div class="topbar-title">{{ currentTitle }}</div>
        </div>
        <div class="topbar-user">
          <span>{{ authStore.user?.realName ?? '未登录' }}</span>
          <button class="link-button" @click="logout">退出</button>
        </div>
      </header>
      <section class="page-shell">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentSection = computed(() => String(route.meta.section ?? '资产评估系统'))
const currentTitle = computed(() => String(route.meta.title ?? '页面'))

function logout() {
  authStore.clearAuth()
  router.push('/login')
}
</script>

<style scoped>
.nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-group-title {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.68);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.nav-group :deep(a) {
  margin-left: 0.75rem;
}

.topbar-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topbar-section {
  font-size: 0.8rem;
  color: #667085;
}

.topbar-title {
  font-size: 1.1rem;
  font-weight: 700;
}
</style>
