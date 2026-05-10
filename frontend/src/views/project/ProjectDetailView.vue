<template>
  <div class="project-page" v-if="project">
    <div class="page-card">
      <div class="section-header">
        <div>
          <h2>{{ project.projectName }}</h2>
          <div class="muted-text">{{ project.projectCode }} · {{ getProjectTypeLabel(project.projectType) }}</div>
        </div>
        <div class="section-actions compact-actions">
          <RouterLink to="/projects/parties">
            <el-button>查看评估对象</el-button>
          </RouterLink>
          <RouterLink to="/projects">
            <el-button type="primary" plain>返回项目列表</el-button>
          </RouterLink>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">项目状态</span>
          <span>{{ project.status }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">所属区域</span>
          <span>{{ project.regionName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">委托方</span>
          <span>{{ project.entrustingParty || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">评估基准日</span>
          <span>{{ project.benchmarkDate || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">现场勘察日</span>
          <span>{{ project.surveyDate || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">评估对象数</span>
          <span>{{ project.parties.length }}</span>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>评估对象汇总</h2>
        <div class="section-actions compact-actions">
          <el-input v-model="keyword" placeholder="搜索对象名称/租户/位置" clearable style="width: 260px" />
        </div>
      </div>
      <el-table :data="filteredParties" row-key="id">
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
      </el-table>
    </div>
  </div>

  <div v-else class="page-card">
    <div class="section-header">
      <h2>项目详情</h2>
    </div>
    <div class="muted-text">未找到对应项目，可能已被删除。</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProjects, type ProjectRecord } from '../../api/project'
import { getOptions, type OptionItemRecord } from '../../api/options'

const route = useRoute()
const project = ref<ProjectRecord | null>(null)
const keyword = ref('')
const projectTypeOptions = ref<OptionItemRecord[]>([])
const partyTypeOptions = ref<OptionItemRecord[]>([])

const filteredParties = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  const items = project.value?.parties ?? []
  if (!normalized) {
    return items
  }
  return items.filter((item) => {
    return [item.partyName, item.villageGroup, item.tenantName, item.locationText]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

async function loadProject() {
  const response = await getProjects()
  const id = Number(route.params.id)
  project.value = response.data.find((item: ProjectRecord) => item.id === id) ?? null
}

async function loadProjectTypeOptions() {
  const response = await getOptions('PROJECT_TYPE')
  projectTypeOptions.value = response.data
}

function getProjectTypeLabel(value: string) {
  return projectTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

function getPartyTypeLabel(value: string) {
  return partyTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

async function loadPartyTypeOptions() {
  const response = await getOptions('PARTY_TYPE')
  partyTypeOptions.value = response.data
}

onMounted(() => {
  Promise.all([loadProject(), loadProjectTypeOptions(), loadPartyTypeOptions()]).catch(() => {
    ElMessage.error('项目详情加载失败')
  })
})
</script>
