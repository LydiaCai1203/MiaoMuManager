import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createPrice, deletePrice, getPrices, updatePrice } from '../../api/price';
const prices = ref([]);
const editingId = ref(null);
const keyword = ref('');
const formRef = ref();
const defaultForm = () => ({
    assetCategory: 'SEEDLING',
    assetName: '桂花',
    specification: '胸径10cm',
    unit: '株',
    basePrice: 180,
    effectiveDate: '2026-05-10',
    expiryDate: '',
    remark: '',
});
const form = reactive(defaultForm());
const rules = {
    assetCategory: [{ required: true, message: '请输入资产分类', trigger: 'blur' }],
    assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
    specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
    unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
    basePrice: [{ required: true, message: '请输入基准价格', trigger: 'change' }],
    effectiveDate: [{ required: true, message: '请输入生效日期', trigger: 'blur' }],
};
const filteredPrices = computed(() => {
    const normalized = keyword.value.trim().toLowerCase();
    if (!normalized) {
        return prices.value;
    }
    return prices.value.filter((item) => {
        return [item.assetCategory, item.assetName, item.specification]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalized));
    });
});
function resetForm() {
    editingId.value = null;
    Object.assign(form, defaultForm());
    formRef.value?.clearValidate();
}
async function loadPrices() {
    const response = await getPrices();
    prices.value = response.data;
}
async function submitPrice() {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) {
        return;
    }
    if (editingId.value) {
        await updatePrice(editingId.value, form);
        ElMessage.success('价格项已更新');
    }
    else {
        await createPrice(form);
        ElMessage.success('价格项已创建');
    }
    resetForm();
    await loadPrices();
}
function fillPrice(record) {
    editingId.value = record.id;
    form.assetCategory = record.assetCategory;
    form.assetName = record.assetName;
    form.specification = record.specification ?? '';
    form.unit = record.unit ?? '';
    form.basePrice = Number(record.basePrice);
    form.effectiveDate = record.effectiveDate ?? '';
    form.expiryDate = record.expiryDate ?? '';
    form.remark = record.remark ?? '';
}
async function removePrice(id) {
    await ElMessageBox.confirm('删除后该价格项将从价格库中移除。', '确认删除价格项', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
    });
    await deletePrice(id);
    ElMessage.success('价格项已删除');
    await loadPrices();
}
onMounted(() => {
    loadPrices().catch(() => {
        ElMessage.error('价格列表加载失败');
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
(__VLS_ctx.editingId ? '编辑价格项' : '新增价格项');
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}));
const __VLS_2 = __VLS_1({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelPosition: "top",
    ...{ class: "grid-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_6 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
    label: "资产分类",
    prop: "assetCategory",
}));
const __VLS_8 = __VLS_7({
    label: "资产分类",
    prop: "assetCategory",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
const __VLS_10 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.form.assetCategory),
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.form.assetCategory),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
var __VLS_9;
const __VLS_14 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    label: "资产名称",
    prop: "assetName",
}));
const __VLS_16 = __VLS_15({
    label: "资产名称",
    prop: "assetName",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
const __VLS_18 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.form.assetName),
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.form.assetName),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
var __VLS_17;
const __VLS_22 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    label: "规格",
    prop: "specification",
}));
const __VLS_24 = __VLS_23({
    label: "规格",
    prop: "specification",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_25.slots.default;
const __VLS_26 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    modelValue: (__VLS_ctx.form.specification),
}));
const __VLS_28 = __VLS_27({
    modelValue: (__VLS_ctx.form.specification),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
var __VLS_25;
const __VLS_30 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    label: "单位",
    prop: "unit",
}));
const __VLS_32 = __VLS_31({
    label: "单位",
    prop: "unit",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
const __VLS_34 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.form.unit),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.form.unit),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
var __VLS_33;
const __VLS_38 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    label: "基准价格",
    prop: "basePrice",
}));
const __VLS_40 = __VLS_39({
    label: "基准价格",
    prop: "basePrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
const __VLS_42 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.form.basePrice),
    min: (0),
    precision: (2),
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.form.basePrice),
    min: (0),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
var __VLS_41;
const __VLS_46 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "生效日期",
    prop: "effectiveDate",
}));
const __VLS_48 = __VLS_47({
    label: "生效日期",
    prop: "effectiveDate",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.form.effectiveDate),
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.form.effectiveDate),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
var __VLS_49;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
const __VLS_54 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_56 = __VLS_55({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
let __VLS_58;
let __VLS_59;
let __VLS_60;
const __VLS_61 = {
    onClick: (__VLS_ctx.submitPrice)
};
__VLS_57.slots.default;
var __VLS_57;
const __VLS_62 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    ...{ 'onClick': {} },
}));
const __VLS_64 = __VLS_63({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_66;
let __VLS_67;
let __VLS_68;
const __VLS_69 = {
    onClick: (__VLS_ctx.resetForm)
};
__VLS_65.slots.default;
var __VLS_65;
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
const __VLS_70 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索分类/名称/规格",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_72 = __VLS_71({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索分类/名称/规格",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const __VLS_74 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_76 = __VLS_75({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_78;
let __VLS_79;
let __VLS_80;
const __VLS_81 = {
    onClick: (__VLS_ctx.loadPrices)
};
__VLS_77.slots.default;
var __VLS_77;
const __VLS_82 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    data: (__VLS_ctx.filteredPrices),
}));
const __VLS_84 = __VLS_83({
    data: (__VLS_ctx.filteredPrices),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_85.slots.default;
const __VLS_86 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    prop: "assetCategory",
    label: "分类",
    minWidth: "140",
}));
const __VLS_88 = __VLS_87({
    prop: "assetCategory",
    label: "分类",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
const __VLS_90 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    prop: "assetName",
    label: "名称",
    minWidth: "160",
}));
const __VLS_92 = __VLS_91({
    prop: "assetName",
    label: "名称",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const __VLS_94 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    prop: "specification",
    label: "规格",
    minWidth: "180",
}));
const __VLS_96 = __VLS_95({
    prop: "specification",
    label: "规格",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
const __VLS_98 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    prop: "unit",
    label: "单位",
    width: "100",
}));
const __VLS_100 = __VLS_99({
    prop: "unit",
    label: "单位",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
const __VLS_102 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    prop: "basePrice",
    label: "价格",
    width: "120",
}));
const __VLS_104 = __VLS_103({
    prop: "basePrice",
    label: "价格",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const __VLS_106 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    label: "操作",
    width: "120",
}));
const __VLS_108 = __VLS_107({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_109.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_110 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_112 = __VLS_111({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    let __VLS_114;
    let __VLS_115;
    let __VLS_116;
    const __VLS_117 = {
        onClick: (...[$event]) => {
            __VLS_ctx.fillPrice(scope.row);
        }
    };
    __VLS_113.slots.default;
    var __VLS_113;
    const __VLS_118 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_120 = __VLS_119({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    let __VLS_122;
    let __VLS_123;
    let __VLS_124;
    const __VLS_125 = {
        onClick: (...[$event]) => {
            __VLS_ctx.removePrice(scope.row.id);
        }
    };
    __VLS_121.slots.default;
    var __VLS_121;
}
var __VLS_109;
var __VLS_85;
/** @type {__VLS_StyleScopedClasses['project-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            editingId: editingId,
            keyword: keyword,
            formRef: formRef,
            form: form,
            rules: rules,
            filteredPrices: filteredPrices,
            resetForm: resetForm,
            loadPrices: loadPrices,
            submitPrice: submitPrice,
            fillPrice: fillPrice,
            removePrice: removePrice,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
