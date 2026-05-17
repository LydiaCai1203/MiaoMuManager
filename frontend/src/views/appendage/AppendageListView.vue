<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header list-header-main">
        <h2>附属物评估列表</h2>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新建评估单</el-button>
        </div>
      </div>
      <div class="list-toolbar">
        <div class="list-filters">
          <el-input v-model="keyword" placeholder="搜索评估单编号/租户/位置" clearable style="width: 260px" />
        </div>
        <el-button text @click="loadEvaluations">刷新</el-button>
      </div>
      <el-table :data="filteredEvaluations">
        <el-table-column prop="evaluationNo" label="评估单编号" min-width="180" />
        <el-table-column prop="tenantName" label="租户" min-width="140" />
        <el-table-column prop="locationText" label="位置" min-width="160" />
        <el-table-column prop="totalAmount" label="合计金额" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <span :class="['status-chip', scope.row.status === 'SUBMITTED' ? 'status-submitted' : 'status-draft']">
              {{ getEvaluationStatusLabel(scope.row.status) }}
            </span>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑附属物评估单' : '新建附属物评估单'" width="1080px" top="4vh" destroy-on-close>
      <div class="record-page-hero">
        <div>
          <div class="record-page-kicker">评估业务</div>
          <h2>{{ editingId ? '编辑附属物评估单' : '新建附属物评估单' }}</h2>
          <div class="muted-text">用于录入附属物明细、自动汇总评估值，并维护单据状态。</div>
        </div>
        <div class="record-page-summary">
          <span class="summary-label">当前合计</span>
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
        <el-form-item label="租户名称">
          <el-input v-model="form.tenantName" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.locationText" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option v-for="item in evaluationStatusOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-table :data="form.items" class="section-table">
        <el-table-column label="分类" width="180">
          <template #default="scope">
            <el-select v-model="scope.row.assetType" @change="handleAssetTypeChange(scope.row)">
              <el-option label="构筑物" value="STRUCTURE" />
              <el-option label="设备搬迁" value="EQUIPMENT_MOVE" />
              <el-option label="苗木移植" value="SEEDLING_MOVE" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="180">
          <template #default="scope">
            <el-select
              v-model="scope.row.itemName"
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入名称"
              @change="handleItemNameChange(scope.row)"
            >
              <el-option
                v-for="name in getNameOptions(scope.row.assetType)"
                :key="name"
                :label="name"
                :value="name"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="180">
          <template #default="scope">
            <el-select
              v-model="scope.row.specification"
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入规格"
              @change="handleItemSpecChange(scope.row)"
            >
              <el-option
                v-for="spec in getSpecOptions(scope.row.assetType, scope.row.itemName)"
                :key="spec"
                :label="spec"
                :value="spec"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="140">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="0" :precision="2" @change="recalculate(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="评估单价" width="160">
          <template #default="scope">
            <el-input-number v-model="scope.row.evaluationUnitPrice" :min="0" :precision="2" @change="recalculate(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="评估值" width="140">
          <template #default="scope">
            <span>{{ scope.row.evaluationAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="section-actions section-toolbar">
        <el-button @click="addItem">新增明细</el-button>
        <div class="summary-text">合计：{{ totalAmount.toFixed(2) }}</div>
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
import { createAppendageEvaluation, deleteAppendageEvaluation, getAppendageEvaluations, updateAppendageEvaluation } from '../../api/appendage'
import { lookupPrices, type PriceRecord } from '../../api/price'

interface AppendageFormItem {
  assetType: string
  assetCode: string
  lineNo: number
  itemName: string
  specification: string
  unit: string
  quantity: number
  replacementUnitPrice?: number
  replacementAmount?: number
  noveltyRate?: number
  evaluationUnitPrice: number
  evaluationAmount: number
}

const CATEGORY_MAP: Record<string, string> = {
  STRUCTURE: 'APPENDAGE_STRUCTURE',
  EQUIPMENT_MOVE: 'APPENDAGE_EQUIPMENT_MOVE',
  SEEDLING_MOVE: 'APPENDAGE_SEEDLING_MOVE',
}

const projects = ref<ProjectRecord[]>([])
const evaluations = ref<any[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const dialogVisible = ref(false)
const evaluationStatusOptions = ref<OptionItemRecord[]>([])
const appendagePrices = ref<Record<string, PriceRecord[]>>({
  APPENDAGE_STRUCTURE: [],
  APPENDAGE_EQUIPMENT_MOVE: [],
  APPENDAGE_SEEDLING_MOVE: [],
})

function getPricesForType(assetType: string): PriceRecord[] {
  const category = CATEGORY_MAP[assetType]
  return category ? (appendagePrices.value[category] || []) : []
}

function getNameOptions(assetType: string) {
  const names = new Set(getPricesForType(assetType).map((p) => p.assetName))
  return Array.from(names)
}

function getSpecOptions(assetType: string, itemName: string) {
  return getPricesForType(assetType)
    .filter((p) => p.assetName === itemName && p.specification)
    .map((p) => p.specification!)
}

function findPrice(assetType: string, name: string, spec: string) {
  return getPricesForType(assetType).find((p) => p.assetName === name && p.specification === spec)
}

function handleAssetTypeChange(item: AppendageFormItem) {
  item.itemName = ''
  item.specification = ''
  item.unit = '项'
  item.evaluationUnitPrice = 0
  recalculate(item)
}

function handleItemNameChange(item: AppendageFormItem) {
  const specs = getSpecOptions(item.assetType, item.itemName)
  if (specs.length === 1) {
    item.specification = specs[0]
    applyPrice(item)
  } else {
    item.specification = ''
    item.evaluationUnitPrice = 0
    recalculate(item)
  }
}

function handleItemSpecChange(item: AppendageFormItem) {
  applyPrice(item)
}

function applyPrice(item: AppendageFormItem) {
  const price = findPrice(item.assetType, item.itemName, item.specification)
  if (price) {
    item.evaluationUnitPrice = Number(price.basePrice)
    if (price.unit) item.unit = price.unit
    recalculate(item)
  }
}

const defaultItem = (): AppendageFormItem => ({
  assetType: 'STRUCTURE',
  assetCode: '',
  lineNo: 1,
  itemName: '',
  specification: '',
  unit: '项',
  quantity: 0,
  replacementUnitPrice: 0,
  replacementAmount: 0,
  noveltyRate: 1,
  evaluationUnitPrice: 0,
  evaluationAmount: 0,
})

const defaultForm = () => ({
  projectId: 1,
  partyId: 1,
  evaluationNo: 'AP20260510001',
  tenantName: '',
  locationText: '',
  benchmarkDate: '2026-05-10',
  surveyDate: '2026-05-10',
  status: 'DRAFT',
  remark: '',
  items: [defaultItem()] as AppendageFormItem[],
})

const form = reactive(defaultForm())

const selectedParties = computed<ProjectParty[]>(() => {
  return projects.value.find((project) => project.id === form.projectId)?.parties ?? []
})

const totalAmount = computed(() => form.items.reduce((sum, item) => sum + item.evaluationAmount, 0))

const filteredEvaluations = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  if (!normalized) {
    return evaluations.value
  }
  return evaluations.value.filter((item) => {
    return [item.evaluationNo, item.tenantName, item.locationText]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

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

function recalculate(item: AppendageFormItem) {
  item.evaluationAmount = Number((item.quantity * item.evaluationUnitPrice).toFixed(2))
}

function addItem() {
  form.items.push({
    assetType: 'STRUCTURE',
    assetCode: '',
    lineNo: form.items.length + 1,
    itemName: '',
    specification: '',
    unit: '项',
    quantity: 0,
    replacementUnitPrice: 0,
    replacementAmount: 0,
    noveltyRate: 1,
    evaluationUnitPrice: 0,
    evaluationAmount: 0,
  })
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
  const response = await getAppendageEvaluations()
  evaluations.value = response.data
}

async function loadEvaluationStatusOptions() {
  const response = await getOptions('EVALUATION_STATUS')
  evaluationStatusOptions.value = response.data
}

async function loadAppendagePrices() {
  const [structure, equipment, seedling] = await Promise.all([
    lookupPrices('APPENDAGE_STRUCTURE'),
    lookupPrices('APPENDAGE_EQUIPMENT_MOVE'),
    lookupPrices('APPENDAGE_SEEDLING_MOVE'),
  ])
  appendagePrices.value = {
    APPENDAGE_STRUCTURE: structure.data,
    APPENDAGE_EQUIPMENT_MOVE: equipment.data,
    APPENDAGE_SEEDLING_MOVE: seedling.data,
  }
}

async function submitEvaluation() {
  if (!form.projectId || !form.partyId) {
    ElMessage.warning('请选择所属项目和被评估对象')
    return
  }
  if (!form.evaluationNo.trim()) {
    ElMessage.warning('请输入评估单编号')
    return
  }
  if (form.items.length === 0) {
    ElMessage.warning('请至少填写一条附属物明细')
    return
  }
  const invalidItem = form.items.find((item) => !item.assetType.trim() || !item.itemName.trim() || item.quantity <= 0 || item.evaluationUnitPrice <= 0)
  if (invalidItem) {
    ElMessage.warning('每条附属物明细都需要填写分类、名称，且数量和评估单价大于 0')
    return
  }
  const payload = {
    projectId: form.projectId,
    partyId: form.partyId,
    evaluationNo: form.evaluationNo,
    tenantName: form.tenantName,
    locationText: form.locationText,
    benchmarkDate: form.benchmarkDate,
    surveyDate: form.surveyDate,
    status: form.status,
    remark: form.remark,
    items: form.items,
  }
  if (editingId.value) {
    await updateAppendageEvaluation(editingId.value, payload)
    ElMessage.success('附属物评估单已更新')
  } else {
    await createAppendageEvaluation(payload)
    ElMessage.success('附属物评估单已保存')
  }
  dialogVisible.value = false
  resetForm()
  await loadEvaluations()
}

function fillEvaluation(record: any) {
  dialogVisible.value = true
  editingId.value = record.id
  form.projectId = record.projectId
  form.partyId = record.partyId
  form.evaluationNo = record.evaluationNo
  form.tenantName = record.tenantName ?? ''
  form.locationText = record.locationText ?? ''
  form.benchmarkDate = record.benchmarkDate ?? ''
  form.surveyDate = record.surveyDate ?? ''
  form.status = record.status
  form.remark = record.remark ?? ''
  form.items = record.items.map((item: any) => ({
    assetType: item.assetType,
    assetCode: item.assetCode ?? '',
    lineNo: item.lineNo,
    itemName: item.itemName,
    specification: item.specification ?? '',
    unit: item.unit ?? '',
    quantity: Number(item.quantity),
    replacementUnitPrice: item.replacementUnitPrice == null ? 0 : Number(item.replacementUnitPrice),
    replacementAmount: item.replacementAmount == null ? 0 : Number(item.replacementAmount),
    noveltyRate: item.noveltyRate == null ? 0 : Number(item.noveltyRate),
    evaluationUnitPrice: item.evaluationUnitPrice == null ? 0 : Number(item.evaluationUnitPrice),
    evaluationAmount: Number(item.evaluationAmount),
  }))
}

async function removeEvaluation(id: number) {
  await ElMessageBox.confirm('删除后该附属物评估单将从当前列表移除。', '确认删除附属物评估单', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteAppendageEvaluation(id)
  ElMessage.success('附属物评估单已删除')
  await loadEvaluations()
}

onMounted(async () => {
  try {
    await Promise.all([loadProjects(), loadEvaluations(), loadEvaluationStatusOptions()])
  } catch {
    ElMessage.error('附属物评估页面初始化失败')
  }
  loadAppendagePrices().catch(() => {})
})
</script>
