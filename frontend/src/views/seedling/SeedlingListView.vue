<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header list-header-main">
        <h2>苗木评估列表</h2>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新建评估单</el-button>
        </div>
      </div>
      <div class="list-toolbar">
        <div class="list-filters">
          <el-input v-model="keyword" placeholder="搜索评估单编号" clearable style="width: 220px" />
        </div>
        <el-button text @click="loadEvaluations">刷新</el-button>
      </div>
      <el-table :data="filteredEvaluations">
        <el-table-column prop="evaluationNo" label="评估单编号" min-width="180" />
        <el-table-column prop="projectId" label="项目" width="100" />
        <el-table-column prop="partyId" label="对象" width="100" />
        <el-table-column prop="totalAmount" label="总金额" width="120" />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑苗木评估单' : '新建苗木评估单'" width="1080px" top="4vh" destroy-on-close>
      <div class="record-page-hero">
        <div>
          <div class="record-page-kicker">评估业务</div>
          <h2>{{ editingId ? '编辑苗木评估单' : '新建苗木评估单' }}</h2>
          <div class="muted-text">用于录入苗木明细、自动汇总金额，并维护单据状态。</div>
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
        <el-form-item label="评估基准日">
          <el-input v-model="form.benchmarkDate" />
        </el-form-item>
        <el-form-item label="现场勘察日">
          <el-input v-model="form.surveyDate" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option v-for="item in evaluationStatusOptions" :key="item.optionValue" :label="item.optionLabel" :value="item.optionValue" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-table :data="form.items" class="section-table">
        <el-table-column label="序号" width="80">
          <template #default="scope">
            <el-input-number v-model="scope.row.lineNo" :min="1" />
          </template>
        </el-table-column>
        <el-table-column label="苗木名称" min-width="180">
          <template #default="scope">
            <el-select
              v-model="scope.row.seedlingName"
              filterable
              allow-create
              default-first-option
              placeholder="选择或输入名称"
              @change="handleNameChange(scope.row)"
            >
              <el-option v-for="name in seedlingNameOptions" :key="name" :label="name" :value="name" />
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
              @change="handleSpecChange(scope.row)"
            >
              <el-option
                v-for="spec in getSpecOptions(scope.row.seedlingName)"
                :key="spec"
                :label="spec"
                :value="spec"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.unit" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="140">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="0" :precision="2" @change="recalculate(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="单价" width="140">
          <template #default="scope">
            <el-input-number v-model="scope.row.unitPrice" :min="0" :precision="2" @change="recalculate(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="金额" width="140">
          <template #default="scope">
            <span>{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="section-actions section-toolbar">
        <el-button @click="addItem">新增明细</el-button>
        <div class="summary-text">总金额：{{ totalAmount.toFixed(2) }}</div>
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
import { createSeedlingEvaluation, deleteSeedlingEvaluation, getSeedlingEvaluations, updateSeedlingEvaluation } from '../../api/seedling'
import { lookupPrices, type PriceRecord } from '../../api/price'

interface SeedlingFormItem {
  lineNo: number
  seedlingName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

const projects = ref<ProjectRecord[]>([])
const evaluations = ref<any[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const dialogVisible = ref(false)
const evaluationStatusOptions = ref<OptionItemRecord[]>([])
const seedlingPrices = ref<PriceRecord[]>([])

const seedlingNameOptions = computed(() => {
  const names = new Set(seedlingPrices.value.map((p) => p.assetName))
  return Array.from(names)
})

function getSpecOptions(name: string) {
  return seedlingPrices.value
    .filter((p) => p.assetName === name && p.specification)
    .map((p) => p.specification!)
}

function findPrice(name: string, spec: string) {
  return seedlingPrices.value.find((p) => p.assetName === name && p.specification === spec)
}

function handleNameChange(item: SeedlingFormItem) {
  const specs = getSpecOptions(item.seedlingName)
  if (specs.length === 1) {
    item.specification = specs[0]
    applyPrice(item)
  } else {
    item.specification = ''
    item.unitPrice = 0
    item.unit = '株'
    recalculate(item)
  }
}

function handleSpecChange(item: SeedlingFormItem) {
  applyPrice(item)
}

function applyPrice(item: SeedlingFormItem) {
  const price = findPrice(item.seedlingName, item.specification)
  if (price) {
    item.unitPrice = Number(price.basePrice)
    if (price.unit) item.unit = price.unit
    recalculate(item)
  }
}

const defaultItem = (): SeedlingFormItem => ({
  lineNo: 1,
  seedlingName: '',
  specification: '',
  unit: '株',
  quantity: 0,
  unitPrice: 0,
  amount: 0,
})

const defaultForm = () => ({
  projectId: 1,
  partyId: 1,
  evaluationNo: 'SE20260510001',
  benchmarkDate: '2026-05-10',
  surveyDate: '2026-05-10',
  status: 'DRAFT',
  remark: '',
  items: [defaultItem()] as SeedlingFormItem[],
})

const form = reactive(defaultForm())

const selectedParties = computed<ProjectParty[]>(() => {
  return projects.value.find((project) => project.id === form.projectId)?.parties ?? []
})

const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => sum + item.amount, 0)
})

const filteredEvaluations = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  if (!normalized) {
    return evaluations.value
  }
  return evaluations.value.filter((item) => String(item.evaluationNo ?? '').toLowerCase().includes(normalized))
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

function recalculate(item: SeedlingFormItem) {
  item.amount = Number((item.quantity * item.unitPrice).toFixed(2))
}

function addItem() {
  form.items.push({
    lineNo: form.items.length + 1,
    seedlingName: '',
    specification: '',
    unit: '株',
    quantity: 0,
    unitPrice: 0,
    amount: 0,
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
  const response = await getSeedlingEvaluations()
  evaluations.value = response.data
}

async function loadEvaluationStatusOptions() {
  const response = await getOptions('EVALUATION_STATUS')
  evaluationStatusOptions.value = response.data
}

async function loadSeedlingPrices() {
  const response = await lookupPrices('SEEDLING')
  seedlingPrices.value = response.data
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
    ElMessage.warning('请至少填写一条苗木明细')
    return
  }
  const invalidItem = form.items.find((item) => !item.seedlingName.trim() || !item.unit.trim() || item.quantity <= 0 || item.unitPrice <= 0)
  if (invalidItem) {
    ElMessage.warning('每条苗木明细都需要填写名称、单位，且数量和单价大于 0')
    return
  }
  const payload = {
    projectId: form.projectId,
    partyId: form.partyId,
    evaluationNo: form.evaluationNo,
    benchmarkDate: form.benchmarkDate,
    surveyDate: form.surveyDate,
    status: form.status,
    remark: form.remark,
    items: form.items,
  }
  if (editingId.value) {
    await updateSeedlingEvaluation(editingId.value, payload)
    ElMessage.success('苗木评估单已更新')
  } else {
    await createSeedlingEvaluation(payload)
    ElMessage.success('苗木评估单已保存')
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
  form.benchmarkDate = record.benchmarkDate ?? ''
  form.surveyDate = record.surveyDate ?? ''
  form.status = record.status
  form.remark = record.remark ?? ''
  form.items = record.items.map((item: any) => ({
    lineNo: item.lineNo,
    seedlingName: item.seedlingName,
    specification: item.specification ?? '',
    unit: item.unit,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    amount: Number(item.amount),
  }))
}

async function removeEvaluation(id: number) {
  await ElMessageBox.confirm('删除后该苗木评估单将从当前列表移除。', '确认删除苗木评估单', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteSeedlingEvaluation(id)
  ElMessage.success('苗木评估单已删除')
  await loadEvaluations()
}

onMounted(async () => {
  try {
    await Promise.all([loadProjects(), loadEvaluations(), loadEvaluationStatusOptions()])
  } catch {
    ElMessage.error('苗木评估页面初始化失败')
  }
  loadSeedlingPrices().catch(() => {})
})
</script>
