<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header">
        <h2>{{ editingProjectId ? '编辑项目' : '新建项目' }}</h2>
      </div>
      <el-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-position="top" class="grid-form">
        <el-form-item label="项目编号" prop="projectCode">
          <el-input v-model="projectForm.projectCode" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="projectForm.projectName" />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-input v-model="projectForm.projectType" />
        </el-form-item>
        <el-form-item label="委托方" prop="entrustingParty">
          <el-input v-model="projectForm.entrustingParty" />
        </el-form-item>
        <el-form-item label="所属区域" prop="regionName">
          <el-input v-model="projectForm.regionName" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="projectForm.status">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="进行中" value="ACTIVE" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="section-actions">
        <el-button type="primary" @click="submitProject">{{ editingProjectId ? '保存项目' : '创建项目' }}</el-button>
        <el-button @click="resetProjectForm">重置</el-button>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>项目列表</h2>
        <div class="section-actions">
          <el-input v-model="projectKeyword" placeholder="搜索项目编号/名称" clearable style="width: 240px" />
          <el-button text @click="loadProjects">刷新</el-button>
        </div>
      </div>
      <el-table :data="filteredProjects" row-key="id">
        <el-table-column prop="projectCode" label="项目编号" min-width="160" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column prop="projectType" label="项目类型" min-width="140" />
        <el-table-column prop="regionName" label="区域" min-width="140" />
        <el-table-column prop="status" label="状态" min-width="120" />
        <el-table-column label="对象数" min-width="100">
          <template #default="scope">
            {{ scope.row.parties.length }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button text @click="fillProject(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeProject(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>新增被评估对象</h2>
      </div>
      <el-form ref="partyFormRef" :model="partyForm" :rules="partyRules" label-position="top" class="grid-form">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="partyForm.projectId">
            <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象类型" prop="partyType">
          <el-select v-model="partyForm.partyType">
            <el-option label="个人" value="PERSON" />
            <el-option label="单位" value="ORGANIZATION" />
            <el-option label="租户" value="TENANT" />
            <el-option label="村组" value="VILLAGE_GROUP" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="对象名称" prop="partyName">
          <el-input v-model="partyForm.partyName" />
        </el-form-item>
        <el-form-item label="村组">
          <el-input v-model="partyForm.villageGroup" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="partyForm.locationText" />
        </el-form-item>
        <el-form-item label="租户名称">
          <el-input v-model="partyForm.tenantName" />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="submitParty">新增对象</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createProject, createProjectParty, deleteProject, getProjects, updateProject, type ProjectRecord } from '../../api/project'

const projects = ref<ProjectRecord[]>([])
const editingProjectId = ref<number | null>(null)
const projectKeyword = ref('')
const projectFormRef = ref<FormInstance>()
const partyFormRef = ref<FormInstance>()

const defaultProjectForm = () => ({
  projectCode: 'PRJ20260510002',
  projectName: '新建资产评估项目',
  projectType: 'LAND_ACQUISITION',
  entrustingParty: '委托方示例',
  regionName: '金华市',
  benchmarkDate: '2026-05-10',
  surveyDate: '2026-05-10',
  status: 'DRAFT',
  remark: '',
})

const projectForm = reactive(defaultProjectForm())

const partyForm = reactive({
  projectId: 1,
  partyType: 'PERSON',
  partyName: '新增对象',
  villageGroup: '',
  locationText: '',
  tenantName: '',
  remark: '',
})

const projectRules: FormRules = {
  projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectType: [{ required: true, message: '请输入项目类型', trigger: 'blur' }],
  entrustingParty: [{ required: true, message: '请输入委托方', trigger: 'blur' }],
  regionName: [{ required: true, message: '请输入所属区域', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const partyRules: FormRules = {
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  partyType: [{ required: true, message: '请选择对象类型', trigger: 'change' }],
  partyName: [{ required: true, message: '请输入对象名称', trigger: 'blur' }],
}

const filteredProjects = computed(() => {
  const keyword = projectKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return projects.value
  }
  return projects.value.filter((project) => {
    return [project.projectCode, project.projectName, project.regionName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  })
})

function resetProjectForm() {
  editingProjectId.value = null
  Object.assign(projectForm, defaultProjectForm())
  projectFormRef.value?.clearValidate()
}

async function loadProjects() {
  const response = await getProjects()
  projects.value = response.data
  if (projects.value.length > 0 && !projects.value.some((item) => item.id === partyForm.projectId)) {
    partyForm.projectId = projects.value[0].id
  }
}

async function submitProject() {
  const valid = await projectFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  if (editingProjectId.value) {
    await updateProject(editingProjectId.value, projectForm)
    ElMessage.success('项目已更新')
  } else {
    await createProject(projectForm)
    ElMessage.success('项目已创建')
  }
  resetProjectForm()
  await loadProjects()
}

function fillProject(project: ProjectRecord) {
  editingProjectId.value = project.id
  projectForm.projectCode = project.projectCode
  projectForm.projectName = project.projectName
  projectForm.projectType = project.projectType
  projectForm.entrustingParty = project.entrustingParty ?? ''
  projectForm.regionName = project.regionName ?? ''
  projectForm.benchmarkDate = project.benchmarkDate ?? ''
  projectForm.surveyDate = project.surveyDate ?? ''
  projectForm.status = project.status
  projectForm.remark = project.remark ?? ''
}

async function removeProject(id: number) {
  await ElMessageBox.confirm('删除后项目及其对象数据将不可在列表中继续操作。', '确认删除项目', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteProject(id)
  ElMessage.success('项目已删除')
  await loadProjects()
}

async function submitParty() {
  const valid = await partyFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  await createProjectParty(partyForm.projectId, {
    partyType: partyForm.partyType,
    partyName: partyForm.partyName,
    villageGroup: partyForm.villageGroup,
    locationText: partyForm.locationText,
    tenantName: partyForm.tenantName,
    remark: partyForm.remark,
  })
  ElMessage.success('对象已新增')
  partyFormRef.value?.resetFields()
  await loadProjects()
}

onMounted(() => {
  loadProjects().catch(() => {
    ElMessage.error('项目加载失败')
  })
})
</script>
