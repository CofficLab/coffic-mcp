<script setup lang="ts">
import { Button } from '@coffic/cosy-ui/vue';
import type { ModelInfo } from '@/libs/text2image/models';

interface FormData {
    prompt: string;
    model: string;
    size: string;
    count: number;
}

interface SizeOption {
    value: string;
    label: string;
}

interface CountOption {
    value: number;
    label: string;
}

interface Props {
    models: ModelInfo[];
    formData: FormData;
    selectedModelInfo: ModelInfo | null;
    isFormValid: boolean;
    isSubmitting: boolean;
    lang: string;
    sizeOptions: SizeOption[];
    countOptions: CountOption[];
    apiKeys: any[];
    onSubmit: () => void;
    onReset: () => void;
}

const props = defineProps<Props>();
</script>

<template>
    <div class="space-y-6">
        <!-- API Key 配置 -->
        <div v-for="apiKey in apiKeys" :key="apiKey.key" class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ lang === 'zh-cn' ? apiKey.name : apiKey.name }}
                <span class="text-red-500">*</span>
            </label>
            <input v-model="apiKey.storedValue.value" :type="'text'"
                :placeholder="apiKey.placeholder || (lang === 'zh-cn' ? '请输入API密钥' : 'Enter API key')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <div v-if="apiKey.description" class="mt-1 text-sm text-gray-500">
                {{ lang === 'zh-cn' ? apiKey.description : apiKey.description }}
            </div>
        </div>

        <!-- 模型选择 -->
        <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ lang === 'zh-cn' ? '选择模型' : 'Select Model' }}
                <span class="text-red-500">*</span>
            </label>
            <select v-model="formData.model"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">
                    {{ lang === 'zh-cn' ? '请选择模型' : 'Select a model' }}
                </option>
                <option v-for="model in models" :key="model.id" :value="model.id">
                    {{ model.name }}
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
            <textarea v-model="formData.prompt" :placeholder="lang === 'zh-cn'
                ? '描述您想要生成的图像内容，最多800个字符...'
                : 'Describe the image you want to generate, max 800 characters...'
                " maxlength="800" rows="4"
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
                <select v-model="formData.size"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option v-for="option in sizeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <!-- 生成数量 -->
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ lang === 'zh-cn' ? '生成数量' : 'Number of Images' }}
                </label>
                <select v-model="formData.count"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option v-for="option in countOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4">
            <Button @click="onSubmit" :disabled="!isFormValid || isSubmitting" size="lg" class="flex-1">
                <template v-if="isSubmitting">
                    {{ lang === 'zh-cn' ? '提交中...' : 'Submitting...' }}
                </template>
                <template v-else>
                    {{ lang === 'zh-cn' ? '开始生成' : 'Generate Image' }}
                </template>
            </Button>

            <Button @click="onReset" variant="outline" size="lg">
                {{ lang === 'zh-cn' ? '重置' : 'Reset' }}
            </Button>
        </div>
    </div>
</template>