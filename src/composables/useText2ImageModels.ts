import { ref, onMounted } from 'vue';
import { actions } from 'astro:actions';
import { useUIState } from '@/composables/useUIState';
import type { ModelGroup } from '@/libs/text2image';

export function useText2ImageModels() {
    // 响应式数据
    const models = ref<ModelGroup[]>([]);
    const isSubmitting = ref(false);

    // UI状态管理
    const { showSuccessMessage, showErrorMessage } = useUIState();

    // 方法
    const fetchModels = async () => {
        isSubmitting.value = true;

        try {
            // 使用 actions 调用
            const { data, error } = await actions.getText2ImageModels({});

            if (error) {
                throw new Error(error.message || '查询失败');
            }

            if (data && data.data) {
                models.value = data.data.models || [];
                showSuccessMessage(`成功获取 ${models.value.length} 个模型组`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            showErrorMessage(errorMessage);
            console.error('获取模型列表失败:', err);
        } finally {
            isSubmitting.value = false;
        }
    };

    // 组件挂载时获取模型列表
    onMounted(() => {
        fetchModels();
    });

    return {
        // 状态
        models,
        isSubmitting,

        // 方法
        fetchModels,
    };
}
