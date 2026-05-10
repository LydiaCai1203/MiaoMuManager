import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { downloadAppendageTemplate, downloadSeedlingTemplate, importAppendage, importSeedling } from '../../api/import';
import { getAppendageEvaluations } from '../../api/appendage';
import { getProjects } from '../../api/project';
import { getSeedlingEvaluations } from '../../api/seedling';
const projects = ref([]);
const selectedFile = ref(null);
const lastResult = ref(null);
const latestRecords = ref([]);
const form = reactive({
    type: 'seedling',
    projectId: 1,
    partyId: 1,
});
const selectedParties = computed(() => {
    return projects.value.find((project) => project.id === form.projectId)?.parties ?? [];
});
function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
async function handleDownloadSeedling() {
    const response = await downloadSeedlingTemplate();
    saveBlob(response, '苗木模板.xlsx');
}
async function handleDownloadAppendage() {
    const response = await downloadAppendageTemplate();
    saveBlob(response, '附属物评估模板.xlsx');
}
function handleProjectChange() {
    if (selectedParties.value.length > 0) {
        form.partyId = selectedParties.value[0].id;
    }
}
function handleFileChange(event) {
    const input = event.target;
    selectedFile.value = input.files?.[0] ?? null;
}
async function submitImport() {
    if (!selectedFile.value) {
        ElMessage.error('请先选择要导入的文件');
        return;
    }
    const formData = new FormData();
    formData.append('projectId', String(form.projectId));
    formData.append('partyId', String(form.partyId));
    formData.append('file', selectedFile.value);
    const response = form.type === 'seedling'
        ? await importSeedling(formData)
        : await importAppendage(formData);
    lastResult.value = response.data;
    latestRecords.value = form.type === 'seedling'
        ? (await getSeedlingEvaluations()).data.slice(0, 3)
        : (await getAppendageEvaluations()).data.slice(0, 3);
    ElMessage.success('导入成功');
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
onMounted(async () => {
    try {
        await loadProjects();
    }
    catch {
        ElMessage.error('导入中心初始化失败');
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.handleDownloadSeedling)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.handleDownloadAppendage)
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
const __VLS_16 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_18 = __VLS_17({
    model: (__VLS_ctx.form),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "导入类型",
}));
const __VLS_22 = __VLS_21({
    label: "导入类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.form.type),
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.form.type),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "苗木模板",
    value: "seedling",
}));
const __VLS_30 = __VLS_29({
    label: "苗木模板",
    value: "seedling",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "附属物模板",
    value: "appendage",
}));
const __VLS_34 = __VLS_33({
    label: "附属物模板",
    value: "appendage",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
var __VLS_27;
var __VLS_23;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "所属项目",
}));
const __VLS_38 = __VLS_37({
    label: "所属项目",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}));
const __VLS_42 = __VLS_41({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.projectId),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onChange: (__VLS_ctx.handleProjectChange)
};
__VLS_43.slots.default;
for (const [project] of __VLS_getVForSourceType((__VLS_ctx.projects))) {
    const __VLS_48 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }));
    const __VLS_50 = __VLS_49({
        key: (project.id),
        label: (project.projectName),
        value: (project.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
}
var __VLS_43;
var __VLS_39;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "被评估对象",
}));
const __VLS_54 = __VLS_53({
    label: "被评估对象",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.form.partyId),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.form.partyId),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
for (const [party] of __VLS_getVForSourceType((__VLS_ctx.selectedParties))) {
    const __VLS_60 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }));
    const __VLS_62 = __VLS_61({
        key: (party.id),
        label: (party.partyName),
        value: (party.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
}
var __VLS_59;
var __VLS_55;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "选择文件",
}));
const __VLS_66 = __VLS_65({
    label: "选择文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileChange) },
    type: "file",
    accept: ".xlsx",
});
var __VLS_67;
var __VLS_19;
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedFile),
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.selectedFile),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.submitImport)
};
__VLS_71.slots.default;
var __VLS_71;
if (__VLS_ctx.lastResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "import-result-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.lastResult.templateType);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.lastResult.createdCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.lastResult.message);
    if (__VLS_ctx.latestRecords.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "latest-records" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [record] of __VLS_getVForSourceType((__VLS_ctx.latestRecords))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (record.id),
            });
            (record.evaluationNo);
            (record.totalAmount);
            (record.status);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['import-result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['latest-records']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projects: projects,
            selectedFile: selectedFile,
            lastResult: lastResult,
            latestRecords: latestRecords,
            form: form,
            selectedParties: selectedParties,
            handleDownloadSeedling: handleDownloadSeedling,
            handleDownloadAppendage: handleDownloadAppendage,
            handleProjectChange: handleProjectChange,
            handleFileChange: handleFileChange,
            submitImport: submitImport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
