<script setup lang="ts">
  import { useText2ImageModels } from '@/composables/useText2ImageModels';
  import { Button, Container, Heading, RefreshIcon } from '@coffic/cosy-ui/vue';

  // 使用数据获取 composable
  const {
    // 状态
    models,
    isSubmitting,

    // 方法
    fetchModels,
  } = useText2ImageModels();
</script>

<template>
  <Container
    background="neutral/10"
    rounded="lg"
    padding="lg"
    size="full"
    class="not-prose"
    ignore-heading>
    <div class="space-y-6">
      <!-- 标题 -->
      <div class="text-center">
        <Heading :level="2">文本转图像模型查询</Heading>
      </div>

      <!-- 操作按钮 -->
      <div class="form-group flex justify-center">
        <Button @click="fetchModels" :disabled="isSubmitting">
          {{ isSubmitting ? '查询中...' : '查询模型' }}
        </Button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isSubmitting" class="text-center py-8">
        <div
          class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
          <RefreshIcon />
          正在查询模型列表...
        </div>
      </div>

      <!-- 模型列表 -->
      <div v-else-if="models.length > 0" class="space-y-6">
        <div
          v-for="group in models"
          :key="group.version"
          class="border border-gray-200 rounded-lg">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <Heading :level="3" margin="sm">{{ group.title }}</Heading>
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
      <div v-else-if="!isSubmitting" class="text-center py-8">
        <Heading :level="3">暂无模型</Heading>
        <p class="mt-1 text-sm text-gray-500">模型列表为空</p>
      </div>
    </div>
  </Container>
</template>

<style scoped>
  /* 表单组样式 */
  .form-group {
    margin-bottom: 1.5rem;
  }

  /* 确保select可以调整大小 */
  select {
    resize: vertical;
    min-height: 40px;
  }
</style>
