import { useLocalStorage as vueUseLocalStorage } from '@vueuse/core'

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const storedValue = vueUseLocalStorage(key, defaultValue, {
        // 自动序列化/反序列化
        serializer: {
            read: (v: any) => v ? JSON.parse(v) : defaultValue,
            write: (v: any) => JSON.stringify(v)
        }
    })

    return {
        storedValue,
        setStoredValue: (value: T) => storedValue.value = value,
        removeStoredValue: () => storedValue.value = defaultValue,
    }
}
