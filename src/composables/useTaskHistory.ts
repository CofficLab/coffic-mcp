import { ref, computed } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export interface TaskHistoryItem {
    id: string
    taskId: string
    prompt: string
    model: string
    size: string
    count: number
    status: string
    images: string[]
    createdAt: number
    updatedAt: number
}

export function useTaskHistory() {
    // 存储任务历史
    const { storedValue: taskHistory, setStoredValue: setTaskHistory } = useLocalStorage<TaskHistoryItem[]>('text2image_task_history', [])

    // 添加新任务
    const addTask = (taskData: Omit<TaskHistoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newTask: TaskHistoryItem = {
            ...taskData,
            id: Date.now().toString(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        const currentHistory = taskHistory.value || []
        const updatedHistory = [newTask, ...currentHistory].slice(0, 50) // 保留最近50个任务
        setTaskHistory(updatedHistory)
        return newTask.id
    }

    // 更新任务状态
    const updateTask = (taskId: string, updates: Partial<TaskHistoryItem>) => {
        const currentHistory = taskHistory.value || []
        const taskIndex = currentHistory.findIndex((task: TaskHistoryItem) => task.taskId === taskId)

        if (taskIndex !== -1) {
            currentHistory[taskIndex] = {
                ...currentHistory[taskIndex],
                ...updates,
                updatedAt: Date.now(),
            }
            setTaskHistory([...currentHistory])
        }
    }

    // 删除任务
    const removeTask = (taskId: string) => {
        const currentHistory = taskHistory.value || []
        const updatedHistory = currentHistory.filter((task: TaskHistoryItem) => task.taskId !== taskId)
        setTaskHistory(updatedHistory)
    }

    // 清空任务历史
    const clearTaskHistory = () => {
        setTaskHistory([])
    }

    // 获取任务历史
    const getTaskHistory = computed(() => taskHistory.value || [])

    // 获取特定任务
    const getTask = (taskId: string): TaskHistoryItem | undefined => {
        const currentHistory = taskHistory.value || []
        return currentHistory.find((task: TaskHistoryItem) => task.taskId === taskId)
    }

    // 获取最近的任务
    const getRecentTasks = (limit: number = 10) => {
        const currentHistory = taskHistory.value || []
        return currentHistory.slice(0, limit)
    }

    return {
        addTask,
        updateTask,
        removeTask,
        clearTaskHistory,
        getTaskHistory,
        getTask,
        getRecentTasks,
    }
}
