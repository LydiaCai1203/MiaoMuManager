import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createProject, createProjectParty, deleteProject, getProjects, updateProject } from '../../api/project';
const projects = ref([]);
const editingProjectId = ref(null);
const projectKeyword = ref('');
const projectFormRef = ref();
const partyFormRef = ref();
const defaultProjectForm = () => ({
    projectCode: 'PRJ20260510002',
    projectName: '新建资产评估项目',
    projectType: 'LAND_ACQUISITION',
    entrustingParty: '委托方示例',
    regionName: '金华市',
    benchmarkDate: '2026-05-10',
    surveyDate: '2026-05-10',
    status: 'DRAFT',
    remark: '',
});
const projectForm = reactive(defaultProjectForm());
const partyForm = reactive({
    projectId: 1,
    partyType: 'PERSON',
    partyName: '新增对象',
    villageGroup: '',
    locationText: '',
    tenantName: '',
    remark: '',
});
const projectRules = {
    projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    projectType: [{ required: true, message: '请输入项目类型', trigger: 'blur' }],
    entrustingParty: [{ required: true, message: '请输入委托方', trigger: 'blur' }],
    regionName: [{ required: true, message: '请输入所属区域', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};
const partyRules = {
    projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    partyType: [{ required: true, message: '请选择对象类型', trigger: 'change' }],
    partyName: [{ required: true, message: '请输入对象名称', trigger: 'blur' }],
};
const filteredProjects = computed(() => {
    const keyword = projectKeyword.value.trim().toLowerCase();
    if (!keyword) {
        return projects.value;
    }
    return projects.value.filter((project) => {
        return [project.projectCode, project.projectName, project.regionName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
    });
});
function resetProjectForm() {
    editingProjectId.value = null;
    Object.assign(projectForm, defaultProjectForm());
    projectFormRef.value?.clearValidate();
}
async function loadProjects() {
    const response = await getProjects();
    projects.value = response.data;
    if (projects.value.length > 0 && !projects.value.some((item) => item.id === partyForm.projectId)) {
        partyForm.projectId = projects.value[0].id;
    }
}
async function submitProject() {
    const valid = await projectFormRef.value?.validate().catch(() => false);
    if (!valid) {
        return;
    }
    if (editingProjectId.value) {
        await updateProject(editingProjectId.value, projectForm);
        ElMessage.success('项目已更新');
    }
    else {
        await createProject(projectForm);
        ElMessage.success('项目已创建');
    }
    resetProjectForm();
    await loadProjects();
}
function fillProject(project) {
    editingProjectId.value = project.id;
    projectForm.projectCode = project.projectCode;
    projectForm.projectName = project.projectName;
    projectForm.projectType = project.projectType;
    projectForm.entrustingParty = project.entrustingParty ?? '';
    projectForm.regionName = project.regionName ?? '';
    projectForm.benchmarkDate = project.benchmarkDate ?? '';
    projectForm.surveyDate = project.surveyDate ?? '';
    projectForm.status = project.status;
    projectForm.remark = project.remark ?? '';
}
async function removeProject(id) {
    await ElMessageBox.confirm('删除后项目及其对象数据将不可在列表中继续操作。', '确认删除项目', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
    });
    await deleteProject(id);
    ElMessage.success('项目已删除');
    await loadProjects();
}
async function submitParty() {
    const valid = await partyFormRef.value?.validate().catch(() => false);
    if (!valid) {
        return;
    }
    await createProjectParty(partyForm.projectId, {
        partyType: partyForm.partyType,
        partyName: partyForm.partyName,
        villageGroup: partyForm.villageGroup,
        locationText: partyForm.locationText,
        tenantName: partyForm.tenantName,
        remark: partyForm.remark,
    });
    ElMessage.success('对象已新增');
    partyFormRef.value?.resetFields();
    await loadProjects();
}
onMounted(() => {
    loadProjects().catch(() => {
        ElMessage.error('项目加载失败');
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
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.editingProjectId ? '编辑项目' : '新建项目');
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "projectFormRef",
    model: (__VLS_ctx.projectForm),
    rules: (__VLS_ctx.projectRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_2 = __VLS_1({
    ref: "projectFormRef",
    model: (__VLS_ctx.projectForm),
    rules: (__VLS_ctx.projectRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.projectFormRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_6 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    label: "项目编号",
    prop: "projectCode",
}));
const __VLS_8 = __VLS_7({
    label: "项目编号",
    prop: "projectCode",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
const __VLS_10 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.projectForm.projectCode),
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.projectForm.projectCode),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
var __VLS_9;
const __VLS_14 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    label: "项目名称",
    prop: "projectName",
}));
const __VLS_16 = __VLS_15({
    label: "项目名称",
    prop: "projectName",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.projectForm.projectName),
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.projectForm.projectName),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
const __VLS_22 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    label: "项目类型",
    prop: "projectType",
}));
const __VLS_24 = __VLS_23({
    label: "项目类型",
    prop: "projectType",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.projectForm.projectType),
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.projectForm.projectType),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    label: "委托方",
    prop: "entrustingParty",
}));
const __VLS_32 = __VLS_31({
    label: "委托方",
    prop: "entrustingParty",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.projectForm.entrustingParty),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.projectForm.entrustingParty),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
var __VLS_33;
const __VLS_38 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    label: "所属区域",
    prop: "regionName",
}));
const __VLS_40 = __VLS_39({
    label: "所属区域",
    prop: "regionName",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.projectForm.regionName),
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.projectForm.regionName),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_41;
const __VLS_46 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "状态",
    prop: "status",
}));
const __VLS_48 = __VLS_47({
    label: "状态",
    prop: "status",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.projectForm.status),
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.projectForm.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
const __VLS_54 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    label: "草稿",
    value: "DRAFT",
}));
const __VLS_56 = __VLS_55({
    label: "草稿",
    value: "DRAFT",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
const __VLS_58 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    label: "进行中",
    value: "ACTIVE",
}));
const __VLS_60 = __VLS_59({
    label: "进行中",
    value: "ACTIVE",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const __VLS_62 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    label: "已归档",
    value: "ARCHIVED",
}));
const __VLS_64 = __VLS_63({
    label: "已归档",
    value: "ARCHIVED",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
var __VLS_53;
var __VLS_49;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_66 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_68 = __VLS_67({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
let __VLS_70;
let __VLS_71;
let __VLS_72;
const __VLS_73 = {
    onClick: (__VLS_ctx.submitProject)
};
__VLS_69.slots.default;
(__VLS_ctx.editingProjectId ? '保存项目' : '创建项目');
var __VLS_69;
const __VLS_74 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    ...{ 'onClick': {} },
}));
const __VLS_76 = __VLS_75({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_78;
let __VLS_79;
let __VLS_80;
const __VLS_81 = {
    onClick: (__VLS_ctx.resetProjectForm)
};
__VLS_77.slots.default;
var __VLS_77;
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
const __VLS_82 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    modelValue: (__VLS_ctx.projectKeyword),
    placeholder: "搜索项目编号/名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_84 = __VLS_83({
    modelValue: (__VLS_ctx.projectKeyword),
    placeholder: "搜索项目编号/名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const __VLS_86 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_88 = __VLS_87({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_90;
let __VLS_91;
let __VLS_92;
const __VLS_93 = {
    onClick: (__VLS_ctx.loadProjects)
};
__VLS_89.slots.default;
var __VLS_89;
const __VLS_94 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    data: (__VLS_ctx.filteredProjects),
    rowKey: "id",
}));
const __VLS_96 = __VLS_95({
    data: (__VLS_ctx.filteredProjects),
    rowKey: "id",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_97.slots.default;
const __VLS_98 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    prop: "projectCode",
    label: "项目编号",
    minWidth: "160",
}));
const __VLS_100 = __VLS_99({
    prop: "projectCode",
    label: "项目编号",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
const __VLS_102 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    prop: "projectName",
    label: "项目名称",
    minWidth: "220",
}));
const __VLS_104 = __VLS_103({
    prop: "projectName",
    label: "项目名称",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const __VLS_106 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    prop: "projectType",
    label: "项目类型",
    minWidth: "140",
}));
const __VLS_108 = __VLS_107({
    prop: "projectType",
    label: "项目类型",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const __VLS_110 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    prop: "regionName",
    label: "区域",
    minWidth: "140",
}));
const __VLS_112 = __VLS_111({
    prop: "regionName",
    label: "区域",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const __VLS_114 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    prop: "status",
    label: "状态",
    minWidth: "120",
}));
const __VLS_116 = __VLS_115({
    prop: "status",
    label: "状态",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
const __VLS_118 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    label: "对象数",
    minWidth: "100",
}));
const __VLS_120 = __VLS_119({
    label: "对象数",
    minWidth: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_121.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    (scope.row.parties.length);
}
var __VLS_121;
const __VLS_122 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    label: "操作",
    width: "180",
}));
const __VLS_124 = __VLS_123({
    label: "操作",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_125.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_126 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_128 = __VLS_127({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    let __VLS_130;
    let __VLS_131;
    let __VLS_132;
    const __VLS_133 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillProject(scope.row);
        }
    };
    __VLS_129.slots.default;
    var __VLS_129;
    const __VLS_134 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_136 = __VLS_135({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    let __VLS_138;
    let __VLS_139;
    let __VLS_140;
    const __VLS_141 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removeProject(scope.row.id);
        }
    };
    __VLS_137.slots.default;
    var __VLS_137;
}
var __VLS_125;
var __VLS_97;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_142 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
    ref: "partyFormRef",
    model: (__VLS_ctx.partyForm),
    rules: (__VLS_ctx.partyRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_144 = __VLS_143({
    ref: "partyFormRef",
    model: (__VLS_ctx.partyForm),
    rules: (__VLS_ctx.partyRules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
/** @type {typeof __VLS_ctx.partyFormRef} */ ;
var __VLS_146 = {};
__VLS_145.slots.default;
const __VLS_148 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "所属项目",
    prop: "projectId",
}));
const __VLS_150 = __VLS_149({
    label: "所属项目",
    prop: "projectId",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.partyForm.projectId),
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.partyForm.projectId),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_156 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_158 = __VLS_157({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
}
var __VLS_155;
var __VLS_151;
const __VLS_160 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    label: "对象类型",
    prop: "partyType",
}));
const __VLS_162 = __VLS_161({
    label: "对象类型",
    prop: "partyType",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.partyForm.partyType),
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.partyForm.partyType),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    label: "个人",
    value: "PERSON",
}));
const __VLS_170 = __VLS_169({
    label: "个人",
    value: "PERSON",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const __VLS_172 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "单位",
    value: "ORGANIZATION",
}));
const __VLS_174 = __VLS_173({
    label: "单位",
    value: "ORGANIZATION",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    label: "租户",
    value: "TENANT",
}));
const __VLS_178 = __VLS_177({
    label: "租户",
    value: "TENANT",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "村组",
    value: "VILLAGE_GROUP",
}));
const __VLS_182 = __VLS_181({
    label: "村组",
    value: "VILLAGE_GROUP",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const __VLS_184 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    label: "其他",
    value: "OTHER",
}));
const __VLS_186 = __VLS_185({
    label: "其他",
    value: "OTHER",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_167;
var __VLS_163;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "对象名称",
    prop: "partyName",
}));
const __VLS_190 = __VLS_189({
    label: "对象名称",
    prop: "partyName",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.partyForm.partyName),
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.partyForm.partyName),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "村组",
}));
const __VLS_198 = __VLS_197({
    label: "村组",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.partyForm.villageGroup),
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.partyForm.villageGroup),
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_199;
const __VLS_204 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    label: "位置",
}));
const __VLS_206 = __VLS_205({
    label: "位置",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    modelValue: (__VLS_ctx.partyForm.locationText),
}));
const __VLS_210 = __VLS_209({
    modelValue: (__VLS_ctx.partyForm.locationText),
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
var __VLS_207;
const __VLS_212 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    label: "租户名称",
}));
const __VLS_214 = __VLS_213({
    label: "租户名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.partyForm.tenantName),
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.partyForm.tenantName),
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
var __VLS_215;
var __VLS_145;
const __VLS_220 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_222 = __VLS_221({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
let __VLS_224;
let __VLS_225;
let __VLS_226;
const __VLS_227 = {
    onClick: (__VLS_ctx.submitParty)
};
__VLS_223.slots.default;
var __VLS_223;
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4, __VLS_147 = __VLS_146;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projects: projects,
            editingProjectId: editingProjectId,
            projectKeyword: projectKeyword,
            projectFormRef: projectFormRef,
            partyFormRef: partyFormRef,
            projectForm: projectForm,
            partyForm: partyForm,
            projectRules: projectRules,
            partyRules: partyRules,
            filteredProjects: filteredProjects,
            resetProjectForm: resetProjectForm,
            loadProjects: loadProjects,
            submitProject: submitProject,
            fillProject: fillProject,
            removeProject: removeProject,
            submitParty: submitParty,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
