<script setup lang="ts">
import { Button, Card, Heading } from '@coffic/cosy-ui/vue';

interface TaskStatus {
    taskId: string | null;
    status: string;
    isPolling: boolean;
}

interface Props {
    taskStatus: TaskStatus;
    statusText: string;
    lang: string;
    onStopPolling: () => void;
}

const props = defineProps<Props>();
</script>

<template>
    <Card title="" class="p-4">
        <div class="flex items-center justify-between mb-4">
            <Heading :level="3" margin="sm">
                {{ lang === 'zh-cn' ? '任务状态' : 'Task Status' }}
            </Heading>
            <div class="flex items-center gap-2">
                <div :class="[
                    'w-2 h-2 rounded-full',
                    taskStatus.isPolling
                        ? 'bg-blue-500 animate-pulse'
                        : taskStatus.status === 'SUCCEEDED'
                            ? 'bg-green-500'
                            : taskStatus.status === 'FAILED'
                                ? 'bg-red-500'
                                : 'bg-gray-400',
                ]"></div>
                <span class="text-sm font-medium">{{ statusText }}</span>
            </div>
        </div>

        <div v-if="taskStatus.taskId" class="text-sm text-gray-600">
            {{ lang === 'zh-cn' ? '任务ID' : 'Task ID' }}:
            {{ taskStatus.taskId }}
        </div>

        <div v-if="taskStatus.isPolling" class="mt-4">
            <Button @click="onStopPolling" variant="outline" size="sm">
                {{ lang === 'zh-cn' ? '停止查询' : 'Stop Polling' }}
            </Button>
        </div>
    </Card>
</template>

<style scoped>
/* 组件特定样式可以在此处添加 */
</style>
