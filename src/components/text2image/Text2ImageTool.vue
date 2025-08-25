<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { actions } from 'astro:actions';
  import { Button, Container, Heading, Card } from '@coffic/cosy-ui/vue';
  import { useUIState } from '@/composables/useUIState';
  import type { ModelGroup } from '@/libs/text2image';

  // Props
  interface Props {
    modelsData: {
      models: ModelGroup[];
      total: number;
      formattedText: string;
    } | null;
    lang: string;
  }

  const props = defineProps<Props>();

  // 响应式数据
  const formData = reactive({
    prompt: '',
    model: '',
    size: '1024*1024',
    count: 1,
  });

  const taskStatus = ref<{
    taskId: string | null;
    status: string;
    images: string[];
    isPolling: boolean;
  }>({
    taskId: null,
    status: '',
    images: [],
    isPolling: false,
  });

  const isSubmitting = ref(false);
  const models = ref<ModelGroup[]>([]);

  // UI 状态管理
  const { showSuccessMessage, showErrorMessage } = useUIState();

  // 计算属性
  const isFormValid = computed(() => {
    return (
      formData.prompt.trim().length > 0 &&
      formData.prompt.length <= 800 &&
      formData.model.length > 0
    );
  });

  const selectedModelInfo = computed(() => {
    if (!formData.model) return null;

    for (const group of models.value) {
      const model = group.models.find((m) => m.id === formData.model);
      if (model) return model;
    }
    return null;
  });

  const statusText = computed(() => {
    const status = taskStatus.value.status;
    if (props.lang === 'zh-cn') {
      switch (status) {
        case 'PENDING':
          return '任务已提交，等待处理';
        case 'RUNNING':
          return '正在生成图像...';
        case 'SUCCEEDED':
          return '生成成功';
        case 'FAILED':
          return '生成失败';
        case 'CANCELLED':
          return '任务已取消';
        default:
          return status || '准备就绪';
      }
    } else {
      switch (status) {
        case 'PENDING':
          return 'Task submitted, waiting for processing';
        case 'RUNNING':
          return 'Generating images...';
        case 'SUCCEEDED':
          return 'Generation successful';
        case 'FAILED':
          return 'Generation failed';
        case 'CANCELLED':
          return 'Task cancelled';
        default:
          return status || 'Ready';
      }
    }
  });

  // 图片尺寸选项
  const sizeOptions = [
    { value: '512*512', label: '512×512' },
    { value: '768*768', label: '768×768' },
    { value: '1024*1024', label: '1024×1024' },
    { value: '1280*720', label: '1280×720 (16:9)' },
    { value: '720*1280', label: '720×1280 (9:16)' },
    { value: '1440*1440', label: '1440×1440' },
  ];

  // 生成数量选项
  const countOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
  ];

  // 初始化数据
  onMounted(() => {
    if (props.modelsData?.models) {
      models.value = props.modelsData.models;

      // 设置默认模型（推荐的第一个模型）
      for (const group of models.value) {
        const recommendedModel = group.models.find((m) => m.recommended);
        if (recommendedModel) {
          formData.model = recommendedModel.id;
          break;
        }
      }

      // 如果没有推荐模型，使用第一个可用模型
      if (
        !formData.model &&
        models.value.length > 0 &&
        models.value[0].models.length > 0
      ) {
        formData.model = models.value[0].models[0].id;
      }
    }
  });

  // 提交文生图任务
  const submitTask = async () => {
    if (!isFormValid.value) {
      showErrorMessage(
        props.lang === 'zh-cn'
          ? '请填写完整的表单信息'
          : 'Please fill in all required information'
      );
      return;
    }

    isSubmitting.value = true;

    try {
      const result = await actions.text2imageAction({
        prompt: formData.prompt.trim(),
        size: formData.size,
        n: formData.count,
        model: formData.model,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data?.data) {
        taskStatus.value.taskId = result.data.data.task_id;
        taskStatus.value.status = result.data.data.task_status;
        taskStatus.value.images = [];
        taskStatus.value.isPolling = true;

        showSuccessMessage(
          props.lang === 'zh-cn'
            ? '任务已提交，开始生成图像'
            : 'Task submitted, starting image generation'
        );

        // 开始轮询任务状态
        pollTaskStatus();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      showErrorMessage(errorMessage);
      console.error('提交任务失败:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async () => {
    if (!taskStatus.value.taskId) return;

    try {
      const result = await actions.text2imageStatusAction({
        taskId: taskStatus.value.taskId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data?.status) {
        taskStatus.value.status = result.data.status;

        // 如果任务成功，获取生成的图片
        if (result.data.status === 'SUCCEEDED' && result.data.data?.output) {
          const output = result.data.data.output;
          if (output.results && output.results.length > 0) {
            taskStatus.value.images = output.results.map(
              (result: any) => result.url
            );
          }
          taskStatus.value.isPolling = false;
          showSuccessMessage(
            props.lang === 'zh-cn'
              ? '图像生成成功！'
              : 'Image generation successful!'
          );
        } else if (result.data.status === 'FAILED') {
          taskStatus.value.isPolling = false;
          showErrorMessage(
            props.lang === 'zh-cn' ? '图像生成失败' : 'Image generation failed'
          );
        } else if (['PENDING', 'RUNNING'].includes(result.data.status)) {
          // 继续轮询
          setTimeout(pollTaskStatus, 2000);
        } else {
          taskStatus.value.isPolling = false;
        }
      }
    } catch (error) {
      console.error('查询任务状态失败:', error);
      taskStatus.value.isPolling = false;
      showErrorMessage(
        props.lang === 'zh-cn'
          ? '查询任务状态失败'
          : 'Failed to query task status'
      );
    }
  };

  // 重置表单
  const resetForm = () => {
    formData.prompt = '';
    taskStatus.value = {
      taskId: null,
      status: '',
      images: [],
      isPolling: false,
    };
  };

  // 停止轮询
  const stopPolling = () => {
    taskStatus.value.isPolling = false;
  };

  // 打开图片链接
  const openImage = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };
</script>

<template>
  <Container
    background="neutral/10"
    rounded="lg"
    padding="lg"
    size="full"
    class="not-prose"
    ignore-heading>
    <div class="space-y-8">
      <!-- 表单区域 -->
      <div class="space-y-6">
        <!-- 模型选择 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ lang === 'zh-cn' ? '选择模型' : 'Select Model' }}
            <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.model"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">
              {{ lang === 'zh-cn' ? '请选择模型' : 'Select a model' }}
            </option>
            <option
              v-for="model in models.flatMap((group) => group.models)"
              :key="model.id"
              :value="model.id">
              {{ model.name }} {{ model.recommended ? '⭐' : '' }}
            </option>
          </select>
          <div v-if="selectedModelInfo" class="mt-2 text-sm text-gray-600">
            {{ selectedModelInfo.description }}
          </div>
        </div>

        <!-- 提示词输入 -->
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ lang === 'zh-cn' ? '提示词' : 'Prompt' }}
            <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.prompt"
            :placeholder="
              lang === 'zh-cn'
                ? '描述您想要生成的图像内容，最多800个字符...'
                : 'Describe the image you want to generate, max 800 characters...'
            "
            maxlength="800"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <div class="mt-1 text-sm text-gray-500">
            {{ formData.prompt.length }}/800
            {{ lang === 'zh-cn' ? '字符' : 'characters' }}
          </div>
        </div>

        <!-- 参数设置 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 图片尺寸 -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ lang === 'zh-cn' ? '图片尺寸' : 'Image Size' }}
            </label>
            <select
              v-model="formData.size"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option
                v-for="option in sizeOptions"
                :key="option.value"
                :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 生成数量 -->
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ lang === 'zh-cn' ? '生成数量' : 'Number of Images' }}
            </label>
            <select
              v-model="formData.count"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option
                v-for="option in countOptions"
                :key="option.value"
                :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4">
          <Button
            @click="submitTask"
            :disabled="!isFormValid || isSubmitting"
            size="lg"
            class="flex-1">
            <template v-if="isSubmitting">
              {{ lang === 'zh-cn' ? '提交中...' : 'Submitting...' }}
            </template>
            <template v-else>
              {{ lang === 'zh-cn' ? '开始生成' : 'Generate Image' }}
            </template>
          </Button>

          <Button @click="resetForm" variant="outline" size="lg">
            {{ lang === 'zh-cn' ? '重置' : 'Reset' }}
          </Button>
        </div>
      </div>

      <!-- 任务状态区域 -->
      <div v-if="taskStatus.taskId || taskStatus.status" class="space-y-4">
        <Card title="" class="p-4">
          <div class="flex items-center justify-between mb-4">
            <Heading :level="3" margin="sm">
              {{ lang === 'zh-cn' ? '任务状态' : 'Task Status' }}
            </Heading>
            <div class="flex items-center gap-2">
              <div
                :class="[
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
            <Button @click="stopPolling" variant="outline" size="sm">
              {{ lang === 'zh-cn' ? '停止查询' : 'Stop Polling' }}
            </Button>
          </div>
        </Card>
      </div>

      <!-- 生成结果区域 -->
      <div v-if="taskStatus.images.length > 0" class="space-y-4">
        <Heading :level="3">
          {{ lang === 'zh-cn' ? '生成结果' : 'Generated Images' }}
        </Heading>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(imageUrl, index) in taskStatus.images"
            :key="index"
            class="relative group">
            <Card title="" class="p-2">
              <img
                :src="imageUrl"
                :alt="`${lang === 'zh-cn' ? '生成的图像' : 'Generated image'} ${
                  index + 1
                }`"
                class="w-full h-auto rounded-lg shadow-md"
                loading="lazy" />
              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-gray-600">
                  {{ lang === 'zh-cn' ? '图像' : 'Image' }} {{ index + 1 }}
                </span>
                <Button
                  @click="() => openImage(imageUrl)"
                  variant="outline"
                  size="sm">
                  {{ lang === 'zh-cn' ? '查看原图' : 'View Original' }}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>

<style scoped>
  .form-group {
    margin-bottom: 1.5rem;
  }

  textarea {
    min-height: 100px;
  }
</style>
