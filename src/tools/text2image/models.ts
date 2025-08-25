import { getAllModels } from '@/libs/text2image';
import type { ModelInfo } from '@/libs/text2image';

export const text2imageModelsTool = {
    name: "text2image_models",
    prompt: "查询文本转图像支持的模型",
    schema: {},
    handler: async () => {
        try {
            const models = getAllModels();

            // 格式化模型信息
            const modelsText = models.map((m: ModelInfo) =>
                `${m.recommended ? '⭐ ' : '  '}${m.name} (${m.type})\n  描述: ${m.description}\n  版本: ${m.version}`
            ).join('\n\n');

            return {
                content: [{
                    type: "text" as const,
                    text: `文本转图像支持的模型:\n\n${modelsText}`
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