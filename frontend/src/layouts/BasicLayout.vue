<template>
  <div class="layout-shell">
    <aside class="sidebar">
      <div class="brand">资产评估系统</div>
      <nav class="nav-list">
        <RouterLink to="/dashboard">首页</RouterLink>
        <RouterLink to="/projects">项目管理</RouterLink>
        <RouterLink to="/seedling">苗木评估</RouterLink>
        <RouterLink to="/appendage">附属物评估</RouterLink>
        <RouterLink to="/house">房屋评估</RouterLink>
        <RouterLink to="/prices">价格库</RouterLink>
        <RouterLink to="/import">导入中心</RouterLink>
        <RouterLink to="/system/users">用户管理</RouterLink>
      </nav>
    </aside>
    <main class="content-shell">
      <header class="topbar">
        <div>前后端分离骨架</div>
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
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.clearAuth()
  router.push('/login')
}
</script>
