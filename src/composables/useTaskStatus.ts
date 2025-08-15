import { ref } from 'vue'
import { actions } from 'astro:actions'
import { useImageEdit, type ImageEditTask } from '@/composables/useImageEdit'

export function useTaskStatus() {
    const { taskHistory, dashScopeApiKey } = useImageEdit()

    // 正在查询中的任务ID集合，避免重复点击
    const queryingStatus = ref<Set<string>>(new Set())
    // 记录每个任务最近一次查询的时间戳
    const lastQueryTime = ref<Record<string, number>>({})

    // 友好显示最近查询时间
    const getLastQueryTime = (taskId: string): string | null => {
        const timestamp = lastQueryTime.value[taskId]
        if (!timestamp) return null

        const now = Date.now()
        const diff = now - timestamp

        if (diff < 60_000) return '刚刚'
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`
        return new Date(timestamp).toLocaleDateString('zh-CN')
    }

    // 查询单个任务状态
    const queryTaskStatus = async (task: ImageEditTask) => {
        if (!dashScopeApiKey.value) {
            alert('请先设置 DashScope API 密钥')
            return
        }

        if (queryingStatus.value.has(task.id)) return

        try {
            queryingStatus.value.add(task.id)
            lastQueryTime.value[task.id] = Date.now()

            const { data, error } = await actions.imageEditStatusAction({
                taskId: task.id,
                dashScopeApiKey: dashScopeApiKey.value,
            })

            if (error) {
                alert(`状态查询失败: ${error.message ?? '未知错误'}`)
                return
            }

            const typed = data as any

            if (typed?.success) {
                const idx = taskHistory.value.findIndex((t: ImageEditTask) => t.id === task.id)
                if (idx !== -1) {
                    if (typed.status === 'completed') {
                        taskHistory.value[idx].status = 'completed'
                        taskHistory.value[idx].result = typed.message
                        if (typed.images?.length) {
                            taskHistory.value[idx].result += `\n生成的图片: ${typed.images.join(', ')}`
                        }
                    } else if (typed.status === 'failed') {
                        taskHistory.value[idx].status = 'failed'
                        taskHistory.value[idx].result = typed.message
                    } else {
                        taskHistory.value[idx].result = typed.message
                    }
                }

                if (typed.status === 'completed') {
                    alert(`任务状态查询成功！\n\n状态: 已完成\n${typed.message}`)
                } else if (typed.status === 'failed') {
                    alert(`任务状态查询结果:\n\n状态: 执行失败\n${typed.message}`)
                } else {
                    alert(`任务状态查询结果:\n\n状态: 执行中\n${typed.message}`)
                }
            } else {
                alert(`状态查询失败: ${typed?.message ?? '未知错误'}`)
            }
        } catch (error) {
            alert(`状态查询出错: ${error instanceof Error ? error.message : '未知错误'}`)
        } finally {
            queryingStatus.value.delete(task.id)
        }
    }

    return {
        queryingStatus,
        lastQueryTime,
        getLastQueryTime,
        queryTaskStatus,
    }
}
