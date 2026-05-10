<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header list-header-main">
        <h2>项目列表</h2>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新建项目</el-button>
        </div>
      </div>
      <div class="list-toolbar">
        <div class="list-filters">
          <el-input v-model="projectKeyword" placeholder="搜索项目编号/名称" clearable style="width: 240px" />
        </div>
        <el-button text @click="loadProjects">刷新</el-button>
      </div>
      <el-table :data="filteredProjects" row-key="id">
        <el-table-column prop="projectCode" label="项目编号" min-width="160" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="项目类型" min-width="140">
          <template #default="scope">
            {{ getProjectTypeLabel(scope.row.projectType) }}
          </template>
        </el-table-column>
        <el-table-column prop="regionName" label="区域" min-width="140" />
        <el-table-column prop="status" label="状态" min-width="120" />
        <el-table-column label="对象数" min-width="100">
          <template #default="scope">
            {{ scope.row.parties.length }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button text type="primary" @click="viewProject(scope.row.id)">详情</el-button>
            <el-button text @click="fillProject(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeProject(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingProjectId ? '编辑项目' : '新建项目'" width="720px" destroy-on-close>
      <el-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-position="top" class="grid-form">
        <el-form-item label="项目编号" prop="projectCode">
          <el-input v-model="projectForm.projectCode" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="projectForm.projectName" />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="projectForm.projectType">
            <el-option v-for="item in projectTypeOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button @click="resetProjectForm">重置</el-button>
          <el-button type="primary" @click="submitProject">{{ editingProjectId ? '保存项目' : '创建项目' }}</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type ProjectPayload,
  type ProjectRecord,
} from '../../api/project'
import { getOptions, type OptionItemRecord } from '../../api/options'

const router = useRouter()
const projects = ref<ProjectRecord[]>([])
const editingProjectId = ref<number | null>(null)
const projectKeyword = ref('')
const projectFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const projectTypeOptions = ref<OptionItemRecord[]>([])

const defaultProjectForm = (): ProjectPayload => ({
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

const projectRules: FormRules = {
  projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  entrustingParty: [{ required: true, message: '请输入委托方', trigger: 'blur' }],
  regionName: [{ required: true, message: '请输入所属区域', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
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

function getProjectTypeLabel(value: string) {
  return projectTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

function resetProjectForm() {
  editingProjectId.value = null
  Object.assign(projectForm, defaultProjectForm())
  projectFormRef.value?.clearValidate()
}

function openCreateDialog() {
  resetProjectForm()
  dialogVisible.value = true
}

function handleDialogClose() {
  dialogVisible.value = false
  resetProjectForm()
}

async function loadProjects() {
  const response = await getProjects()
  projects.value = response.data
}

async function loadProjectTypeOptions() {
  const response = await getOptions('PROJECT_TYPE')
  projectTypeOptions.value = response.data
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
  dialogVisible.value = false
  resetProjectForm()
  await loadProjects()
}

function fillProject(project: ProjectRecord) {
  dialogVisible.value = true
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

function viewProject(id: number) {
  router.push(`/projects/${id}`)
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

onMounted(() => {
  Promise.all([loadProjects(), loadProjectTypeOptions()]).catch(() => {
    ElMessage.error('项目加载失败')
  })
})
</script>
