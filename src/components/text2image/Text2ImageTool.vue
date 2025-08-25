<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { actions } from 'astro:actions';
import { Container, Alert } from '@coffic/cosy-ui/vue';
import { useUIState } from '@/composables/useUIState';
import { useApiKeyManager, type ApiKeyConfig } from '@/composables/useApiKeyManager';
import { useLocalStorage } from '@/composables/useLocalStorage';
import { useTaskHistory, type TaskHistoryItem } from '@/composables/useTaskHistory';
import type { ModelInfo } from '@/libs/text2image/models';
import Text2ImageForm from './Text2ImageForm.vue';
import TaskHistory from './TaskHistory.vue';

// Props
interface Props {
  models: ModelInfo[];
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

const isSubmitting = ref(false);
const models = ref<ModelInfo[]>([]);

// UI 状态管理
const { showSuccessMessage, showErrorMessage, showMessage, messageText, messageType, isMessageVisible } = useUIState();

// API Key 管理
const apiKeyConfigs: ApiKeyConfig[] = [
  {
    key: 'dashScopeApiKey',
    name: 'DashScope API Key',
    description: '用于调用 DashScope 文本转图像服务的 API 密钥',
    placeholder: '请输入您的 DashScope API Key',
    required: true,
  },
];

const { apiKeys, getAllApiKeys, validateApiKeys, hasApiKeys } = useApiKeyManager(apiKeyConfigs);

// 模型选择存储
const { storedValue: savedModel, setStoredValue: setSavedModel } = useLocalStorage('text2image_selected_model', '');

// 任务历史管理
const { addTask, updateTask } = useTaskHistory();

// 计算属性
const isFormValid = computed(() => {
  return (
    formData.prompt.trim().length > 0 &&
    formData.prompt.length <= 800 &&
    formData.model.length > 0 &&
    hasApiKeys.value
  );
});

const selectedModelInfo = computed(() => {
  if (!formData.model) return null;

  const model = models.value.find((m) => m.id === formData.model);
  if (model) return model;
  return null;
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
  if (props.models) {
    models.value = props.models;

    // 优先使用保存的模型选择
    if (savedModel.value && models.value.find(m => m.id === savedModel.value)) {
      formData.model = savedModel.value;
    } else {
      // 如果没有保存的模型或保存的模型不存在，则使用推荐模型
      const recommendedModel = models.value.find((m) => m.recommended);
      if (recommendedModel) {
        formData.model = recommendedModel.id;
      } else if (models.value.length > 0) {
        // 如果没有推荐模型，使用第一个可用模型
        formData.model = models.value[0].id;
      }
    }
  }
});

// 监听模型选择变化并自动保存
watch(() => formData.model, (newModel) => {
  if (newModel) {
    setSavedModel(newModel);
  }
}, { immediate: false });

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
    // 验证 API key
    const apiKeyErrors = validateApiKeys();
    if (apiKeyErrors.length > 0) {
      throw new Error(apiKeyErrors.join(', '));
    }

    const allApiKeys = getAllApiKeys.value;

    const { data, error } = await actions.text2imageAction({
      prompt: formData.prompt.trim(),
      size: formData.size,
      n: formData.count,
      model: formData.model,
      dashScopeApiKey: allApiKeys.dashScopeApiKey,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      // 将任务添加到历史记录
      addTask({
        taskId: data.task_id,
        prompt: formData.prompt.trim(),
        model: formData.model,
        size: formData.size,
        count: formData.count,
        status: data.task_status,
        images: [],
      });

      showSuccessMessage(
        props.lang === 'zh-cn'
          ? '任务已提交，开始生成图像'
          : 'Task submitted, starting image generation'
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    showErrorMessage(errorMessage);
    console.error('提交任务失败:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formData.prompt = '';
};

// 刷新单个任务状态
const refreshTask = async (taskId: string) => {
  try {
    // 从 localStorage 获取 API key
    const allApiKeys = getAllApiKeys.value;

    const { data, error } = await actions.text2imageStatusAction({
      taskId,
      dashScopeApiKey: allApiKeys.dashScopeApiKey,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.status) {
      // 更新任务历史中的状态
      updateTask(taskId, { status: data.status });

      // 如果任务成功，获取生成的图片
      if (data.status === 'SUCCEEDED' && data.data?.output) {
        const output = data.data.output;
        if (output.results && output.results.length > 0) {
          const images = output.results.map((result: any) => result.url);
          updateTask(taskId, { images });
        }
      }

      // 显示成功消息
      showSuccessMessage(
        props.lang === 'zh-cn'
          ? '任务状态已更新'
          : 'Task status updated'
      );
    }
  } catch (error) {
    console.error('刷新任务状态失败:', error);
    showErrorMessage(
      props.lang === 'zh-cn'
        ? `刷新任务状态失败:${error instanceof Error ? error.message : '未知错误'}`
        : 'Failed to refresh task status'
    );
  }
};
</script>

<template>
  <Container background="neutral/10" rounded="lg" padding="lg" size="full" class="not-prose" ignore-heading>
    <div class="space-y-8">
      <!-- 表单区域 -->
      <Text2ImageForm :models="models" :form-data="formData" :selected-model-info="selectedModelInfo"
        :is-form-valid="isFormValid" :is-submitting="isSubmitting" :lang="lang" :size-options="sizeOptions"
        :count-options="countOptions" :api-keys="apiKeys" :on-submit="submitTask" :on-reset="resetForm" />

      <!-- 消息提示 -->
      <Alert v-if="isMessageVisible" :type="messageType as 'success' | 'error' | 'warning' | 'info'"
        :title="messageType === 'error' ? '错误' : messageType === 'success' ? '成功' : messageType === 'warning' ? '警告' : '信息'"
        :closable="true" @close="showMessage = false">
        {{ messageText }}
      </Alert>

      <!-- 任务历史区域 -->
      <div class="border-t pt-8">
        <TaskHistory :models="models" :lang="lang" :on-refresh-task="refreshTask" />
      </div>
    </div>
  </Container>
</template>
