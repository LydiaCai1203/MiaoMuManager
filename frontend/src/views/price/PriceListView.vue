<template>
  <div class="project-page">
    <div class="page-card">
      <div class="section-header">
        <h2>{{ editingId ? '编辑价格项' : '新增价格项' }}</h2>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid-form">
        <el-form-item label="资产分类" prop="assetCategory">
          <el-input v-model="form.assetCategory" />
        </el-form-item>
        <el-form-item label="资产名称" prop="assetName">
          <el-input v-model="form.assetName" />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" />
        </el-form-item>
        <el-form-item label="基准价格" prop="basePrice">
          <el-input-number v-model="form.basePrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-input v-model="form.effectiveDate" />
        </el-form-item>
      </el-form>
      <div class="section-actions">
        <el-button type="primary" @click="submitPrice">保存价格项</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>

    <div class="page-card">
      <div class="section-header">
        <h2>价格列表</h2>
        <div class="section-actions">
          <el-input v-model="keyword" placeholder="搜索分类/名称/规格" clearable style="width: 240px" />
          <el-button text @click="loadPrices">刷新</el-button>
        </div>
      </div>
      <el-table :data="filteredPrices">
        <el-table-column prop="assetCategory" label="分类" min-width="140" />
        <el-table-column prop="assetName" label="名称" min-width="160" />
        <el-table-column prop="specification" label="规格" min-width="180" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column prop="basePrice" label="价格" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button text @click="fillPrice(scope.row)">编辑</el-button>
            <el-button text type="danger" @click="removePrice(scope.row.id)">删除</el-button>
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
import { createPrice, deletePrice, getPrices, updatePrice, type PriceRecord } from '../../api/price'

const prices = ref<PriceRecord[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const formRef = ref<FormInstance>()

const defaultForm = () => ({
  assetCategory: 'SEEDLING',
  assetName: '桂花',
  specification: '胸径10cm',
  unit: '株',
  basePrice: 180,
  effectiveDate: '2026-05-10',
  expiryDate: '',
  remark: '',
})

const form = reactive(defaultForm())

const rules: FormRules = {
  assetCategory: [{ required: true, message: '请输入资产分类', trigger: 'blur' }],
  assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  basePrice: [{ required: true, message: '请输入基准价格', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请输入生效日期', trigger: 'blur' }],
}

const filteredPrices = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  if (!normalized) {
    return prices.value
  }
  return prices.value.filter((item) => {
    return [item.assetCategory, item.assetName, item.specification]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  })
})

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  formRef.value?.clearValidate()
}

async function loadPrices() {
  const response = await getPrices()
  prices.value = response.data
}

async function submitPrice() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  if (editingId.value) {
    await updatePrice(editingId.value, form)
    ElMessage.success('价格项已更新')
  } else {
    await createPrice(form)
    ElMessage.success('价格项已创建')
  }
  resetForm()
  await loadPrices()
}

function fillPrice(record: PriceRecord) {
  editingId.value = record.id
  form.assetCategory = record.assetCategory
  form.assetName = record.assetName
  form.specification = record.specification ?? ''
  form.unit = record.unit ?? ''
  form.basePrice = Number(record.basePrice)
  form.effectiveDate = record.effectiveDate ?? ''
  form.expiryDate = record.expiryDate ?? ''
  form.remark = record.remark ?? ''
}

async function removePrice(id: number) {
  await ElMessageBox.confirm('删除后该价格项将从价格库中移除。', '确认删除价格项', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deletePrice(id)
  ElMessage.success('价格项已删除')
  await loadPrices()
}

onMounted(() => {
  loadPrices().catch(() => {
    ElMessage.error('价格列表加载失败')
  })
})
</script>
