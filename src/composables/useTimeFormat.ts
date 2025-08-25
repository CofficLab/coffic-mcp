import { computed } from 'vue'

export function useTimeFormat() {
    // 格式化时间戳为本地时间字符串
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // 格式化时间戳为相对时间（如：2小时前）
    const formatRelativeTime = (timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}天前`
        if (hours > 0) return `${hours}小时前`
        if (minutes > 0) return `${minutes}分钟前`
        return '刚刚'
    }

    // 格式化时间戳为日期字符串（如：2024-01-15）
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    // 格式化时间戳为时间字符串（如：14:30）
    const formatTimeOnly = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return {
        formatTime,
        formatRelativeTime,
        formatDate,
        formatTimeOnly,
    }
}
