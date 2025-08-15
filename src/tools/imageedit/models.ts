import { getAllModels } from '@/libs/imageEdit';
import type { ImageEditModel } from '@/libs/imageEdit';

export const imageEditModelsTool = {
    name: "imageedit_models",
    prompt: "查询图像编辑功能支持的模型列表",
    schema: {},
    handler: async () => {
        try {
            const models = getAllModels();

            // 格式化模型信息
            const modelsText = models.map((m: ImageEditModel) =>
                `${m.recommended ? '⭐ ' : '  '}${m.name}: ${m.description}\n  能力: ${m.capabilities.join(', ')}`
            ).join('\n\n');

            return {
                content: [{
                    type: "text" as const,
                    text: `支持的图像编辑模型：\n\n${modelsText}`
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: "text" as const,
                    text: `查询模型信息失败: ${error instanceof Error ? error.message : '未知错误'}`
                }],
            };
        }
    },
};
