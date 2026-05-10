<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header">
        <h2>{{ editingId ? '编辑苗木评估单' : '新建苗木评估单' }}</h2>
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
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已提交" value="SUBMITTED" />
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
            <el-input v-model="scope.row.seedlingName" />
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="180">
          <template #default="scope">
            <el-input v-model="scope.row.specification" />
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

      <div class="section-actions">
        <el-button @click="addItem">新增明细</el-button>
        <div class="summary-text">总金额：{{ totalAmount.toFixed(2) }}</div>
      </div>

      <div class="section-actions">
        <el-button type="primary" @click="submitEvaluation">保存苗木评估单</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>苗木评估列表</h2>
        <div class="section-actions">
          <el-input v-model="keyword" placeholder="搜索评估单编号" clearable style="width: 220px" />
          <el-button text @click="loadEvaluations">刷新</el-button>
        </div>
      </div>
      <el-table :data="filteredEvaluations">
        <el-table-column prop="evaluationNo" label="评估单编号" min-width="180" />
        <el-table-column prop="projectId" label="项目 ID" width="100" />
        <el-table-column prop="partyId" label="对象 ID" width="100" />
        <el-table-column prop="totalAmount" label="总金额" width="120" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button text @click="fillEvaluation(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removeEvaluation(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProjects, type ProjectParty, type ProjectRecord } from '../../api/project'
import { createSeedlingEvaluation, deleteSeedlingEvaluation, getSeedlingEvaluations, updateSeedlingEvaluation } from '../../api/seedling'

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

const defaultItem = (): SeedlingFormItem => ({
  lineNo: 1,
  seedlingName: '桂花',
  specification: '胸径 8cm',
  unit: '株',
  quantity: 10,
  unitPrice: 120,
  amount: 1200,
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

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  handleProjectChange()
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
  resetForm()
  await loadEvaluations()
}

function fillEvaluation(record: any) {
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
    await loadProjects()
    await loadEvaluations()
  } catch {
    ElMessage.error('苗木评估页面初始化失败')
  }
})
</script>
