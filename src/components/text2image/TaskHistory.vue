<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTaskHistory, type TaskHistoryItem } from '@/composables/useTaskHistory'
import type { ModelInfo } from '@/libs/text2image/models'
import { Button, DeleteIcon, ViewIcon, Heading, DownloadIcon, RefreshIcon } from '@coffic/cosy-ui/vue'

interface Props {
    models: ModelInfo[]
    lang: string
    onViewTask?: (task: TaskHistoryItem) => void
    onDeleteTask?: (taskId: string) => void
    onRefreshTask?: (taskId: string) => void
}

const props = defineProps<Props>()

const { getTaskHistory, removeTask } = useTaskHistory()

// 客户端挂载状态
const isMounted = ref(false)

// 计算属性
const taskHistory = computed(() => getTaskHistory.value)

// 组件挂载后标记为已挂载
onMounted(() => {
    isMounted.value = true
})

// 格式化时间
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString(props.lang === 'zh-cn' ? 'zh-CN' : 'en-US')
}

// 获取模型名称
const getModelName = (modelId: string) => {
    const model = props.models.find(m => m.id === modelId)
    return model ? model.name : modelId
}

// 获取状态文本
const getStatusText = (status: string) => {
    if (props.lang === 'zh-cn') {
        switch (status) {
            case 'PENDING': return '等待中'
            case 'RUNNING': return '生成中'
            case 'SUCCEEDED': return '成功'
            case 'FAILED': return '失败'
            case 'CANCELLED': return '已取消'
            default: return status
        }
    } else {
        return status
    }
}

// 获取状态样式
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800'
        case 'RUNNING': return 'bg-blue-100 text-blue-800'
        case 'SUCCEEDED': return 'bg-green-100 text-green-800'
        case 'FAILED': return 'bg-red-100 text-red-800'
        case 'CANCELLED': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

// 处理查看任务
const handleViewTask = (task: TaskHistoryItem) => {
    // 任务详情已经在列表中显示，点击可以滚动到顶部或高亮显示
    console.log('查看任务详情:', task.taskId)
}

// 处理删除任务
const handleDeleteTask = (taskId: string) => {
    if (confirm(props.lang === 'zh-cn' ? '确定要删除这个任务吗？' : 'Are you sure you want to delete this task?')) {
        removeTask(taskId)
        // 任务已从localStorage中删除，无需额外回调
    }
}

// 下载图片
const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 处理刷新任务状态
const handleRefreshTask = (taskId: string) => {
    props.onRefreshTask?.(taskId)
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Heading :level="3">
                {{ lang === 'zh-cn' ? '任务历史' : 'Task History' }}
            </Heading>
            <div class="text-sm text-gray-500">
                {{ lang === 'zh-cn' ? `共 ${taskHistory.length} 个任务` : `${taskHistory.length} tasks` }}
            </div>
        </div>

        <!-- 服务端渲染占位符 -->
        <div v-if="!isMounted" class="text-center py-8 text-gray-500">
            {{ lang === 'zh-cn' ? '加载中...' : 'Loading...' }}
        </div>

        <!-- 客户端渲染的任务列表，避免SSR hydration不匹配 -->
        <div v-else class="space-y-3">
            <div v-if="taskHistory.length === 0" class="text-center py-8 text-gray-500">
                {{ lang === 'zh-cn' ? '暂无任务历史' : 'No task history' }}
            </div>
            <div v-for="task in taskHistory" :key="task.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <!-- 任务头部信息 -->
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-1 text-xs font-medium rounded-full"
                                :class="getStatusStyle(task.status)">
                                {{ getStatusText(task.status) }}
                            </span>
                            <span class="text-sm text-gray-500">
                                {{ formatTime(task.createdAt) }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-700 truncate" :title="task.prompt">
                            {{ task.prompt }}
                        </p>
                    </div>
                    <div class="flex gap-1 ml-2">
                        <Button v-if="['PENDING', 'RUNNING'].includes(task.status)"
                            @click="handleRefreshTask(task.taskId)"
                            :title="lang === 'zh-cn' ? '刷新状态' : 'Refresh Status'" size="sm" variant="ghost">
                            <RefreshIcon />
                        </Button>
                        <Button v-if="task.images.length > 0" @click="handleViewTask(task)"
                            :title="lang === 'zh-cn' ? '查看结果' : 'View Results'" size="sm" variant="ghost">
                            <ViewIcon />
                        </Button>
                        <Button @click="handleDeleteTask(task.taskId)"
                            :title="lang === 'zh-cn' ? '删除任务' : 'Delete Task'" size="sm" variant="ghost">
                            <DeleteIcon />
                        </Button>
                    </div>
                </div>

                <!-- 任务参数 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                        <span class="font-medium">{{ lang === 'zh-cn' ? '模型：' : 'Model: ' }}</span>
                        {{ getModelName(task.model) }}
                    </div>
                    <div>
                        <span class="font-medium">{{ lang === 'zh-cn' ? '尺寸：' : 'Size: ' }}</span>
                        {{ task.size }}
                    </div>
                    <div>
                        <span class="font-medium">{{ lang === 'zh-cn' ? '数量：' : 'Count: ' }}</span>
                        {{ task.count }}
                    </div>
                    <div>
                        <span class="font-medium">{{ lang === 'zh-cn' ? '任务ID：' : 'Task ID: ' }}</span>
                        <span class="font-mono">{{ task.taskId.slice(-8) }}</span>
                    </div>
                </div>

                <!-- 生成的图片 -->
                <div v-if="task.images.length > 0" class="border-t pt-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">
                            {{ lang === 'zh-cn' ? `生成图片 (${task.images.length})` : `Generated Images
                            (${task.images.length})` }}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div v-for="(image, index) in task.images.slice(0, 4)" :key="index" class="relative group">
                            <img :src="image" :alt="`${lang === 'zh-cn' ? '生成的图片' : 'Generated image'} ${index + 1}`"
                                class="w-full h-20 object-cover rounded border cursor-pointer"
                                @click="handleViewTask(task)" />
                            <Button
                                @click.stop="downloadImage(image, `generated-image-${task.taskId}-${index + 1}.png`)"
                                :title="lang === 'zh-cn' ? '下载图片' : 'Download Image'">
                                <DownloadIcon />
                            </Button>
                        </div>
                    </div>
                    <div v-if="task.images.length > 4" class="text-xs text-gray-500 mt-2">
                        {{ lang === 'zh-cn' ? `还有 ${task.images.length - 4} 张图片...` : `+${task.images.length - 4} more
                        images...` }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
