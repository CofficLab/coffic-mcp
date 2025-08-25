import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getAllModels } from '@/libs/text2image';

// 查询文本转图像模型的 Astro action
export const getText2ImageModels = defineAction({
    accept: 'json',
    input: z.object({}),
    handler: async () => {
        try {
            const allModels = getAllModels();

            // 将扁平模型数组转换为分组结构
            const groupedModels = allModels.reduce((groups, model) => {
                const existingGroup = groups.find(g => g.version === model.version);
                if (existingGroup) {
                    existingGroup.models.push(model);
                } else {
                    groups.push({
                        version: model.version,
                        title: model.version,
                        models: [model]
                    });
                }
                return groups;
            }, [] as { version: string; title: string; models: typeof allModels }[]);

            // 格式化模型信息
            const modelsText = allModels.map(model => {
                const recommendationMark = model.recommended ? '⭐ ' : '  ';
                return `${recommendationMark}${model.name} (${model.type})\n  描述: ${model.description}\n  版本: ${model.version}`;
            }).join('\n\n');

            return {
                success: true,
                message: '查询成功',
                data: {
                    models: groupedModels,
                    total: allModels.length,
                    formattedText: `文本转图像支持的模型:\n\n${modelsText}`
                }
            };

        } catch (error) {
            return {
                success: false,
                message: '查询文本转图像模型失败',
                error: error instanceof Error ? error.message : '未知错误'
            };
        }
    },
});
