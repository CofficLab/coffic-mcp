import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getAllModels, getRecommendedModels, getModelsByVersion, getModelsByType } from '../../libs/text2image';

// 查询文本转图像模型的 Astro action
export const getText2ImageModels = defineAction({
    accept: 'json',
    input: z.object({
        version: z.string().optional(),
        type: z.string().optional(),
        includeRecommended: z.boolean().optional().default(true)
    }),
    handler: async (input) => {
        try {
            let filteredModels = getAllModels();
            const { version, type, includeRecommended = true } = input;

            // 按版本筛选
            if (version) {
                filteredModels = getModelsByVersion(version);
            }

            // 按类型筛选
            if (type) {
                filteredModels = getModelsByType(type);
            }

            // 只包含推荐模型
            if (includeRecommended) {
                filteredModels = getRecommendedModels();
            }

            // 将扁平模型数组转换为分组结构
            const groupedModels = filteredModels.reduce((groups, model) => {
                const existingGroup = groups.find(g => g.version === model.version);
                if (existingGroup) {
                    existingGroup.models.push(model);
                } else {
                    groups.push({
                        version: model.version,
                        title: `通义万相文生图${model.version}`,
                        models: [model]
                    });
                }
                return groups;
            }, [] as { version: string; title: string; models: typeof filteredModels }[]);

            // 格式化模型信息
            const modelsText = filteredModels.map(model => {
                const recommendationMark = model.recommended ? '⭐ ' : '  ';
                return `${recommendationMark}${model.name} (${model.type})\n  描述: ${model.description}\n  版本: ${model.version}`;
            }).join('\n\n');

            return {
                success: true,
                message: '查询成功',
                data: {
                    models: groupedModels,
                    total: filteredModels.length,
                    formattedText: `文本转图像支持的模型:\n\n${modelsText}`
                }
            };

        } catch (error) {
            console.error('查询文本转图像模型失败:', error);
            return {
                success: false,
                message: '查询文本转图像模型失败',
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    },
});
