<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header list-header-main">
        <h2>房屋评估列表</h2>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新建评估单</el-button>
        </div>
      </div>
      <div class="list-toolbar">
        <div class="list-filters">
          <el-input v-model="keyword" placeholder="搜索评估单编号/坐落/用途" clearable style="width: 260px" />
        </div>
        <el-button text @click="loadEvaluations">刷新</el-button>
      </div>
      <el-table :data="filteredEvaluations">
        <el-table-column prop="evaluationNo" label="评估单编号" min-width="180" />
        <el-table-column prop="locationText" label="房屋坐落" min-width="180" />
        <el-table-column label="用途" min-width="120">
          <template #default="scope">
            {{ getUsageTypeLabel(scope.row.usageType) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="评估总值" width="140" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <span :class="['status-chip', scope.row.status === 'SUBMITTED' ? 'status-submitted' : 'status-draft']">
              {{ getEvaluationStatusLabel(scope.row.status) }}
            </span>
            <el-tag v-if="scope.row.priceAdjusted === 1" type="warning" size="small" style="margin-left: 4px">已修正</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button text @click="fillEvaluation(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeEvaluation(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑房屋评估单' : '新建房屋评估单'" width="1080px" top="4vh" destroy-on-close>
      <div class="record-page-hero">
        <div>
          <div class="record-page-kicker">评估业务</div>
          <h2>{{ editingId ? '编辑房屋评估单' : '新建房屋评估单' }}</h2>
          <div class="muted-text">用于录入房屋信息、自动测算评估总值，并维护单据状态。</div>
        </div>
        <div class="record-page-summary">
          <span class="summary-label">当前总值</span>
          <strong>{{ totalAmount.toFixed(2) }}</strong>
        </div>
      </div>
      <div class="section-header">
        <h2>评估单信息</h2>
      </div>
      <el-form :model="form" label-position="top" class="grid-form">
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
        <el-form-item label="评估单编号">
          <el-input v-model="form.evaluationNo" />
        </el-form-item>
        <el-form-item label="房屋坐落">
          <el-input v-model="form.locationText" />
        </el-form-item>
        <el-form-item label="房屋用途">
          <el-select v-model="form.usageType" @change="handleUsageTypeChange">
            <el-option v-for="item in usageTypeOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="建筑面积">
          <el-input-number v-model="form.buildingArea" :min="0" :precision="2" @change="recalculate" />
        </el-form-item>
        <el-form-item label="单价">
          <div style="display: flex; align-items: center; gap: 8px; width: 100%">
            <el-input-number v-model="form.unitPrice" :min="0" :precision="2" @change="recalculate" style="flex: 1" />
            <el-tag v-if="isPriceAdjusted" type="warning" size="small">已修正</el-tag>
          </div>
          <div v-if="suggestedPrice !== null" style="font-size: 12px; color: #909399; margin-top: 4px">
            建议价格：{{ suggestedPrice }}
          </div>
        </el-form-item>
        <el-form-item label="区域系数">
          <el-input-number v-model="form.regionFactor" :min="0" :precision="2" @change="recalculate" />
        </el-form-item>
        <el-form-item label="楼层系数">
          <el-input-number v-model="form.floorFactor" :min="0" :precision="2" @change="recalculate" />
        </el-form-item>
        <el-form-item label="朝向系数">
          <el-input-number v-model="form.orientationFactor" :min="0" :precision="2" @change="recalculate" />
        </el-form-item>
        <el-form-item label="装修系数">
          <el-input-number v-model="form.decorationFactor" :min="0" :precision="2" @change="recalculate" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option v-for="item in evaluationStatusOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="section-actions">
        <div class="summary-text">评估总值：{{ totalAmount.toFixed(2) }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitEvaluation">{{ editingId ? '保存评估单' : '新建评估单' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOptions, type OptionItemRecord } from '../../api/options'
import { getProjects, type ProjectParty, type ProjectRecord } from '../../api/project'
import { createHouseEvaluation, deleteHouseEvaluation, getHouseEvaluations, updateHouseEvaluation, type HouseEvaluationRecord } from '../../api/house'
import { lookupPrices, type PriceRecord } from '../../api/price'

const projects = ref<ProjectRecord[]>([])
const evaluations = ref<HouseEvaluationRecord[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const dialogVisible = ref(false)
const usageTypeOptions = ref<OptionItemRecord[]>([])
const evaluationStatusOptions = ref<OptionItemRecord[]>([])
const housePrices = ref<PriceRecord[]>([])

const suggestedPrice = computed(() => {
  if (!form.usageType) return null
  const price = housePrices.value.find((p) => p.assetName === form.usageType)
  return price ? Number(price.basePrice) : null
})

const isPriceAdjusted = computed(() => {
  return suggestedPrice.value !== null && form.unitPrice !== suggestedPrice.value
})

function handleUsageTypeChange() {
  if (suggestedPrice.value !== null) {
    form.unitPrice = suggestedPrice.value
  }
}

const defaultForm = () => ({
  projectId: 1,
  partyId: 1,
  evaluationNo: 'HO20260510001',
  locationText: '金华市婺城区示例小区',
  usageType: 'RESIDENTIAL',
  buildingArea: 120,
  unitPrice: 9800,
  regionFactor: 1,
  floorFactor: 1,
  orientationFactor: 1,
  decorationFactor: 1,
  benchmarkDate: '2026-05-10',
  surveyDate: '2026-05-10',
  status: 'DRAFT',
  remark: '',
})

const form = reactive(defaultForm())

const selectedParties = computed<ProjectParty[]>(() => {
  return projects.value.find((project) => project.id === form.projectId)?.parties ?? []
})

const totalAmount = computed(() => {
  return Number((
    form.buildingArea *
    form.unitPrice *
    form.regionFactor *
    form.floorFactor *
    form.orientationFactor *
    form.decorationFactor
  ).toFixed(2))
})

const filteredEvaluations = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  if (!normalized) {
    return evaluations.value
  }
  return evaluations.value.filter((item) => {
    return [item.evaluationNo, item.locationText, item.usageType]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

function getUsageTypeLabel(value: string) {
  return usageTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

function getEvaluationStatusLabel(value: string) {
  return evaluationStatusOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value
}

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  handleProjectChange()
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function handleDialogClose() {
  dialogVisible.value = false
  resetForm()
}

function recalculate() {
}

function handleProjectChange() {
  if (selectedParties.value.length > 0) {
    form.partyId = selectedParties.value[0].id
  }
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

async function loadEvaluations() {
  const response = await getHouseEvaluations()
  evaluations.value = response.data
}

async function loadUsageTypeOptions() {
  const response = await getOptions('HOUSE_USAGE_TYPE')
  usageTypeOptions.value = response.data
}

async function loadEvaluationStatusOptions() {
  const response = await getOptions('EVALUATION_STATUS')
  evaluationStatusOptions.value = response.data
}

async function loadHousePrices() {
  const response = await lookupPrices('HOUSE')
  housePrices.value = response.data
}

async function submitEvaluation() {
  if (!form.projectId || !form.partyId) {
    ElMessage.warning('请选择所属项目和被评估对象')
    return
  }
  if (!form.evaluationNo.trim() || !form.locationText.trim() || !form.usageType.trim()) {
    ElMessage.warning('请完整填写评估单编号、房屋坐落和房屋用途')
    return
  }
  if (form.buildingArea <= 0 || form.unitPrice <= 0) {
    ElMessage.warning('建筑面积和单价需要大于 0')
    return
  }
  if (form.regionFactor <= 0 || form.floorFactor <= 0 || form.orientationFactor <= 0 || form.decorationFactor <= 0) {
    ElMessage.warning('各项系数需要大于 0')
    return
  }
  const payload = {
    projectId: form.projectId,
    partyId: form.partyId,
    evaluationNo: form.evaluationNo,
    locationText: form.locationText,
    usageType: form.usageType,
    buildingArea: form.buildingArea,
    unitPrice: form.unitPrice,
    regionFactor: form.regionFactor,
    floorFactor: form.floorFactor,
    orientationFactor: form.orientationFactor,
    decorationFactor: form.decorationFactor,
    benchmarkDate: form.benchmarkDate,
    surveyDate: form.surveyDate,
    status: form.status,
    remark: form.remark,
  }
  if (editingId.value) {
    await updateHouseEvaluation(editingId.value, payload)
    ElMessage.success('房屋评估单已更新')
  } else {
    await createHouseEvaluation(payload)
    ElMessage.success('房屋评估单已保存')
  }
  dialogVisible.value = false
  resetForm()
  await loadEvaluations()
}

function fillEvaluation(record: HouseEvaluationRecord) {
  dialogVisible.value = true
  editingId.value = record.id
  form.projectId = record.projectId
  form.partyId = record.partyId
  form.evaluationNo = record.evaluationNo
  form.locationText = record.locationText ?? ''
  form.usageType = record.usageType ?? ''
  form.buildingArea = Number(record.buildingArea)
  form.unitPrice = Number(record.unitPrice)
  form.regionFactor = Number(record.regionFactor)
  form.floorFactor = Number(record.floorFactor)
  form.orientationFactor = Number(record.orientationFactor)
  form.decorationFactor = Number(record.decorationFactor)
  form.benchmarkDate = record.benchmarkDate ?? ''
  form.surveyDate = record.surveyDate ?? ''
  form.status = record.status
  form.remark = record.remark ?? ''
}

async function removeEvaluation(id: number) {
  await ElMessageBox.confirm('删除后该房屋评估单将从当前列表移除。', '确认删除房屋评估单', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteHouseEvaluation(id)
  ElMessage.success('房屋评估单已删除')
  await loadEvaluations()
}

onMounted(async () => {
  try {
    await Promise.all([loadProjects(), loadEvaluations(), loadUsageTypeOptions(), loadEvaluationStatusOptions()])
  } catch {
    ElMessage.error('房屋评估页面初始化失败')
  }
  loadHousePrices().catch(() => {})
})
</script>
