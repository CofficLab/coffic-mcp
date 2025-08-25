import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getAllModels, getRecommendedModels, getModelsByCapability } from '../../libs/imageEdit';

// 查询图像编辑模型的 Astro action
export const getImageEditModels = defineAction({
    accept: 'json',
    input: z.object({
        filterByCapability: z.string().optional(),
        includeRecommended: z.boolean().optional().default(true)
    }),
    handler: async (input) => {
        try {
            let filteredModels = getAllModels();
            const { filterByCapability, includeRecommended = true } = input;

            // 按功能筛选
            if (filterByCapability) {
                filteredModels = getModelsByCapability(filterByCapability);
            }

            // 只包含推荐模型
            if (includeRecommended) {
                filteredModels = getRecommendedModels();
            }

            // 格式化模型信息
            const modelsText = filteredModels.map(model => {
                const capabilitiesText = model.capabilities.join(', ');
                const recommendationMark = model.recommended ? '⭐ ' : '  ';
                return `${recommendationMark}${model.name}: ${model.description}\n  能力: ${capabilitiesText}`;
            }).join('\n\n');

            return {
                message: '查询成功',
                models: filteredModels,
                total: filteredModels.length,
                formattedText: `支持的图像编辑模型：\n\n${modelsText}`
            };

        } catch (error) {
            console.error('查询图像编辑模型失败:', error);
            throw new Error(`查询图像编辑模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
});
