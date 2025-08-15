<script setup lang="ts">
  import { useImageEdit } from '@/composables/useImageEdit';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useUIState } from '@/composables/useUIState';
  import TaskHistory from './TaskHistory.vue';

  const {
    // 状态
    imageInputType,
    imageUrl,
    imageBase64,
    imageFile,
    prompt,
    functionType,
    maskUrl,
    topScale,
    bottomScale,
    leftScale,
    rightScale,
    upscaleFactor,
    n,
    dashScopeApiKey,
    isSubmitting,
    showResult,
    result,

    // 计算属性
    needsMask,
    needsExpand,
    needsUpscale,

    // 功能类型选项
    functionTypeOptions,

    // 方法
    handleFileChange,
    submitEditTask,
    clearPrompt,
  } = useImageEdit();

  // 动态表单验证规则
  const getValidationRules = () => {
    const baseRules: Record<string, any> = {
      prompt: { required: true, maxLength: 800 },
      dashScopeApiKey: { required: true },
    };

    // 根据输入类型添加相应的验证规则
    if (imageInputType.value === 'url') {
      baseRules.imageUrl = { required: true };
    } else if (imageInputType.value === 'base64') {
      baseRules.imageBase64 = { required: true };
    } else if (imageInputType.value === 'file') {
      baseRules.imageFile = { required: true };
    }

    return baseRules;
  };

  // UI状态管理
  const { showSuccessMessage, showErrorMessage } = useUIState();

  // 清除API密钥
  const clearApiKey = () => {
    dashScopeApiKey.value = '';
    showSuccessMessage('API密钥已清除');
  };

  // 增强的提交函数，包含验证
  const handleSubmit = async () => {
    console.log('handleSubmit 被调用');
    console.log('imageInputType:', imageInputType.value);
    console.log('prompt:', prompt.value);
    console.log('dashScopeApiKey:', dashScopeApiKey.value);

    // 根据输入类型构建验证数据
    const formData: Record<string, any> = {
      prompt: prompt.value,
      dashScopeApiKey: dashScopeApiKey.value,
    };

    // 根据选择的输入类型添加相应的验证
    if (imageInputType.value === 'url') {
      formData.imageUrl = imageUrl.value;
      console.log('使用URL输入:', imageUrl.value);
    } else if (imageInputType.value === 'base64') {
      formData.imageBase64 = imageBase64.value;
      console.log('使用Base64输入:', imageBase64.value);
    } else if (imageInputType.value === 'file') {
      formData.imageFile = imageFile.value;
      console.log('使用文件输入:', imageFile.value);
    }

    // 获取当前输入类型的验证规则并验证表单
    const currentValidationRules = getValidationRules();
    const { validateForm: validateCurrentForm, hasErrors: hasCurrentErrors } =
      useFormValidation(currentValidationRules);

    const errors = validateCurrentForm(formData);
    console.log('验证结果:', errors);

    if (hasCurrentErrors(errors)) {
      const errorMessage = Object.values(errors).join(', ');
      showErrorMessage(errorMessage);
      return;
    }

    console.log('开始提交任务...');
    // 验证通过，提交任务
    await submitEditTask();
    console.log('任务提交完成');

    if (result.value.taskId) {
      showSuccessMessage('任务提交成功！');
    }
  };
</script>

<template>
  <div
    ignore-heading
    class="max-w-4xl mx-auto p-6 bg-gray-50 border border-gray-200 rounded-lg">
    <div class="space-y-6">
      <div class="form-group">
        <label
          for="imageInput"
          class="block text-sm font-medium text-gray-700 mb-2"
          >图片输入方式:</label
        >
        <select
          v-model="imageInputType"
          id="imageInputType"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="url">图片URL</option>
          <option value="base64">Base64图片</option>
          <option value="file">本地文件</option>
        </select>
      </div>

      <div v-show="imageInputType === 'url'" class="form-group">
        <label
          for="imageUrl"
          class="block text-sm font-medium text-gray-700 mb-2"
          >图片URL:</label
        >
        <input
          type="text"
          id="imageUrl"
          v-model="imageUrl"
          placeholder="请输入图片URL"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div v-show="imageInputType === 'base64'" class="form-group">
        <label
          for="imageBase64"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Base64图片:</label
        >
        <textarea
          id="imageBase64"
          v-model="imageBase64"
          placeholder="请输入base64编码的图片数据"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"></textarea>
        <small class="text-xs text-gray-500 mt-1 block">
          支持格式: data:image/jpeg;base64,/9j/4AAQSkZJR......
        </small>
      </div>

      <div v-show="imageInputType === 'file'" class="form-group">
        <label
          for="imageFile"
          class="block text-sm font-medium text-gray-700 mb-2"
          >本地图片文件:</label
        >
        <input
          type="file"
          id="imageFile"
          accept="image/*"
          @change="handleFileChange"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <small class="text-xs text-gray-500 mt-1 block"
          >支持JPG、PNG、WEBP等格式，最大10MB</small
        >
      </div>

      <div class="form-group">
        <label
          for="prompt"
          class="block text-sm font-medium text-gray-700 mb-2">
          编辑指令:
          <span
            v-if="prompt"
            class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ✓ 已保存
          </span>
        </label>
        <div class="flex gap-2">
          <textarea
            id="prompt"
            v-model="prompt"
            placeholder="请输入编辑指令描述"
            rows="3"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          <button
            type="button"
            @click="clearPrompt"
            class="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            title="清除编辑指令">
            清除
          </button>
        </div>
        <small class="text-xs text-gray-500 mt-1 block">
          编辑指令会自动保存到浏览器本地存储中，下次访问时自动加载。
        </small>
      </div>

      <div class="form-group">
        <label
          for="function"
          class="block text-sm font-medium text-gray-700 mb-2"
          >功能类型:</label
        >
        <select
          v-model="functionType"
          id="function"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option
            v-for="option in functionTypeOptions"
            :key="option.value"
            :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-show="needsMask" class="form-group">
        <label
          for="maskUrl"
          class="block text-sm font-medium text-gray-700 mb-2"
          >蒙版URL:</label
        >
        <input
          type="text"
          id="maskUrl"
          v-model="maskUrl"
          placeholder="请输入蒙版图片URL"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div v-show="needsExpand" class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >扩展参数:</label
        >
        <div class="grid grid-cols-4 gap-3">
          <input
            type="number"
            id="topScale"
            v-model="topScale"
            placeholder="上扩展"
            step="0.1"
            min="0.5"
            max="3.0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input
            type="number"
            id="bottomScale"
            v-model="bottomScale"
            placeholder="下扩展"
            step="0.1"
            min="0.5"
            max="3.0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input
            type="number"
            id="leftScale"
            v-model="leftScale"
            placeholder="左扩展"
            step="0.1"
            min="0.5"
            max="3.0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input
            type="number"
            id="rightScale"
            v-model="rightScale"
            placeholder="右扩展"
            step="0.1"
            min="0.5"
            max="3.0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

      <div v-show="needsUpscale" class="form-group">
        <label
          for="upscaleFactor"
          class="block text-sm font-medium text-gray-700 mb-2"
          >超分倍数:</label
        >
        <input
          type="number"
          id="upscaleFactor"
          v-model="upscaleFactor"
          placeholder="2"
          min="2"
          max="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div class="form-group">
        <label for="n" class="block text-sm font-medium text-gray-700 mb-2"
          >生成数量:</label
        >
        <input
          type="number"
          id="n"
          v-model="n"
          min="1"
          max="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div class="form-group">
        <label
          for="dashScopeApiKey"
          class="block text-sm font-medium text-gray-700 mb-2">
          DashScope API密钥:
          <span
            v-if="dashScopeApiKey"
            class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ 已保存
          </span>
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            id="dashScopeApiKey"
            v-model="dashScopeApiKey"
            placeholder="请输入您的DashScope API密钥"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" />
          <button
            type="button"
            @click="clearApiKey"
            class="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
            title="清除API密钥">
            清除
          </button>
        </div>
        <small class="text-xs text-gray-500 mt-1 block">
          用于调用阿里云DashScope图像编辑API，请妥善保管。密钥会自动保存到浏览器本地存储中。
        </small>
      </div>

      <button
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 disabled:cursor-not-allowed"
        @click="handleSubmit"
        :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '提交编辑任务' }}
      </button>
    </div>

    <div
      v-show="showResult"
      class="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">任务结果</h4>
      <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <strong class="text-blue-800">任务ID:</strong>
        <span class="text-blue-700">{{ result.taskId || '暂无' }}</span>
      </div>
      <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <strong class="text-amber-800">状态:</strong>
        <span class="text-amber-700">{{ result.message }}</span>
      </div>
      <div
        v-if="result.images && result.images.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <img
          v-for="(image, index) in result.images"
          :key="index"
          :src="image"
          :alt="`结果图片 ${index + 1}`"
          class="w-full h-auto rounded-md border border-gray-200 shadow-sm" />
      </div>
    </div>

    <!-- 任务历史记录 -->
    <div class="mt-8">
      <TaskHistory />
    </div>
  </div>
</template>

<style scoped>
  /* 确保textarea可以调整大小 */
  textarea {
    resize: vertical;
    min-height: 80px;
  }
</style>
