import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getAllCapabilities } from '../../libs/imageEdit';

// 获取所有支持的编辑功能的 Astro action
export const getImageEditCapabilities = defineAction({
    accept: 'json',
    input: z.object({}),
    handler: async () => {
        try {
            const capabilitiesList = getAllCapabilities();

            return {
                message: '查询成功',
                capabilities: capabilitiesList,
                total: capabilitiesList.length
            };

        } catch (error) {
            console.error('查询图像编辑功能失败:', error);
            throw new Error(`查询图像编辑功能失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    },
});
