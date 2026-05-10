<template>
  <div class="project-page">
    <div class="page-card">
      <div class="record-page-hero option-config-hero">
        <div>
          <div class="record-page-kicker">系统管理</div>
          <h2>下拉配置</h2>
          <div class="muted-text">按业务分组维护下拉选项。管理员配置什么，业务表单就展示什么。</div>
        </div>
        <div class="record-page-summary option-config-summary">
          <span class="summary-label">当前分组</span>
          <strong>{{ currentGroupMeta.label }}</strong>
          <span class="muted-text">{{ currentGroupMeta.description }}</span>
        </div>
      </div>

      <el-tabs v-model="activeGroup" class="option-tabs">
        <el-tab-pane v-for="group in optionGroups" :key="group.code" :label="group.label" :name="group.code" />
      </el-tabs>

      <div class="list-toolbar">
        <div class="list-filters">
          <el-input v-model="keyword" placeholder="搜索选项值/显示名称" clearable style="width: 260px" />
        </div>
        <div class="section-actions compact-actions">
          <el-button type="primary" @click="openCreateDialog">新增当前分组配置</el-button>
          <el-button text @click="loadOptionItems">刷新</el-button>
        </div>
      </div>

      <el-table :data="filteredOptions" row-key="id">
        <el-table-column prop="optionValue" label="选项值" min-width="180" />
        <el-table-column prop="optionLabel" label="显示名称" min-width="160" />
        <el-table-column prop="sortOrder" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <span :class="['status-chip', scope.row.enabled ? 'status-submitted' : 'status-draft']">
              {{ scope.row.enabled ? '启用' : '停用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <div class="table-actions">
              <el-button text type="primary" @click="fillOption(scope.row)">编辑</el-button>
              <el-button text type="danger" @click="removeOption(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑配置项' : '新增配置项'" width="760px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="grid-form">
        <el-form-item label="分组编码" prop="groupCode">
          <el-select v-model="form.groupCode" :disabled="editingId !== null">
            <el-option v-for="group in optionGroups" :key="group.code" :label="group.label" :value="group.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="选项值" prop="optionValue">
          <el-input v-model="form.optionValue" />
        </el-form-item>
        <el-form-item label="显示名称" prop="optionLabel">
          <el-input v-model="form.optionLabel" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :step="10" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="form.enabled">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitOption">{{ editingId ? '保存配置项' : '新增配置项' }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createOptionItem,
  deleteOptionItem,
  getSystemOptions,
  updateOptionItem,
  type OptionItemPayload,
  type OptionItemRecord,
} from '../../api/options'

const optionItems = ref<OptionItemRecord[]>([])
const editingId = ref<number | null>(null)
const keyword = ref('')
const activeGroup = ref('PROJECT_TYPE')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const optionGroups = [
  { code: 'PROJECT_TYPE', label: '项目类型', description: '控制项目表单里的项目类型下拉。' },
  { code: 'ASSET_CATEGORY', label: '价格分类', description: '控制价格库里的资产分类下拉。' },
  { code: 'PARTY_TYPE', label: '对象类型', description: '控制评估对象里的对象类型下拉。' },
  { code: 'HOUSE_USAGE_TYPE', label: '房屋用途', description: '控制房屋评估里的房屋用途下拉。' },
  { code: 'USER_STATUS', label: '用户状态', description: '控制用户管理里的状态下拉。' },
  { code: 'EVALUATION_STATUS', label: '评估状态', description: '控制三类评估单的状态下拉。' },
]

const defaultForm = (): OptionItemPayload => ({
  groupCode: 'PROJECT_TYPE',
  optionValue: '',
  optionLabel: '',
  sortOrder: 10,
  enabled: true,
  remark: '',
})

const form = reactive(defaultForm())

const currentGroupMeta = computed(() => {
  return optionGroups.find((group) => group.code === activeGroup.value) ?? optionGroups[0]
})

const rules: FormRules = {
  groupCode: [{ required: true, message: '请选择分组编码', trigger: 'change' }],
  optionValue: [{ required: true, message: '请输入选项值', trigger: 'blur' }],
  optionLabel: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'change' }],
  enabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const filteredOptions = computed(() => {
  const normalized = keyword.value.trim().toLowerCase()
  return optionItems.value.filter((item) => {
    if (item.groupCode !== activeGroup.value) {
      return false
    }
    if (!normalized) {
      return true
    }
    return [item.optionValue, item.optionLabel].some((value) => value.toLowerCase().includes(normalized))
  })
})

function resetForm() {
  editingId.value = null
  Object.assign(form, defaultForm())
  form.groupCode = activeGroup.value
  formRef.value?.clearValidate()
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function handleDialogClose() {
  dialogVisible.value = false
  resetForm()
}

async function loadOptionItems() {
  const response = await getSystemOptions()
  optionItems.value = response.data
}

async function submitOption() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  if (editingId.value) {
    await updateOptionItem(editingId.value, form)
    ElMessage.success('配置项已更新')
  } else {
    await createOptionItem(form)
    ElMessage.success('配置项已创建')
  }
  dialogVisible.value = false
  resetForm()
  await loadOptionItems()
}

function fillOption(record: OptionItemRecord) {
  dialogVisible.value = true
  editingId.value = record.id
  form.groupCode = record.groupCode
  form.optionValue = record.optionValue
  form.optionLabel = record.optionLabel
  form.sortOrder = record.sortOrder
  form.enabled = record.enabled
  form.remark = record.remark ?? ''
}

async function removeOption(id: number) {
  await ElMessageBox.confirm('删除后该配置项将不再出现在下拉列表中。', '确认删除配置项', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await deleteOptionItem(id)
  ElMessage.success('配置项已删除')
  await loadOptionItems()
}

watch(activeGroup, () => {
  if (!dialogVisible.value) {
    resetForm()
  }
})

onMounted(() => {
  loadOptionItems().catch(() => {
    ElMessage.error('下拉配置加载失败')
  })
})
</script>
