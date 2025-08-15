import { ref, computed } from 'vue'

// 功能类型定义
export interface FunctionType {
    value: string
    label: string
    description: string
    needsMask?: boolean
    needsExpand?: boolean
    needsUpscale?: boolean
    parameters?: string[]
}

// 功能类型配置
export const functionTypes: FunctionType[] = [
    {
        value: 'stylization_all',
        label: '整体风格化',
        description: '对整个图像应用统一的风格化效果',
        parameters: ['prompt', 'n']
    },
    {
        value: 'stylization_local',
        label: '局部风格化',
        description: '对图像的特定区域应用风格化效果',
        parameters: ['prompt', 'n']
    },
    {
        value: 'description_edit',
        label: '指令编辑',
        description: '根据文字描述修改图像内容',
        parameters: ['prompt', 'n']
    },
    {
        value: 'description_edit_with_mask',
        label: '局部重绘',
        description: '使用蒙版指定区域进行内容重绘',
        needsMask: true,
        parameters: ['prompt', 'maskUrl', 'n']
    },
    {
        value: 'inpainting',
        label: '图像修复',
        description: '修复图像中的缺陷或移除不需要的元素',
        needsMask: true,
        parameters: ['prompt', 'maskUrl', 'n']
    },
    {
        value: 'remove_watermark',
        label: '去文字水印',
        description: '移除图像中的文字水印',
        parameters: ['prompt', 'n']
    },
    {
        value: 'expand',
        label: '扩图',
        description: '扩展图像边界，增加画布尺寸',
        needsExpand: true,
        parameters: ['prompt', 'topScale', 'bottomScale', 'leftScale', 'rightScale', 'n']
    },
    {
        value: 'super_resolution',
        label: '图像超分',
        description: '提高图像分辨率和清晰度',
        needsUpscale: true,
        parameters: ['prompt', 'upscaleFactor', 'n']
    },
    {
        value: 'colorization',
        label: '图像上色',
        description: '为黑白图像添加颜色',
        parameters: ['prompt', 'n']
    },
    {
        value: 'doodle',
        label: '线稿生图',
        description: '基于线稿生成完整图像',
        parameters: ['prompt', 'n']
    },
    {
        value: 'control_cartoon_feature',
        label: '卡通形象控制',
        description: '控制卡通形象的生成特征',
        parameters: ['prompt', 'n']
    }
]

export function useFunctionTypes() {
    // 当前选择的功能类型
    const selectedFunctionType = ref<FunctionType>(functionTypes[0])

    // 根据值获取功能类型
    const getFunctionTypeByValue = (value: string): FunctionType | undefined => {
        return functionTypes.find(type => type.value === value)
    }

    // 获取所有功能类型
    const getAllFunctionTypes = () => functionTypes

    // 获取功能类型选项（用于select）
    const getFunctionTypeOptions = () => functionTypes.map(type => ({
        value: type.value,
        label: type.label
    }))

    // 检查当前功能类型是否需要蒙版
    const needsMask = computed(() => selectedFunctionType.value?.needsMask || false)

    // 检查当前功能类型是否需要扩图参数
    const needsExpand = computed(() => selectedFunctionType.value?.needsExpand || false)

    // 检查当前功能类型是否需要超分参数
    const needsUpscale = computed(() => selectedFunctionType.value?.needsUpscale || false)

    // 获取当前功能类型的参数列表
    const currentParameters = computed(() => selectedFunctionType.value?.parameters || [])

    // 设置功能类型
    const setFunctionType = (value: string) => {
        const type = getFunctionTypeByValue(value)
        if (type) {
            selectedFunctionType.value = type
        }
    }

    return {
        // 状态
        selectedFunctionType,

        // 计算属性
        needsMask,
        needsExpand,
        needsUpscale,
        currentParameters,

        // 方法
        getFunctionTypeByValue,
        getAllFunctionTypes,
        getFunctionTypeOptions,
        setFunctionType
    }
}
