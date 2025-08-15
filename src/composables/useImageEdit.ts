import { ref, computed, watch } from 'vue'
import { actions } from 'astro:actions'
import { useLocalStorage } from './useLocalStorage'
import { useFunctionTypes } from './useFunctionTypes'

// 任务类型定义
export interface ImageEditTask {
    id: string
    prompt: string
    functionType: string
    timestamp: number
    status: 'pending' | 'completed' | 'failed'
    result?: string
}

export function useImageEdit(defaultFunctionType?: string) {
    // 使用功能类型管理
    const {
        selectedFunctionType,
        needsMask,
        needsExpand,
        needsUpscale,
        getFunctionTypeOptions,
        getFunctionTypeDisplayName,
        setFunctionType
    } = useFunctionTypes()

    // 响应式数据
    const imageInputType = ref('url')
    const imageUrl = ref('')
    const imageBase64 = ref('')
    const imageFile = ref<File | null>(null)
    const prompt = ref('')
    const functionType = ref(defaultFunctionType || 'stylization_all')
    const maskUrl = ref('')
    const topScale = ref(1.5)
    const bottomScale = ref(1.5)
    const leftScale = ref(1.5)
    const rightScale = ref(1.5)
    const upscaleFactor = ref(2)
    const n = ref(1)

    // 预设编辑指令
    const presetPrompts = ref([
        { label: '请选择预设指令', value: '' },
        { label: '油画风格', value: '将图片转换为油画风格，使用丰富的色彩和笔触效果' },
        { label: '素描风格', value: '将图片转换为黑白素描风格，突出线条和明暗对比' },
        { label: '卡通风格', value: '将图片转换为可爱的卡通风格，使用鲜艳的色彩和圆润的线条' },
        { label: '水彩画风格', value: '将图片转换为水彩画风格，使用柔和的色彩和流动的笔触' },
        { label: '复古风格', value: '将图片转换为复古风格，使用怀旧的色调和纹理' },
        { label: '科幻风格', value: '将图片转换为科幻风格，使用未来感的色彩和光效' },
        { label: '梦幻风格', value: '将图片转换为梦幻风格，使用柔和的色彩和梦幻的光影效果' },
        { label: '黑白风格', value: '将图片转换为经典的黑白风格，突出对比度和层次感' },
        { label: '极简风格', value: '将图片转换为极简风格，使用简洁的线条和纯净的色彩' },
        { label: '抽象风格', value: '将图片转换为抽象风格，使用几何形状和抽象的色彩组合' },
        { label: '写实风格', value: '将图片转换为超写实风格，增强细节和真实感' },
        { label: '动漫风格', value: '将图片转换为日式动漫风格，使用动漫特有的色彩和线条' },
        { label: '像素风格', value: '将图片转换为像素风格，使用复古的像素化效果' },
        { label: '手绘风格', value: '将图片转换为手绘风格，模拟手工绘画的质感和笔触' }
    ])

    // 计算属性：是否显示预设指令
    const showPresetPrompts = computed(() => {
        return functionType.value === 'stylization_all' || functionType.value === 'control_cartoon_feature'
    })

    // 计算属性：获取当前功能类型对应的预设指令
    const currentPresetPrompts = computed(() => {
        if (functionType.value === 'control_cartoon_feature') {
            return cartoonPresetPrompts.value
        }
        return presetPrompts.value
    })

    // 卡通形象控制预设指令
    const cartoonPresetPrompts = ref([
        { label: '请选择预设指令', value: '' },
        { label: '森林探险', value: '卡通形象在森林中探险，周围有高大的树木和神秘的光线，手持探险装备' },
        { label: '海边夕阳', value: '卡通形象坐在海边，看着夕阳西下，海鸥在天空中飞翔，海风轻拂' },
        { label: '厨房做蛋糕', value: '卡通形象在厨房里做蛋糕，穿着围裙，周围有各种食材和烘焙工具' },
        { label: '开心笑容', value: '卡通形象露出开心的笑容，眼睛闪闪发光，周围有爱心和星星' },
        { label: '跳舞场景', value: '卡通形象在跳舞，穿着漂亮的舞裙，周围有音符飘舞，舞台灯光闪耀' },
        { label: '荡秋千', value: '卡通形象坐在秋千上，快乐地荡秋千，头发随风飘扬，背景是公园' },
        { label: '超级英雄', value: '卡通形象穿着超级英雄的服装，披风飘扬，准备拯救世界，充满正义感' },
        { label: '魔法师', value: '卡通形象戴着魔法帽，手持魔法杖，周围有魔法光芒和神秘符文' },
        { label: '公主装扮', value: '卡通形象戴着皇冠，穿着公主裙，坐在宝座上，周围有华丽的装饰' },
        { label: '童话城堡', value: '卡通形象在童话城堡中，周围有魔法生物，天空中有彩虹，充满梦幻色彩' },
        { label: '洞穴探险', value: '卡通形象在神秘洞穴中探险，手持火把，周围有古老的壁画和神秘符号' },
        { label: '图书馆看书', value: '卡通形象在图书馆里看书，坐在舒适的椅子上，周围有书架和温暖的灯光' },
        { label: '太空冒险', value: '卡通形象在太空中冒险，穿着宇航服，周围有星星和行星，充满科幻感' },
        { label: '海底世界', value: '卡通形象在海底世界，穿着潜水服，周围有珊瑚、鱼群和海底生物' },
        { label: '雪山滑雪', value: '卡通形象在雪山上滑雪，穿着滑雪装备，周围有白雪皑皑的山峰' },
        { label: '城市夜景', value: '卡通形象在城市夜景中，站在高楼顶端，周围有霓虹灯和繁华的街道' },
        { label: '花园野餐', value: '卡通形象在美丽的花园中野餐，坐在草地上，周围有鲜花和蝴蝶' },
        { label: '音乐演奏', value: '卡通形象在演奏乐器，穿着演出服装，周围有音符和舞台灯光' },
        { label: '运动健身', value: '卡通形象在健身房运动，穿着运动服装，周围有健身器材和激励标语' },
        { label: '学校课堂', value: '卡通形象在学校课堂上，坐在课桌前，周围有黑板、书本和学习用品' }
    ])
    // 使用本地存储管理API密钥、编辑指令和任务历史
    const { storedValue: dashScopeApiKey } = useLocalStorage('dashScopeApiKey', '')
    const { storedValue: storedPrompt } = useLocalStorage('imageEditPrompt', '')
    const { storedValue: taskHistory } = useLocalStorage('imageEditTaskHistory', [] as ImageEditTask[])

    // 初始化编辑指令
    if (storedPrompt.value && !prompt.value) {
        prompt.value = storedPrompt.value
    }
    // 简化状态管理，不使用useAsyncState
    const isSubmitting = ref(false)
    const showResult = ref(false)
    const result = ref({
        success: false,
        taskId: '',
        message: '',
        images: [] as string[]
    })

    // 文件处理
    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement
        if (target.files && target.files[0]) {
            imageFile.value = target.files[0]
        }
    }

    // 将文件转换为base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result)
                } else {
                    reject(new Error('文件读取失败'))
                }
            }
            reader.onerror = () => reject(new Error('文件读取错误'))
            reader.readAsDataURL(file)
        })
    }

    // 调用图像编辑API
    const callImageEditAction = async (params: any) => {
        try {
            // 调用图像编辑 Action
            const { data, error } = await actions.imageEditAction({
                imageUrl: params.imageUrl,
                prompt: params.prompt,
                function: params.function,
                maskUrl: params.maskUrl,
                n: params.n,
                topScale: params.topScale,
                bottomScale: params.bottomScale,
                leftScale: params.leftScale,
                rightScale: params.rightScale,
                upscaleFactor: params.upscaleFactor,
                model: params.model,
                dashScopeApiKey: params.dashScopeApiKey,
            })

            if (error) {
                return {
                    success: false,
                    message: `调用失败: ${error.message ?? '未知错误'}`,
                    images: [] as string[]
                }
            }

            return {
                success: data.success,
                taskId: data.taskId || '',
                message: data.message || '图像编辑任务已提交，正在处理中...',
                images: [] // 图像编辑任务提交后，图片需要查询状态获取
            }
        } catch (error) {
            return {
                success: false,
                message: `调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
                images: [] as string[]
            }
        }
    }

    // 提交编辑任务
    const submitEditTask = async () => {
        // 验证图片输入
        let finalImageInput = ''
        if (imageInputType.value === 'url') {
            if (!imageUrl.value) {
                alert('请填写图片URL')
                return
            }
            finalImageInput = imageUrl.value
            console.log('使用URL输入:', finalImageInput)
        } else if (imageInputType.value === 'base64') {
            if (!imageBase64.value) {
                alert('请填写base64图片数据')
                return
            }
            finalImageInput = imageBase64.value
            console.log('使用Base64输入:', finalImageInput)
        } else if (imageInputType.value === 'file') {
            if (!imageFile.value) {
                alert('请选择图片文件')
                return
            }
            // 处理文件上传，转换为base64
            try {
                finalImageInput = await fileToBase64(imageFile.value)
                console.log('文件转换为Base64成功')
            } catch (error) {
                alert('文件处理失败: ' + error)
                return
            }
        }

        if (!prompt.value) {
            alert('请填写编辑指令')
            return
        }

        if (!dashScopeApiKey.value) {
            alert('请输入DashScope API密钥')
            return
        }

        // 构建请求参数
        const params: any = {
            imageUrl: finalImageInput,
            prompt: prompt.value,
            function: functionType.value,
            n: n.value,
            dashScopeApiKey: dashScopeApiKey.value,
        }

        // 添加蒙版参数
        if (needsMask.value && maskUrl.value) {
            params.maskUrl = maskUrl.value
        }

        // 添加扩展参数
        if (needsExpand.value) {
            params.topScale = topScale.value
            params.bottomScale = bottomScale.value
            params.leftScale = leftScale.value
            params.rightScale = rightScale.value
        }

        // 添加超分参数
        if (needsUpscale.value) {
            params.upscaleFactor = upscaleFactor.value
        }

        // 执行图像编辑任务
        try {
            isSubmitting.value = true
            const response = await callImageEditAction(params)

            result.value = {
                success: response.success,
                taskId: response.taskId || '',
                message: response.message,
                images: [],
            }

            // 保存任务到历史记录
            if (response.success && response.taskId) {
                const newTask = {
                    id: response.taskId,
                    prompt: prompt.value,
                    functionType: functionType.value,
                    timestamp: Date.now(),
                    status: 'pending' as const,
                    result: response.message
                }
                taskHistory.value = [newTask, ...taskHistory.value]
            }

            showResult.value = true
        } catch (error) {
            console.error('编辑任务提交失败:', error)
            alert('编辑任务提交失败，请重试')
        } finally {
            isSubmitting.value = false
        }
    }

    // 监听功能类型变化，同步selectedFunctionType并重置相关参数
    watch(functionType, (newType) => {
        // 同步到selectedFunctionType
        setFunctionType(newType)

        // 重置相关参数
        if (!needsMask.value) {
            maskUrl.value = ''
        }
        if (!needsExpand.value) {
            topScale.value = 1.5
            bottomScale.value = 1.5
            leftScale.value = 1.5
            rightScale.value = 1.5
        }
        if (!needsUpscale.value) {
            upscaleFactor.value = 2
        }
    })

    // 监听编辑指令变化，自动保存到本地存储
    watch(prompt, (newPrompt) => {
        if (newPrompt) {
            storedPrompt.value = newPrompt
        }
    }, { immediate: false })

    return {
        // 状态
        imageInputType,
        imageUrl,
        imageBase64,
        imageFile,
        prompt,
        functionType,
        maskUrl,
        topScale,
        bottomScale,
        leftScale,
        rightScale,
        upscaleFactor,
        n,
        dashScopeApiKey,
        isSubmitting,
        showResult,
        result,

        // 计算属性
        needsMask,
        needsExpand,
        needsUpscale,

        // 功能类型选项
        functionTypeOptions: getFunctionTypeOptions(),

        // 预设指令
        presetPrompts,
        cartoonPresetPrompts,
        showPresetPrompts,
        currentPresetPrompts,

        // 功能类型工具方法
        getFunctionTypeDisplayName,

        // 方法
        handleFileChange,
        submitEditTask,

        // 清除方法
        clearPrompt: () => {
            prompt.value = ''
            storedPrompt.value = ''
        },

        // 选择预设指令
        selectPresetPrompt: (presetValue: string) => {
            if (presetValue) {
                prompt.value = presetValue
                storedPrompt.value = presetValue
            }
        },

        // 任务历史
        taskHistory
    }
}
