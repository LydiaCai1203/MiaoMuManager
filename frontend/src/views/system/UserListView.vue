<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header">
        <h2>{{ editingId ? '编辑用户' : '新增用户' }}</h2>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="启用" value="ENABLED" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="section-actions">
        <el-button type="primary" @click="submitUser">{{ editingId ? '保存用户' : '创建用户' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>用户列表</h2>
        <div class="section-actions">
          <el-input v-model="keyword" placeholder="搜索用户名/姓名/手机号" clearable style="width: 240px" />
          <el-button text @click="loadUsers">刷新</el-button>
        </div>
      </div>
      <el-table :data="filteredUsers">
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="realName" label="姓名" min-width="140" />
        <el-table-column prop="phone" label="手机号" min-width="160" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button text @click="fillUser(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createUser, deleteUser, getUsers, updateUser, type UserRecord } from '../../api/auth'

const users = ref<UserRecord[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const formRef = ref<FormInstance>()

const defaultForm = () => ({
  username: 'user_demo',
  realName: '测试用户',
  phone: '13900000000',
  status: 'ENABLED',
})

const form = reactive(defaultForm())

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入 11 位手机号', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const filteredUsers = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  if (!normalized) {
    return users.value
  }
  return users.value.filter((item) => {
    return [item.username, item.realName, item.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  formRef.value?.clearValidate()
}

async function loadUsers() {
  const response = await getUsers()
  users.value = response.data
}

async function submitUser() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  if (editingId.value) {
    await updateUser(editingId.value, form)
    ElMessage.success('用户已更新')
  } else {
    await createUser(form)
    ElMessage.success('用户已创建')
  }
  resetForm()
  await loadUsers()
}

function fillUser(record: UserRecord) {
  editingId.value = record.id
  form.username = record.username
  form.realName = record.realName
  form.phone = record.phone ?? ''
  form.status = record.status
}

async function removeUser(id: number) {
  await ElMessageBox.confirm('删除后该用户将无法继续在系统中使用。', '确认删除用户', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteUser(id)
  ElMessage.success('用户已删除')
  await loadUsers()
}

onMounted(() => {
  loadUsers().catch(() => {
    ElMessage.error('用户列表加载失败')
  })
})
</script>
