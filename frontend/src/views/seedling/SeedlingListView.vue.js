import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProjects } from '../../api/project';
import { createSeedlingEvaluation, deleteSeedlingEvaluation, getSeedlingEvaluations, updateSeedlingEvaluation } from '../../api/seedling';
const projects = ref([]);
const evaluations = ref([]);
const editingId = ref(null);
const keyword = ref('');
const defaultItem = () => ({
    lineNo: 1,
    seedlingName: '桂花',
    specification: '胸径 8cm',
    unit: '株',
    quantity: 10,
    unitPrice: 120,
    amount: 1200,
});
const defaultForm = () => ({
    projectId: 1,
    partyId: 1,
    evaluationNo: 'SE20260510001',
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
const totalAmount = computed(() => {
    return form.items.reduce((sum, item) => sum + item.amount, 0);
});
const filteredEvaluations = computed(() => {
    const normalized = keyword.value.trim().toLowerCase();
    if (!normalized) {
        return evaluations.value;
    }
    return evaluations.value.filter((item) => String(item.evaluationNo ?? '').toLowerCase().includes(normalized));
});
function resetForm() {
    editingId.value = null;
    Object.assign(form, defaultForm());
    handleProjectChange();
}
function recalculate(item) {
    item.amount = Number((item.quantity * item.unitPrice).toFixed(2));
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
    const response = await getSeedlingEvaluations();
    evaluations.value = response.data;
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
        ElMessage.warning('请至少填写一条苗木明细');
        return;
    }
    const invalidItem = form.items.find((item) => !item.seedlingName.trim() || !item.unit.trim() || item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidItem) {
        ElMessage.warning('每条苗木明细都需要填写名称、单位，且数量和单价大于 0');
        return;
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
    };
    if (editingId.value) {
        await updateSeedlingEvaluation(editingId.value, payload);
        ElMessage.success('苗木评估单已更新');
    }
    else {
        await createSeedlingEvaluation(payload);
        ElMessage.success('苗木评估单已保存');
    }
    resetForm();
    await loadEvaluations();
}
function fillEvaluation(record) {
    editingId.value = record.id;
    form.projectId = record.projectId;
    form.partyId = record.partyId;
    form.evaluationNo = record.evaluationNo;
    form.benchmarkDate = record.benchmarkDate ?? '';
    form.surveyDate = record.surveyDate ?? '';
    form.status = record.status;
    form.remark = record.remark ?? '';
    form.items = record.items.map((item) => ({
        lineNo: item.lineNo,
        seedlingName: item.seedlingName,
        specification: item.specification ?? '',
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
    }));
}
async function removeEvaluation(id) {
    await ElMessageBox.confirm('删除后该苗木评估单将从当前列表移除。', '确认删除苗木评估单', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
    });
    await deleteSeedlingEvaluation(id);
    ElMessage.success('苗木评估单已删除');
    await loadEvaluations();
}
onMounted(async () => {
    try {
        await loadProjects();
        await loadEvaluations();
    }
    catch {
        ElMessage.error('苗木评估页面初始化失败');
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
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.editingId ? '编辑苗木评估单' : '新建苗木评估单');
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    label: "所属项目",
}));
const __VLS_6 = __VLS_5({
    label: "所属项目",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onChange: (__VLS_ctx.handleProjectChange)
};
__VLS_11.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_16 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_18 = __VLS_17({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
}
var __VLS_11;
var __VLS_7;
const __VLS_20 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "被评估对象",
}));
const __VLS_22 = __VLS_21({
    label: "被评估对象",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.form.partyId),
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.form.partyId),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
for (const [party] of __VLS_getVForSourceType((__VLS_ctx.selectedParties))) {
    const __VLS_28 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }));
    const __VLS_30 = __VLS_29({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_27;
var __VLS_23;
const __VLS_32 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "评估单编号",
}));
const __VLS_34 = __VLS_33({
    label: "评估单编号",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.form.evaluationNo),
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.form.evaluationNo),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
var __VLS_35;
const __VLS_40 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "评估基准日",
}));
const __VLS_42 = __VLS_41({
    label: "评估基准日",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.form.benchmarkDate),
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.form.benchmarkDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
const __VLS_48 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "现场勘察日",
}));
const __VLS_50 = __VLS_49({
    label: "现场勘察日",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.form.surveyDate),
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.form.surveyDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "状态",
}));
const __VLS_58 = __VLS_57({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "草稿",
    value: "DRAFT",
}));
const __VLS_66 = __VLS_65({
    label: "草稿",
    value: "DRAFT",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "已提交",
    value: "SUBMITTED",
}));
const __VLS_70 = __VLS_69({
    label: "已提交",
    value: "SUBMITTED",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_63;
var __VLS_59;
var __VLS_3;
const __VLS_72 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    data: (__VLS_ctx.form.items),
    ...{ class: "section-table" },
}));
const __VLS_74 = __VLS_73({
    data: (__VLS_ctx.form.items),
    ...{ class: "section-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "序号",
    width: "80",
}));
const __VLS_78 = __VLS_77({
    label: "序号",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_79.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_80 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        modelValue: (scope.row.lineNo),
        min: (1),
    }));
    const __VLS_82 = __VLS_81({
        modelValue: (scope.row.lineNo),
        min: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
}
var __VLS_79;
const __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "苗木名称",
    minWidth: "180",
}));
const __VLS_86 = __VLS_85({
    label: "苗木名称",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_87.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_88 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        modelValue: (scope.row.seedlingName),
    }));
    const __VLS_90 = __VLS_89({
        modelValue: (scope.row.seedlingName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
}
var __VLS_87;
const __VLS_92 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "规格",
    minWidth: "180",
}));
const __VLS_94 = __VLS_93({
    label: "规格",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_95.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_96 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        modelValue: (scope.row.specification),
    }));
    const __VLS_98 = __VLS_97({
        modelValue: (scope.row.specification),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
}
var __VLS_95;
const __VLS_100 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "单位",
    width: "120",
}));
const __VLS_102 = __VLS_101({
    label: "单位",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_103.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_104 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        modelValue: (scope.row.unit),
    }));
    const __VLS_106 = __VLS_105({
        modelValue: (scope.row.unit),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
}
var __VLS_103;
const __VLS_108 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "数量",
    width: "140",
}));
const __VLS_110 = __VLS_109({
    label: "数量",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_111.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_112 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        ...{ 'onChange': {} },
        modelValue: (scope.row.quantity),
        min: (0),
        precision: (2),
    }));
    const __VLS_114 = __VLS_113({
        ...{ 'onChange': {} },
        modelValue: (scope.row.quantity),
        min: (0),
        precision: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_116;
    let __VLS_117;
    let __VLS_118;
    const __VLS_119 = {
        onChange: (...[$event]) => {
            __VLS_ctx.recalculate(scope.row);
        }
    };
    var __VLS_115;
}
var __VLS_111;
const __VLS_120 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "单价",
    width: "140",
}));
const __VLS_122 = __VLS_121({
    label: "单价",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_123.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_124 = {}.ElInputNumber;
    /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        ...{ 'onChange': {} },
        modelValue: (scope.row.unitPrice),
        min: (0),
        precision: (2),
    }));
    const __VLS_126 = __VLS_125({
        ...{ 'onChange': {} },
        modelValue: (scope.row.unitPrice),
        min: (0),
        precision: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    let __VLS_128;
    let __VLS_129;
    let __VLS_130;
    const __VLS_131 = {
        onChange: (...[$event]) => {
            __VLS_ctx.recalculate(scope.row);
        }
    };
    var __VLS_127;
}
var __VLS_123;
const __VLS_132 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "金额",
    width: "140",
}));
const __VLS_134 = __VLS_133({
    label: "金额",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_135.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (scope.row.amount.toFixed(2));
}
var __VLS_135;
var __VLS_75;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_136 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    ...{ 'onClick': {} },
}));
const __VLS_138 = __VLS_137({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_140;
let __VLS_141;
let __VLS_142;
const __VLS_143 = {
    onClick: (__VLS_ctx.addItem)
};
__VLS_139.slots.default;
var __VLS_139;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-text" },
});
(__VLS_ctx.totalAmount.toFixed(2));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_144 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_146 = __VLS_145({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onClick: (__VLS_ctx.submitEvaluation)
};
__VLS_147.slots.default;
var __VLS_147;
const __VLS_152 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ 'onClick': {} },
}));
const __VLS_154 = __VLS_153({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_156;
let __VLS_157;
let __VLS_158;
const __VLS_159 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_155.slots.default;
var __VLS_155;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_160 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索评估单编号",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索评估单编号",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
const __VLS_164 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_166 = __VLS_165({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_168;
let __VLS_169;
let __VLS_170;
const __VLS_171 = {
    onClick: (__VLS_ctx.loadEvaluations)
};
__VLS_167.slots.default;
var __VLS_167;
const __VLS_172 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    data: (__VLS_ctx.filteredEvaluations),
}));
const __VLS_174 = __VLS_173({
    data: (__VLS_ctx.filteredEvaluations),
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    prop: "evaluationNo",
    label: "评估单编号",
    minWidth: "180",
}));
const __VLS_178 = __VLS_177({
    prop: "evaluationNo",
    label: "评估单编号",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    prop: "projectId",
    label: "项目 ID",
    width: "100",
}));
const __VLS_182 = __VLS_181({
    prop: "projectId",
    label: "项目 ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const __VLS_184 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    prop: "partyId",
    label: "对象 ID",
    width: "100",
}));
const __VLS_186 = __VLS_185({
    prop: "partyId",
    label: "对象 ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const __VLS_188 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    prop: "totalAmount",
    label: "总金额",
    width: "120",
}));
const __VLS_190 = __VLS_189({
    prop: "totalAmount",
    label: "总金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
const __VLS_192 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_194 = __VLS_193({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
const __VLS_196 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "操作",
    width: "180",
}));
const __VLS_198 = __VLS_197({
    label: "操作",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_199.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_200 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_204;
    let __VLS_205;
    let __VLS_206;
    const __VLS_207 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillEvaluation(scope.row);
        }
    };
    __VLS_203.slots.default;
    var __VLS_203;
    const __VLS_208 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_210 = __VLS_209({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    let __VLS_212;
    let __VLS_213;
    let __VLS_214;
    const __VLS_215 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeEvaluation(scope.row.id);
        }
    };
    __VLS_211.slots.default;
    var __VLS_211;
}
var __VLS_199;
var __VLS_175;
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-table']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projects: projects,
            editingId: editingId,
            keyword: keyword,
            form: form,
            selectedParties: selectedParties,
            totalAmount: totalAmount,
            filteredEvaluations: filteredEvaluations,
            resetForm: resetForm,
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
