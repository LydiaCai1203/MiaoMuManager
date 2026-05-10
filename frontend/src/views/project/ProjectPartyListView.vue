<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header list-header-main">
        <h2>评估对象列表</h2>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新建对象</el-button>
        </div>
      </div>
      <div class="list-toolbar">
        <div class="list-filters">
          <el-select v-model="projectFilter" clearable placeholder="按项目筛选" style="width: 220px">
            <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索对象名称/村组/租户/位置" clearable style="width: 280px" />
        </div>
        <el-button text @click="loadProjects">刷新</el-button>
      </div>
      <el-table :data="filteredParties" row-key="id">
        <el-table-column prop="projectName" label="所属项目" min-width="180" />
        <el-table-column prop="partyName" label="对象名称" min-width="160" />
        <el-table-column label="对象类型" width="120">
          <template #default="scope">
            {{ getPartyTypeLabel(scope.row.partyType) }}
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" min-width="140" />
        <el-table-column prop="villageGroup" label="村组" min-width="120" />
        <el-table-column prop="tenantName" label="租户名称" min-width="140" />
        <el-table-column prop="locationText" label="位置" min-width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button text @click="fillParty(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeParty(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingPartyId ? '编辑评估对象' : '新增评估对象'" width="760px" destroy-on-close>
      <el-form ref="partyFormRef" :model="partyForm" :rules="partyRules" label-position="top" class="grid-form">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="partyForm.projectId" filterable>
            <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象类型" prop="partyType">
          <el-select v-model="partyForm.partyType">
            <el-option v-for="item in partyTypeOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象名称" prop="partyName">
          <el-input v-model="partyForm.partyName" />
        </el-form-item>
        <el-form-item label="证件号码">
          <el-input v-model="partyForm.idNo" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="partyForm.contactPhone" />
        </el-form-item>
        <el-form-item label="村组">
          <el-input v-model="partyForm.villageGroup" />
        </el-form-item>
        <el-form-item label="租户名称">
          <el-input v-model="partyForm.tenantName" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="partyForm.locationText" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button @click="resetPartyForm">重置</el-button>
          <el-button type="primary" @click="submitParty">{{ editingPartyId ? '保存对象' : '新增对象' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOptions, type OptionItemRecord } from '../../api/options'
import {
  createProjectParty,
  deleteProjectParty,
  getProjects,
  updateProjectParty,
  type ProjectParty,
  type ProjectRecord,
} from '../../api/project'

interface ProjectPartyListItem extends ProjectParty {
  projectName: string
  projectStatus: string
}

const projects = ref<ProjectRecord[]>([])
const parties = ref<ProjectPartyListItem[]>([])
const editingPartyId = ref<number | null>(null)
const keyword = ref('')
const projectFilter = ref<number | null>(null)
const partyFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const partyTypeOptions = ref<OptionItemRecord[]>([])

const defaultPartyForm = () => ({
  projectId: 1,
  partyType: 'PERSON',
  partyName: '新增对象',
  idNo: '',
  contactPhone: '',
  villageGroup: '',
  locationText: '',
  tenantName: '',
  remark: '',
})

const partyForm = reactive(defaultPartyForm())

const partyRules: FormRules = {
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  partyType: [{ required: true, message: '请选择对象类型', trigger: 'change' }],
  partyName: [{ required: true, message: '请输入对象名称', trigger: 'blur' }],
}

function getPartyTypeLabel(value: string) {
  return partyTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

const filteredParties = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  return parties.value.filter((item) => {
    const matchesProject = projectFilter.value == null || item.projectId === projectFilter.value
    if (!matchesProject) {
      return false
    }
    if (!normalized) {
      return true
    }
    return [item.projectName, item.partyName, item.villageGroup, item.tenantName, item.locationText]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

function flattenParties(projectList: ProjectRecord[]) {
  parties.value = projectList.flatMap((project) => project.parties.map((party) => ({
    ...party,
    projectName: project.projectName,
    projectStatus: project.status,
  })))
}

function resetPartyForm() {
  editingPartyId.value = null
  Object.assign(partyForm, defaultPartyForm())
  if (projects.value.length > 0) {
    partyForm.projectId = projects.value[0].id
  }
  partyFormRef.value?.clearValidate()
}

function openCreateDialog() {
  resetPartyForm()
  dialogVisible.value = true
}

function handleDialogClose() {
  dialogVisible.value = false
  resetPartyForm()
}

async function loadProjects() {
  const response = await getProjects()
  projects.value = response.data
  flattenParties(projects.value)
  if (projects.value.length > 0 && !projects.value.some((item) => item.id === partyForm.projectId)) {
    partyForm.projectId = projects.value[0].id
  }
}

async function loadPartyTypeOptions() {
  const response = await getOptions('PARTY_TYPE')
  partyTypeOptions.value = response.data
}

async function submitParty() {
  const valid = await partyFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  const payload = {
    partyType: partyForm.partyType,
    partyName: partyForm.partyName,
    idNo: partyForm.idNo,
    contactPhone: partyForm.contactPhone,
    villageGroup: partyForm.villageGroup,
    tenantName: partyForm.tenantName,
    locationText: partyForm.locationText,
    remark: partyForm.remark,
  }
  if (editingPartyId.value) {
    await updateProjectParty(partyForm.projectId, editingPartyId.value, payload)
    ElMessage.success('评估对象已更新')
  } else {
    await createProjectParty(partyForm.projectId, payload)
    ElMessage.success('评估对象已新增')
  }
  dialogVisible.value = false
  await loadProjects()
  resetPartyForm()
}

function fillParty(record: ProjectPartyListItem) {
  dialogVisible.value = true
  editingPartyId.value = record.id
  partyForm.projectId = record.projectId
  partyForm.partyType = record.partyType
  partyForm.partyName = record.partyName
  partyForm.idNo = record.idNo ?? ''
  partyForm.contactPhone = record.contactPhone ?? ''
  partyForm.villageGroup = record.villageGroup ?? ''
  partyForm.tenantName = record.tenantName ?? ''
  partyForm.locationText = record.locationText ?? ''
  partyForm.remark = record.remark ?? ''
}

async function removeParty(record: ProjectPartyListItem) {
  await ElMessageBox.confirm('删除后该评估对象将从当前列表移除。', '确认删除评估对象', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteProjectParty(record.projectId, record.id)
  ElMessage.success('评估对象已删除')
  await loadProjects()
}

onMounted(() => {
  Promise.all([loadProjects(), loadPartyTypeOptions()]).catch(() => {
    ElMessage.error('评估对象页面初始化失败')
  })
})
</script>
