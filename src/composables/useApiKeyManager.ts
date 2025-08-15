import { computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export interface ApiKeyConfig {
    key: string
    name: string
    description?: string
    placeholder?: string
    required?: boolean
}

export function useApiKeyManager(configs: ApiKeyConfig[]) {
    // 为每个API密钥创建本地存储
    const apiKeys = configs.map(config => ({
        ...config,
        ...useLocalStorage(`apiKey_${config.key}`, '')
    }))

    // 检查是否有API密钥
    const hasApiKeys = computed(() => {
        return apiKeys.some(apiKey => apiKey.storedValue.value.trim() !== '')
    })

    // 获取所有API密钥
    const getAllApiKeys = computed(() => {
        return apiKeys.reduce((acc, apiKey) => {
            acc[apiKey.key] = apiKey.storedValue.value
            return acc
        }, {} as Record<string, string>)
    })

    // 验证API密钥
    const validateApiKeys = () => {
        const errors: string[] = []

        configs.forEach(config => {
            if (config.required && !apiKeys.find(ak => ak.key === config.key)?.storedValue.value.trim()) {
                errors.push(`${config.name} 是必填项`)
            }
        })

        return errors
    }

    // 清除所有API密钥
    const clearAllApiKeys = () => {
        apiKeys.forEach(apiKey => {
            apiKey.removeStoredValue()
        })
    }

    // 清除特定API密钥
    const clearApiKey = (key: string) => {
        const apiKey = apiKeys.find(ak => ak.key === key)
        if (apiKey) {
            apiKey.removeStoredValue()
        }
    }

    // 设置API密钥
    const setApiKey = (key: string, value: string) => {
        const apiKey = apiKeys.find(ak => ak.key === key)
        if (apiKey) {
            apiKey.setStoredValue(value)
        }
    }

    return {
        apiKeys,
        hasApiKeys,
        getAllApiKeys,
        validateApiKeys,
        clearAllApiKeys,
        clearApiKey,
        setApiKey,
    }
}
