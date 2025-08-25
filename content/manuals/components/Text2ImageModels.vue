<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { actions } from 'astro:actions';
  import type { ModelInfo, ModelGroup } from '@/libs/text2image';

  // 响应式数据
  const isLoading = ref(false);
  const models = ref<ModelGroup[]>([]);
  const error = ref<string>('');
  const versionFilter = ref('');
  const recommendedOnly = ref(false);

  // 计算属性
  const filteredModels = computed(() => {
    let filtered = models.value;

    // 如果指定了版本，过滤对应版本
    if (versionFilter.value) {
      filtered = filtered.filter(
        (group) => group.version === versionFilter.value
      );
    }

    // 如果只要推荐模型，过滤推荐模型
    if (recommendedOnly.value) {
      filtered = filtered
        .map((group) => ({
          ...group,
          models: group.models.filter((model) => model.recommended),
        }))
        .filter((group) => group.models.length > 0);
    }

    return filtered;
  });

  const availableVersions = computed(() => {
    return [...new Set(models.value.map((group) => group.version))];
  });

  // 方法
  const fetchModels = async () => {
    isLoading.value = true;
    error.value = '';

    try {
      // 使用 actions 调用
      const { data, error } = await actions.getText2ImageModels({
        version: versionFilter.value || undefined,
        includeRecommended: recommendedOnly.value,
      });

      if (error) {
        throw new Error(error.message || '查询失败');
      }

      if (data && data.data) {
        models.value = data.data.models || [];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误';
      console.error('获取模型列表失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearFilters = () => {
    versionFilter.value = '';
    recommendedOnly.value = false;
  };

  // 组件挂载时获取模型列表
  fetchModels();
</script>

<template>
  <div class="max-w-4xl mx-auto p-6" ignore-heading>
    <div class="bg-white rounded-lg shadow-lg p-6">
      <!-- 标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          文本转图像模型查询
        </h1>
        <p class="text-gray-600">查询文生图功能支持的模型列表</p>
      </div>

      <!-- 过滤器 -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">筛选条件</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 版本筛选 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >版本</label
            >
            <select
              v-model="versionFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">所有版本</option>
              <option
                v-for="version in availableVersions"
                :key="version"
                :value="version">
                {{ version }}
              </option>
            </select>
          </div>

          <!-- 推荐模型筛选 -->
          <div class="flex items-center">
            <input
              id="recommended-only"
              v-model="recommendedOnly"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="recommended-only" class="ml-2 text-sm text-gray-700">
              仅显示推荐模型
            </label>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="fetchModels"
              :disabled="isLoading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              {{ isLoading ? '查询中...' : '查询模型' }}
            </button>
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
              清除筛选
            </button>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">查询失败</h3>
            <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-8">
        <div
          class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在查询模型列表...
        </div>
      </div>

      <!-- 模型列表 -->
      <div v-else-if="filteredModels.length > 0" class="space-y-6">
        <div
          v-for="group in filteredModels"
          :key="group.version"
          class="border border-gray-200 rounded-lg">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ group.title }}
            </h3>
          </div>
          <div class="p-4">
            <div class="grid gap-4">
              <div
                v-for="model in group.models"
                :key="model.id"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="text-lg font-medium text-gray-900">
                        {{ model.name }}
                      </h4>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ model.type }}
                      </span>
                      <span
                        v-if="model.recommended"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        推荐
                      </span>
                    </div>
                    <p class="text-gray-600 mb-2">{{ model.description }}</p>
                    <div class="text-sm text-gray-500">
                      版本: {{ model.version }} | ID: {{ model.id }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isLoading" class="text-center py-8">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无模型</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{
            versionFilter || recommendedOnly
              ? '没有找到符合条件的模型'
              : '模型列表为空'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
