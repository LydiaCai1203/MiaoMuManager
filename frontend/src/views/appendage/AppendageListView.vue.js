import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOptions } from '../../api/options';
import { getProjects } from '../../api/project';
import { createAppendageEvaluation, deleteAppendageEvaluation, getAppendageEvaluations, updateAppendageEvaluation } from '../../api/appendage';
const projects = ref([]);
const evaluations = ref([]);
const editingId = ref(null);
const keyword = ref('');
const dialogVisible = ref(false);
const evaluationStatusOptions = ref([]);
const defaultItem = () => ({
    assetType: 'STRUCTURE',
    assetCode: '',
    lineNo: 1,
    itemName: '门墩',
    specification: '0.4*0.4高3米*2个',
    unit: '项',
    quantity: 1,
    replacementUnitPrice: 680,
    replacementAmount: 680,
    noveltyRate: 0.7,
    evaluationUnitPrice: 476,
    evaluationAmount: 476,
});
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
    items: [defaultItem()],
});
const form = reactive(defaultForm());
const selectedParties = computed(() => {
    return projects.value.find((project) => project.id === form.projectId)?.parties ?? [];
});
const totalAmount = computed(() => form.items.reduce((sum, item) => sum + item.evaluationAmount, 0));
const filteredEvaluations = computed(() => {
    const normalized = keyword.value.trim().toLowerCase();
    if (!normalized) {
        return evaluations.value;
    }
    return evaluations.value.filter((item) => {
        return [item.evaluationNo, item.tenantName, item.locationText]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalized));
    });
});
function getEvaluationStatusLabel(value) {
    return evaluationStatusOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value;
}
function resetForm() {
    editingId.value = null;
    Object.assign(form, defaultForm());
    handleProjectChange();
}
function openCreateDialog() {
    resetForm();
    dialogVisible.value = true;
}
function handleDialogClose() {
    dialogVisible.value = false;
    resetForm();
}
function recalculate(item) {
    item.evaluationAmount = Number((item.quantity * item.evaluationUnitPrice).toFixed(2));
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
    });
}
function handleProjectChange() {
    if (selectedParties.value.length > 0) {
        form.partyId = selectedParties.value[0].id;
    }
}
async function loadProjects() {
    const response = await getProjects();
    projects.value = response.data;
    if (projects.value.length > 0) {
        form.projectId = projects.value[0].id;
        if (projects.value[0].parties.length > 0) {
            form.partyId = projects.value[0].parties[0].id;
        }
    }
}
async function loadEvaluations() {
    const response = await getAppendageEvaluations();
    evaluations.value = response.data;
}
async function loadEvaluationStatusOptions() {
    const response = await getOptions('EVALUATION_STATUS');
    evaluationStatusOptions.value = response.data;
}
async function submitEvaluation() {
    if (!form.projectId || !form.partyId) {
        ElMessage.warning('请选择所属项目和被评估对象');
        return;
    }
    if (!form.evaluationNo.trim()) {
        ElMessage.warning('请输入评估单编号');
        return;
    }
    if (form.items.length === 0) {
        ElMessage.warning('请至少填写一条附属物明细');
        return;
    }
    const invalidItem = form.items.find((item) => !item.assetType.trim() || !item.itemName.trim() || item.quantity <= 0 || item.evaluationUnitPrice <= 0);
    if (invalidItem) {
        ElMessage.warning('每条附属物明细都需要填写分类、名称，且数量和评估单价大于 0');
        return;
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
    };
    if (editingId.value) {
        await updateAppendageEvaluation(editingId.value, payload);
        ElMessage.success('附属物评估单已更新');
    }
    else {
        await createAppendageEvaluation(payload);
        ElMessage.success('附属物评估单已保存');
    }
    dialogVisible.value = false;
    resetForm();
    await loadEvaluations();
}
function fillEvaluation(record) {
    dialogVisible.value = true;
    editingId.value = record.id;
    form.projectId = record.projectId;
    form.partyId = record.partyId;
    form.evaluationNo = record.evaluationNo;
    form.tenantName = record.tenantName ?? '';
    form.locationText = record.locationText ?? '';
    form.benchmarkDate = record.benchmarkDate ?? '';
    form.surveyDate = record.surveyDate ?? '';
    form.status = record.status;
    form.remark = record.remark ?? '';
    form.items = record.items.map((item) => ({
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
    }));
}
async function removeEvaluation(id) {
    await ElMessageBox.confirm('删除后该附属物评估单将从当前列表移除。', '确认删除附属物评估单', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
    });
    await deleteAppendageEvaluation(id);
    ElMessage.success('附属物评估单已删除');
    await loadEvaluations();
}
onMounted(async () => {
    try {
        await Promise.all([loadProjects(), loadEvaluations(), loadEvaluationStatusOptions()]);
    }
    catch {
        ElMessage.error('附属物评估页面初始化失败');
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "project-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header list-header-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions compact-actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.openCreateDialog)
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list-toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list-filters" },
});
const __VLS_8 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索评估单编号/租户/位置",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索评估单编号/租户/位置",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.loadEvaluations)
};
__VLS_15.slots.default;
var __VLS_15;
const __VLS_20 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    data: (__VLS_ctx.filteredEvaluations),
}));
const __VLS_22 = __VLS_21({
    data: (__VLS_ctx.filteredEvaluations),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "evaluationNo",
    label: "评估单编号",
    minWidth: "180",
}));
const __VLS_26 = __VLS_25({
    prop: "evaluationNo",
    label: "评估单编号",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "tenantName",
    label: "租户",
    minWidth: "140",
}));
const __VLS_30 = __VLS_29({
    prop: "tenantName",
    label: "租户",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "locationText",
    label: "位置",
    minWidth: "160",
}));
const __VLS_34 = __VLS_33({
    prop: "locationText",
    label: "位置",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "totalAmount",
    label: "合计金额",
    width: "120",
}));
const __VLS_38 = __VLS_37({
    prop: "totalAmount",
    label: "合计金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "状态",
    width: "120",
}));
const __VLS_42 = __VLS_41({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['status-chip', scope.row.status === 'SUBMITTED' ? 'status-submitted' : 'status-draft']) },
    });
    (__VLS_ctx.getEvaluationStatusLabel(scope.row.status));
}
var __VLS_43;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "操作",
    width: "180",
}));
const __VLS_46 = __VLS_45({
    label: "操作",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_48 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillEvaluation(scope.row);
        }
    };
    __VLS_51.slots.default;
    var __VLS_51;
    const __VLS_56 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeEvaluation(scope.row.id);
        }
    };
    __VLS_59.slots.default;
    var __VLS_59;
}
var __VLS_47;
var __VLS_23;
const __VLS_64 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑附属物评估单' : '新建附属物评估单'),
    width: "1080px",
    top: "4vh",
    destroyOnClose: true,
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingId ? '编辑附属物评估单' : '新建附属物评估单'),
    width: "1080px",
    top: "4vh",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "record-page-hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "record-page-kicker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.editingId ? '编辑附属物评估单' : '新建附属物评估单');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "muted-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "record-page-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.totalAmount.toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_68 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_70 = __VLS_69({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "所属项目",
}));
const __VLS_74 = __VLS_73({
    label: "所属项目",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}));
const __VLS_78 = __VLS_77({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onChange: (__VLS_ctx.handleProjectChange)
};
__VLS_79.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_84 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_86 = __VLS_85({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
}
var __VLS_79;
var __VLS_75;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "被评估对象",
}));
const __VLS_90 = __VLS_89({
    label: "被评估对象",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.form.partyId),
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.form.partyId),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
for (const [party] of __VLS_getVForSourceType((__VLS_ctx.selectedParties))) {
    const __VLS_96 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }));
    const __VLS_98 = __VLS_97({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
}
var __VLS_95;
var __VLS_91;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "评估单编号",
}));
const __VLS_102 = __VLS_101({
    label: "评估单编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.form.evaluationNo),
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.form.evaluationNo),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
const __VLS_108 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "租户名称",
}));
const __VLS_110 = __VLS_109({
    label: "租户名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.form.tenantName),
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.form.tenantName),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_111;
const __VLS_116 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "位置",
}));
const __VLS_118 = __VLS_117({
    label: "位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.form.locationText),
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.form.locationText),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
var __VLS_119;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "状态",
}));
const __VLS_126 = __VLS_125({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.evaluationStatusOptions))) {
    const __VLS_132 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        key: (item.optionValue),
        label: (item.optionLabel),
        value: (item.optionValue),
    }));
    const __VLS_134 = __VLS_133({
        key: (item.optionValue),
        label: (item.optionLabel),
        value: (item.optionValue),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
}
var __VLS_131;
var __VLS_127;
var __VLS_71;
const __VLS_136 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    data: (__VLS_ctx.form.items),
    ...{ class: "section-table" },
}));
const __VLS_138 = __VLS_137({
    data: (__VLS_ctx.form.items),
    ...{ class: "section-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    label: "分类",
    width: "180",
}));
const __VLS_142 = __VLS_141({
    label: "分类",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_143.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_144 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        modelValue: (scope.row.assetType),
    }));
    const __VLS_146 = __VLS_145({
        modelValue: (scope.row.assetType),
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    const __VLS_148 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        label: "构筑物",
        value: "STRUCTURE",
    }));
    const __VLS_150 = __VLS_149({
        label: "构筑物",
        value: "STRUCTURE",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const __VLS_152 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        label: "设备搬迁",
        value: "EQUIPMENT_MOVE",
    }));
    const __VLS_154 = __VLS_153({
        label: "设备搬迁",
        value: "EQUIPMENT_MOVE",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const __VLS_156 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        label: "苗木移植",
        value: "SEEDLING_MOVE",
    }));
    const __VLS_158 = __VLS_157({
        label: "苗木移植",
        value: "SEEDLING_MOVE",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    var __VLS_147;
}
var __VLS_143;
const __VLS_160 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "名称",
    minWidth: "180",
}));
const __VLS_162 = __VLS_161({
    label: "名称",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_163.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_164 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        modelValue: (scope.row.itemName),
    }));
    const __VLS_166 = __VLS_165({
        modelValue: (scope.row.itemName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
}
var __VLS_163;
const __VLS_168 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "规格",
    minWidth: "180",
}));
const __VLS_170 = __VLS_169({
    label: "规格",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_171.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_172 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        modelValue: (scope.row.specification),
    }));
    const __VLS_174 = __VLS_173({
        modelValue: (scope.row.specification),
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
}
var __VLS_171;
const __VLS_176 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "数量",
    width: "140",
}));
const __VLS_178 = __VLS_177({
    label: "数量",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_179.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_180 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        ...{ 'onChange': {} },
        modelValue: (scope.row.quantity),
        min: (0),
        precision: (2),
    }));
    const __VLS_182 = __VLS_181({
        ...{ 'onChange': {} },
        modelValue: (scope.row.quantity),
        min: (0),
        precision: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    let __VLS_184;
    let __VLS_185;
    let __VLS_186;
    const __VLS_187 = {
        onChange: (...[$event]) => {
            __VLS_ctx.recalculate(scope.row);
        }
    };
    var __VLS_183;
}
var __VLS_179;
const __VLS_188 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "评估单价",
    width: "160",
}));
const __VLS_190 = __VLS_189({
    label: "评估单价",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_191.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_192 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ 'onChange': {} },
        modelValue: (scope.row.evaluationUnitPrice),
        min: (0),
        precision: (2),
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onChange': {} },
        modelValue: (scope.row.evaluationUnitPrice),
        min: (0),
        precision: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_196;
    let __VLS_197;
    let __VLS_198;
    const __VLS_199 = {
        onChange: (...[$event]) => {
            __VLS_ctx.recalculate(scope.row);
        }
    };
    var __VLS_195;
}
var __VLS_191;
const __VLS_200 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    label: "评估值",
    width: "140",
}));
const __VLS_202 = __VLS_201({
    label: "评估值",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_203.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (scope.row.evaluationAmount.toFixed(2));
}
var __VLS_203;
var __VLS_139;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions section-toolbar" },
});
const __VLS_204 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    ...{ 'onClick': {} },
}));
const __VLS_206 = __VLS_205({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
let __VLS_208;
let __VLS_209;
let __VLS_210;
const __VLS_211 = {
    onClick: (__VLS_ctx.addItem)
};
__VLS_207.slots.default;
var __VLS_207;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-text" },
});
(__VLS_ctx.totalAmount.toFixed(2));
{
    const { footer: __VLS_thisSlot } = __VLS_67.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_212 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onClick': {} },
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onClick: (__VLS_ctx.handleDialogClose)
    };
    __VLS_215.slots.default;
    var __VLS_215;
    const __VLS_220 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        ...{ 'onClick': {} },
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_224;
    let __VLS_225;
    let __VLS_226;
    const __VLS_227 = {
        onClick: (__VLS_ctx.resetForm)
    };
    __VLS_223.slots.default;
    var __VLS_223;
    const __VLS_228 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_230 = __VLS_229({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    let __VLS_232;
    let __VLS_233;
    let __VLS_234;
    const __VLS_235 = {
        onClick: (__VLS_ctx.submitEvaluation)
    };
    __VLS_231.slots.default;
    (__VLS_ctx.editingId ? '保存评估单' : '新建评估单');
    var __VLS_231;
}
var __VLS_67;
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['list-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['list-filters']} */ ;
/** @type {__VLS_StyleScopedClasses['record-page-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['record-page-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
/** @type {__VLS_StyleScopedClasses['record-page-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-table']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projects: projects,
            editingId: editingId,
            keyword: keyword,
            dialogVisible: dialogVisible,
            evaluationStatusOptions: evaluationStatusOptions,
            form: form,
            selectedParties: selectedParties,
            totalAmount: totalAmount,
            filteredEvaluations: filteredEvaluations,
            getEvaluationStatusLabel: getEvaluationStatusLabel,
            resetForm: resetForm,
            openCreateDialog: openCreateDialog,
            handleDialogClose: handleDialogClose,
            recalculate: recalculate,
            addItem: addItem,
            handleProjectChange: handleProjectChange,
            loadEvaluations: loadEvaluations,
            submitEvaluation: submitEvaluation,
            fillEvaluation: fillEvaluation,
            removeEvaluation: removeEvaluation,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
