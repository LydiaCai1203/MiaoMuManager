<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header">
        <h2>模板下载</h2>
      </div>
      <div class="section-actions">
        <el-button @click="handleDownloadSeedling">下载苗木模板</el-button>
        <el-button @click="handleDownloadAppendage">下载附属物模板</el-button>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>Excel 导入</h2>
      </div>
      <el-form :model="form" label-position="top" class="grid-form">
        <el-form-item label="导入类型">
          <el-select v-model="form.type">
            <el-option label="苗木模板" value="seedling" />
            <el-option label="附属物模板" value="appendage" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属项目">
          <el-select v-model="form.projectId" @change="handleProjectChange">
            <el-option v-for="project in projects" :key="project.id" :label="project.projectName" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="被评估对象">
          <el-select v-model="form.partyId">
            <el-option v-for="party in selectedParties" :key="party.id" :label="party.partyName" :value="party.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件">
          <input type="file" accept=".xlsx" @change="handleFileChange" />
        </el-form-item>
      </el-form>

      <el-button type="primary" :disabled="!selectedFile" @click="submitImport">开始导入</el-button>

      <div v-if="lastResult" class="import-result-card">
        <h3>导入结果</h3>
        <p>类型：{{ lastResult.templateType }}</p>
        <p>创建数量：{{ lastResult.createdCount }}</p>
        <p>消息：{{ lastResult.message }}</p>
        <div v-if="latestRecords.length > 0" class="latest-records">
          <h4>最近生成的评估记录</h4>
          <ul>
            <li v-for="record in latestRecords" :key="record.id">
              {{ record.evaluationNo }} / 总金额 {{ record.totalAmount }} / 状态 {{ record.status }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { downloadAppendageTemplate, downloadSeedlingTemplate, importAppendage, importSeedling } from '../../api/import'
import { getAppendageEvaluations } from '../../api/appendage'
import { getProjects, type ProjectParty, type ProjectRecord } from '../../api/project'
import { getSeedlingEvaluations } from '../../api/seedling'

interface ImportResult {
  templateType: string
  createdCount: number
  message: string
}

const projects = ref<ProjectRecord[]>([])
const selectedFile = ref<File | null>(null)
const lastResult = ref<ImportResult | null>(null)
const latestRecords = ref<any[]>([])

const form = reactive({
  type: 'seedling',
  projectId: 1,
  partyId: 1,
})

const selectedParties = computed<ProjectParty[]>(() => {
  return projects.value.find((project) => project.id === form.projectId)?.parties ?? []
})

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

async function handleDownloadSeedling() {
  const response: Blob = await downloadSeedlingTemplate()
  saveBlob(response, '苗木模板.xlsx')
}

async function handleDownloadAppendage() {
  const response: Blob = await downloadAppendageTemplate()
  saveBlob(response, '附属物评估模板.xlsx')
}

function handleProjectChange() {
  if (selectedParties.value.length > 0) {
    form.partyId = selectedParties.value[0].id
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function submitImport() {
  if (!selectedFile.value) {
    ElMessage.error('请先选择要导入的文件')
    return
  }

  const formData = new FormData()
  formData.append('projectId', String(form.projectId))
  formData.append('partyId', String(form.partyId))
  formData.append('file', selectedFile.value)

  const response = form.type === 'seedling'
    ? await importSeedling(formData)
    : await importAppendage(formData)

  lastResult.value = response.data
  latestRecords.value = form.type === 'seedling'
    ? (await getSeedlingEvaluations()).data.slice(0, 3)
    : (await getAppendageEvaluations()).data.slice(0, 3)
  ElMessage.success('导入成功')
}

async function loadProjects() {
  const response = await getProjects()
  projects.value = response.data
  if (projects.value.length > 0) {
    form.projectId = projects.value[0].id
    if (projects.value[0].parties.length > 0) {
      form.partyId = projects.value[0].parties[0].id
    }
  }
}

onMounted(async () => {
  try {
    await loadProjects()
  } catch {
    ElMessage.error('导入中心初始化失败')
  }
})
</script>
