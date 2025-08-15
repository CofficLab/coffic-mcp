import { ref, computed, watch } from 'vue'
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

export function useImageEdit() {
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
    const functionType = ref('stylization_all')
    const maskUrl = ref('')
    const topScale = ref(1.5)
    const bottomScale = ref(1.5)
    const leftScale = ref(1.5)
    const rightScale = ref(1.5)
    const upscaleFactor = ref(2)
    const n = ref(1)
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
            // 这里应该调用实际的API
            // 目前模拟API调用
            await new Promise((resolve) => setTimeout(resolve, 1000))

            return {
                success: true,
                taskId: `task_${Date.now()}`,
                message: '图像编辑任务已提交，正在处理中...',
                images: [] as string[]
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
        console.log('submitEditTask 被调用');
        console.log('imageInputType:', imageInputType.value);

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

        // 任务历史
        taskHistory
    }
}
