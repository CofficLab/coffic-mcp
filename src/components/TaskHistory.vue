<script setup lang="ts">
  import { computed } from 'vue';
  import { useImageEdit, type ImageEditTask } from '@/composables/useImageEdit';

  // 获取任务历史
  const { taskHistory } = useImageEdit();

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

  // 获取功能类型显示名称
  const getFunctionTypeName = (functionType: string) => {
    const functionTypeMap: Record<string, string> = {
      stylization_all: '整体风格化',
      stylization_local: '局部风格化',
      description_edit: '指令编辑',
      description_edit_with_mask: '局部重绘',
      inpainting: '图像修复',
      remove_watermark: '去文字水印',
      expand: '扩图',
      super_resolution: '图像超分',
      colorization: '图像上色',
      doodle: '线稿生图',
      control_cartoon_feature: '卡通形象控制',
    };
    return functionTypeMap[functionType] || functionType;
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
</script>

<template>
  <div
    class="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">任务历史记录</h2>
      <div class="flex gap-2">
        <span class="text-sm text-gray-500">
          共 {{ taskHistory.length }} 个任务
        </span>
        <button
          v-if="taskHistory.length > 0"
          @click="clearAllTasks"
          class="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200">
          清空历史
        </button>
      </div>
    </div>

    <div v-if="taskHistory.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-lg mb-2">暂无任务记录</div>
      <div class="text-gray-400 text-sm">
        提交图像编辑任务后，任务记录将显示在这里
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="task in taskHistory"
        :key="task.id"
        class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span
                class="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {{ task.id }}
              </span>
              <span
                :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusDisplay(task.status).class
                }`">
                {{ getStatusDisplay(task.status).text }}
              </span>
            </div>
            <div class="text-sm text-gray-500 mb-1">
              功能类型: {{ getFunctionTypeName(task.functionType) }}
            </div>
            <div class="text-sm text-gray-500 mb-2">
              提交时间: {{ formatTime(task.timestamp) }}
            </div>
          </div>
          <button
            @click="clearTask(task.id)"
            class="text-red-500 hover:text-red-700 p-1 transition-colors duration-200"
            title="删除任务记录">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="bg-gray-50 rounded-md p-3 mb-3">
          <div class="text-sm font-medium text-gray-700 mb-1">编辑指令:</div>
          <div class="text-sm text-gray-600">{{ task.prompt }}</div>
        </div>

        <div v-if="task.result" class="bg-blue-50 rounded-md p-3">
          <div class="text-sm font-medium text-blue-700 mb-1">任务结果:</div>
          <div class="text-sm text-blue-600">{{ task.result }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 组件特定样式 */
</style>
