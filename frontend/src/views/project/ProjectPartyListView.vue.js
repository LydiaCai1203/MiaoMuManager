import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getOptions } from '../../api/options';
import { createProjectParty, deleteProjectParty, getProjects, updateProjectParty, } from '../../api/project';
const projects = ref([]);
const parties = ref([]);
const editingPartyId = ref(null);
const keyword = ref('');
const projectFilter = ref(null);
const partyFormRef = ref();
const dialogVisible = ref(false);
const partyTypeOptions = ref([]);
const defaultPartyForm = () => ({
    projectId: 1,
    partyType: 'PERSON',
    partyName: '新增对象',
    idNo: '',
    contactPhone: '',
    villageGroup: '',
    locationText: '',
    tenantName: '',
    remark: '',
});
const partyForm = reactive(defaultPartyForm());
const partyRules = {
    projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    partyType: [{ required: true, message: '请选择对象类型', trigger: 'change' }],
    partyName: [{ required: true, message: '请输入对象名称', trigger: 'blur' }],
};
function getPartyTypeLabel(value) {
    return partyTypeOptions.value.find((item) => item.optionValue === value)?.optionLabel ?? value;
}
const filteredParties = computed(() => {
    const normalized = keyword.value.trim().toLowerCase();
    return parties.value.filter((item) => {
        const matchesProject = projectFilter.value == null || item.projectId === projectFilter.value;
        if (!matchesProject) {
            return false;
        }
        if (!normalized) {
            return true;
        }
        return [item.projectName, item.partyName, item.villageGroup, item.tenantName, item.locationText]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalized));
    });
});
function flattenParties(projectList) {
    parties.value = projectList.flatMap((project) => project.parties.map((party) => ({
        ...party,
        projectName: project.projectName,
        projectStatus: project.status,
    })));
}
function resetPartyForm() {
    editingPartyId.value = null;
    Object.assign(partyForm, defaultPartyForm());
    if (projects.value.length > 0) {
        partyForm.projectId = projects.value[0].id;
    }
    partyFormRef.value?.clearValidate();
}
function openCreateDialog() {
    resetPartyForm();
    dialogVisible.value = true;
}
function handleDialogClose() {
    dialogVisible.value = false;
    resetPartyForm();
}
async function loadProjects() {
    const response = await getProjects();
    projects.value = response.data;
    flattenParties(projects.value);
    if (projects.value.length > 0 && !projects.value.some((item) => item.id === partyForm.projectId)) {
        partyForm.projectId = projects.value[0].id;
    }
}
async function loadPartyTypeOptions() {
    const response = await getOptions('PARTY_TYPE');
    partyTypeOptions.value = response.data;
}
async function submitParty() {
    const valid = await partyFormRef.value?.validate().catch(() => false);
    if (!valid) {
        return;
    }
    const payload = {
        partyType: partyForm.partyType,
        partyName: partyForm.partyName,
        idNo: partyForm.idNo,
        contactPhone: partyForm.contactPhone,
        villageGroup: partyForm.villageGroup,
        tenantName: partyForm.tenantName,
        locationText: partyForm.locationText,
        remark: partyForm.remark,
    };
    if (editingPartyId.value) {
        await updateProjectParty(partyForm.projectId, editingPartyId.value, payload);
        ElMessage.success('评估对象已更新');
    }
    else {
        await createProjectParty(partyForm.projectId, payload);
        ElMessage.success('评估对象已新增');
    }
    dialogVisible.value = false;
    await loadProjects();
    resetPartyForm();
}
function fillParty(record) {
    dialogVisible.value = true;
    editingPartyId.value = record.id;
    partyForm.projectId = record.projectId;
    partyForm.partyType = record.partyType;
    partyForm.partyName = record.partyName;
    partyForm.idNo = record.idNo ?? '';
    partyForm.contactPhone = record.contactPhone ?? '';
    partyForm.villageGroup = record.villageGroup ?? '';
    partyForm.tenantName = record.tenantName ?? '';
    partyForm.locationText = record.locationText ?? '';
    partyForm.remark = record.remark ?? '';
}
async function removeParty(record) {
    await ElMessageBox.confirm('删除后该评估对象将从当前列表移除。', '确认删除评估对象', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
    });
    await deleteProjectParty(record.projectId, record.id);
    ElMessage.success('评估对象已删除');
    await loadProjects();
}
onMounted(() => {
    Promise.all([loadProjects(), loadPartyTypeOptions()]).catch(() => {
        ElMessage.error('评估对象页面初始化失败');
    });
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
const __VLS_8 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.projectFilter),
    clearable: true,
    placeholder: "按项目筛选",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.projectFilter),
    clearable: true,
    placeholder: "按项目筛选",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_12 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_14 = __VLS_13({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
var __VLS_11;
const __VLS_16 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索对象名称/村组/租户/位置",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索对象名称/村组/租户/位置",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
const __VLS_20 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.loadProjects)
};
__VLS_23.slots.default;
var __VLS_23;
const __VLS_28 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    data: (__VLS_ctx.filteredParties),
    rowKey: "id",
}));
const __VLS_30 = __VLS_29({
    data: (__VLS_ctx.filteredParties),
    rowKey: "id",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "projectName",
    label: "所属项目",
    minWidth: "180",
}));
const __VLS_34 = __VLS_33({
    prop: "projectName",
    label: "所属项目",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "partyName",
    label: "对象名称",
    minWidth: "160",
}));
const __VLS_38 = __VLS_37({
    prop: "partyName",
    label: "对象名称",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "对象类型",
    width: "120",
}));
const __VLS_42 = __VLS_41({
    label: "对象类型",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.getPartyTypeLabel(scope.row.partyType));
}
var __VLS_43;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "contactPhone",
    label: "联系电话",
    minWidth: "140",
}));
const __VLS_46 = __VLS_45({
    prop: "contactPhone",
    label: "联系电话",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "villageGroup",
    label: "村组",
    minWidth: "120",
}));
const __VLS_50 = __VLS_49({
    prop: "villageGroup",
    label: "村组",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    prop: "tenantName",
    label: "租户名称",
    minWidth: "140",
}));
const __VLS_54 = __VLS_53({
    prop: "tenantName",
    label: "租户名称",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    prop: "locationText",
    label: "位置",
    minWidth: "180",
}));
const __VLS_58 = __VLS_57({
    prop: "locationText",
    label: "位置",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "操作",
    width: "180",
}));
const __VLS_62 = __VLS_61({
    label: "操作",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_63.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_64 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillParty(scope.row);
        }
    };
    __VLS_67.slots.default;
    var __VLS_67;
    const __VLS_72 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_76;
    let __VLS_77;
    let __VLS_78;
    const __VLS_79 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeParty(scope.row);
        }
    };
    __VLS_75.slots.default;
    var __VLS_75;
}
var __VLS_63;
var __VLS_31;
const __VLS_80 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingPartyId ? '编辑评估对象' : '新增评估对象'),
    width: "760px",
    destroyOnClose: true,
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.editingPartyId ? '编辑评估对象' : '新增评估对象'),
    width: "760px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ref: "partyFormRef",
    model: (__VLS_ctx.partyForm),
    rules: (__VLS_ctx.partyRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_86 = __VLS_85({
    ref: "partyFormRef",
    model: (__VLS_ctx.partyForm),
    rules: (__VLS_ctx.partyRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
/** @type {typeof __VLS_ctx.partyFormRef} */ ;
var __VLS_88 = {};
__VLS_87.slots.default;
const __VLS_90 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    label: "所属项目",
    prop: "projectId",
}));
const __VLS_92 = __VLS_91({
    label: "所属项目",
    prop: "projectId",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
__VLS_93.slots.default;
const __VLS_94 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.partyForm.projectId),
    filterable: true,
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.partyForm.projectId),
    filterable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_98 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_100 = __VLS_99({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
}
var __VLS_97;
var __VLS_93;
const __VLS_102 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    label: "对象类型",
    prop: "partyType",
}));
const __VLS_104 = __VLS_103({
    label: "对象类型",
    prop: "partyType",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
__VLS_105.slots.default;
const __VLS_106 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    modelValue: (__VLS_ctx.partyForm.partyType),
}));
const __VLS_108 = __VLS_107({
    modelValue: (__VLS_ctx.partyForm.partyType),
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.partyTypeOptions))) {
    const __VLS_110 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        key: (item.optionValue),
        label: (item.optionLabel),
        value: (item.optionValue),
    }));
    const __VLS_112 = __VLS_111({
        key: (item.optionValue),
        label: (item.optionLabel),
        value: (item.optionValue),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
}
var __VLS_109;
var __VLS_105;
const __VLS_114 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    label: "对象名称",
    prop: "partyName",
}));
const __VLS_116 = __VLS_115({
    label: "对象名称",
    prop: "partyName",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    modelValue: (__VLS_ctx.partyForm.partyName),
}));
const __VLS_120 = __VLS_119({
    modelValue: (__VLS_ctx.partyForm.partyName),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
var __VLS_117;
const __VLS_122 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    label: "证件号码",
}));
const __VLS_124 = __VLS_123({
    label: "证件号码",
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
const __VLS_126 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    modelValue: (__VLS_ctx.partyForm.idNo),
}));
const __VLS_128 = __VLS_127({
    modelValue: (__VLS_ctx.partyForm.idNo),
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
var __VLS_125;
const __VLS_130 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    label: "联系电话",
}));
const __VLS_132 = __VLS_131({
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
__VLS_133.slots.default;
const __VLS_134 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.partyForm.contactPhone),
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.partyForm.contactPhone),
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
var __VLS_133;
const __VLS_138 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    label: "村组",
}));
const __VLS_140 = __VLS_139({
    label: "村组",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
const __VLS_142 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    modelValue: (__VLS_ctx.partyForm.villageGroup),
}));
const __VLS_144 = __VLS_143({
    modelValue: (__VLS_ctx.partyForm.villageGroup),
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
var __VLS_141;
const __VLS_146 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    label: "租户名称",
}));
const __VLS_148 = __VLS_147({
    label: "租户名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
const __VLS_150 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    modelValue: (__VLS_ctx.partyForm.tenantName),
}));
const __VLS_152 = __VLS_151({
    modelValue: (__VLS_ctx.partyForm.tenantName),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
var __VLS_149;
const __VLS_154 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    label: "位置",
}));
const __VLS_156 = __VLS_155({
    label: "位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    modelValue: (__VLS_ctx.partyForm.locationText),
}));
const __VLS_160 = __VLS_159({
    modelValue: (__VLS_ctx.partyForm.locationText),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
var __VLS_157;
var __VLS_87;
{
    const { footer: __VLS_thisSlot } = __VLS_83.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_162 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
        ...{ 'onClick': {} },
    }));
    const __VLS_164 = __VLS_163({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    let __VLS_166;
    let __VLS_167;
    let __VLS_168;
    const __VLS_169 = {
        onClick: (__VLS_ctx.handleDialogClose)
    };
    __VLS_165.slots.default;
    var __VLS_165;
    const __VLS_170 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        ...{ 'onClick': {} },
    }));
    const __VLS_172 = __VLS_171({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    let __VLS_174;
    let __VLS_175;
    let __VLS_176;
    const __VLS_177 = {
        onClick: (__VLS_ctx.resetPartyForm)
    };
    __VLS_173.slots.default;
    var __VLS_173;
    const __VLS_178 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_180 = __VLS_179({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    let __VLS_182;
    let __VLS_183;
    let __VLS_184;
    const __VLS_185 = {
        onClick: (__VLS_ctx.submitParty)
    };
    __VLS_181.slots.default;
    (__VLS_ctx.editingPartyId ? '保存对象' : '新增对象');
    var __VLS_181;
}
var __VLS_83;
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['list-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['list-filters']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_89 = __VLS_88;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projects: projects,
            editingPartyId: editingPartyId,
            keyword: keyword,
            projectFilter: projectFilter,
            partyFormRef: partyFormRef,
            dialogVisible: dialogVisible,
            partyTypeOptions: partyTypeOptions,
            partyForm: partyForm,
            partyRules: partyRules,
            getPartyTypeLabel: getPartyTypeLabel,
            filteredParties: filteredParties,
            resetPartyForm: resetPartyForm,
            openCreateDialog: openCreateDialog,
            handleDialogClose: handleDialogClose,
            loadProjects: loadProjects,
            submitParty: submitParty,
            fillParty: fillParty,
            removeParty: removeParty,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
