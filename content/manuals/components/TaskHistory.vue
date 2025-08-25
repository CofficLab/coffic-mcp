<script setup lang="ts">
import { useImageEdit, type ImageEditTask } from '@/composables/useImageEdit';
import { useTaskStatus } from '@/composables/useTaskStatus';
import { Button, Container, Heading, ImageDisplay, RefreshIcon, ViewIcon } from '@coffic/cosy-ui/vue';
import { DeleteIcon } from '@coffic/cosy-ui/vue';

// 获取任务历史和功能类型工具方法
const { taskHistory, getFunctionTypeDisplayName } = useImageEdit();
// 任务状态查询组合式
const { queryingStatus, queryTaskStatus } = useTaskStatus();

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 获取状态显示
const getStatusDisplay = (status: string) => {
  const statusMap = {
    pending: { text: '处理中', class: 'bg-yellow-100 text-yellow-800' },
    completed: { text: '已完成', class: 'bg-green-100 text-green-800' },
    failed: { text: '失败', class: 'bg-red-100 text-red-800' },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.pending;
};

// 清除所有任务历史
const clearAllTasks = () => {
  if (confirm('确定要清除所有任务历史吗？此操作不可恢复。')) {
    taskHistory.value = [];
  }
};

// 清除单个任务
const clearTask = (taskId: string) => {
  if (confirm('确定要删除这个任务记录吗？')) {
    taskHistory.value = taskHistory.value.filter(
      (task: ImageEditTask) => task.id !== taskId
    );
  }
};

// 查看任务详情
const viewTaskDetails = (task: ImageEditTask) => {
  alert(
    `任务详情:\n\n任务ID: ${task.id}\n功能类型: ${getFunctionTypeDisplayName(
      task.functionType
    )}\n编辑指令: ${task.prompt}\n状态: ${getStatusDisplay(task.status).text
    }\n提交时间: ${formatTime(task.timestamp)}\n${task.result ? `结果: ${task.result}` : ''
    }`
  );
};

// 任务状态查询逻辑已迁移至 useTaskStatus 组合式

// 从任务结果中提取图片URL
const extractImageUrls = (result: string): string[] => {
  if (!result || !result.includes('生成的图片:')) return [];

  try {
    const imagePart = result.split('生成的图片:')[1]?.trim();
    if (!imagePart) return [];

    // 提取URL（假设URL是完整的http链接）
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = imagePart.match(urlRegex);

    console.log('提取的图片URLs:', urls);
    return urls || [];
  } catch (error) {
    console.error('提取图片URL失败:', error);
    return [];
  }
};

// 处理图片加载错误
</script>

<template>
  <Container background="primary/10" rounded="lg" padding="lg" size="full">
    <div class="flex justify-between items-center mb-6">
      <Heading :level=2 margin="lg">任务历史记录</Heading>
      <div class="flex gap-2">
        <span class="text-sm text-gray-500">
          共 {{ taskHistory.length }} 个
        </span>
        <Button v-if="taskHistory.length > 0" @click="clearAllTasks">
          清空
        </Button>
      </div>
    </div>

    <div v-if="taskHistory.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg mb-2">暂无任务记录</div>
      <div class="text-gray-400 text-sm">
        提交图像编辑任务后，任务记录将显示在这里
      </div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <!-- 表头 -->
        <thead>
          <tr class="bg-base-200">
            <th class="text-sm font-medium">任务ID</th>
            <th class="text-sm font-medium">状态</th>
            <th class="text-sm font-medium">功能类型</th>
            <th class="text-sm font-medium">编辑指令</th>
            <th class="text-sm font-medium">提交时间</th>
            <th class="text-sm font-medium">生成图片</th>
            <th class="text-sm font-medium text-center">操作</th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <tr v-for="task in taskHistory" :key="task.id" class="hover">
            <!-- 任务ID -->
            <td class="font-mono text-xs bg-base-200 px-2 py-1 rounded">
              {{ task.id }}
            </td>

            <!-- 状态 -->
            <td>
              <div :class="`w-16 badge badge-sm ${task.status === 'pending'
                ? 'badge-warning'
                : task.status === 'completed'
                  ? 'badge-success'
                  : 'badge-error'
                }`">
                {{ getStatusDisplay(task.status).text }}
              </div>
            </td>

            <!-- 功能类型 -->
            <td class="text-sm">
              {{ getFunctionTypeDisplayName(task.functionType) }}
            </td>

            <!-- 编辑指令 -->
            <td>
              <div class="tooltip tooltip-left" :data-tip="task.prompt">
                <span class="text-sm truncate block">
                  {{
                    task.prompt.length > 30
                      ? task.prompt.substring(0, 30) + '...'
                      : task.prompt
                  }}
                </span>
              </div>
            </td>

            <!-- 提交时间 -->
            <td class="text-sm text-gray-600">
              {{ formatTime(task.timestamp) }}
            </td>

            <!-- 生成图片 -->
            <td class="min-w-48">
              <ImageDisplay v-if="task.result && task.result.includes('生成的图片:')" :images="extractImageUrls(task.result)"
                size="md" :show-preview="true" />
              <div v-else class="text-xs text-gray-400">暂无图片</div>
            </td>

            <!-- 操作 -->
            <td class="text-center">
              <div class="flex gap-2 justify-center">
                <!-- 查询状态按钮 -->
                <Button @click="queryTaskStatus(task)" :disabled="queryingStatus.has(task.id)"
                  :class="{ loading: queryingStatus.has(task.id) }" :title="queryingStatus.has(task.id) ? '查询中...' : '查询状态'
                    ">
                  <RefreshIcon v-if="!queryingStatus.has(task.id)" class="w-4 h-4" />
                  <span v-else class="loading loading-spinner loading-xs"></span>
                </Button>

                <!-- 查看详情按钮 -->
                <Button @click="viewTaskDetails(task)" title="查看详情">
                  <ViewIcon class="w-4 h-4" />
                </Button>

                <!-- 删除按钮 -->
                <Button @click="clearTask(task.id)" title="删除任务">
                  <DeleteIcon />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Container>
</template>
