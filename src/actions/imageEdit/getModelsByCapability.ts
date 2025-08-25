import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getModelsByCapability } from '../../libs/imageEdit';

// 按功能查询支持的模型的 Astro action
export const getModelsByCapabilityAction = defineAction({
    accept: 'json',
    input: z.object({
        capability: z.string().describe("要查询的编辑功能名称")
    }),
    handler: async (input) => {
        try {
            const { capability } = input;

            // 查找支持指定功能的模型
            const supportedModels = getModelsByCapability(capability);

            if (supportedModels.length === 0) {
                return {
                    message: '未找到支持该功能的模型',
                    capability: capability,
                    models: [],
                    total: 0
                };
            }

            return {
                message: '查询成功',
                capability: capability,
                models: supportedModels,
                total: supportedModels.length
            };

        } catch (error) {
            console.error('按功能查询模型失败:', error);
            throw new Error(`按功能查询模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
});
