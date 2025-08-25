import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getModelByName } from '../../libs/imageEdit';

// 获取模型详细信息的 Astro action
export const getModelDetails = defineAction({
    accept: 'json',
    input: z.object({
        modelName: z.string().describe("模型名称")
    }),
    handler: async (input) => {
        try {
            const { modelName } = input;

            // 查找指定名称的模型
            const model = getModelByName(modelName);

            if (!model) {
                return {
                    success: false,
                    message: '未找到指定模型',
                    data: null
                };
            }

            return {
                success: true,
                message: '查询成功',
                data: {
                    model: model
                }
            };

        } catch (error) {
            console.error('查询模型详情失败:', error);
            return {
                success: false,
                message: '查询模型详情失败',
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    },
});
