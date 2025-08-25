import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createImageEditStatusCore } from '../../libs/imageEdit';

// 图像编辑任务状态查询 Action
export const imageEditStatusAction = defineAction({
    accept: 'json',
    input: z.object({
        taskId: z.string().describe("图像编辑任务的ID"),
        dashScopeApiKey: z.string().describe("DashScope API密钥"),
    }),
    handler: async (input) => {
        try {
            // 创建状态查询核心实例
            const statusCore = createImageEditStatusCore();

            // 验证请求参数
            const validation = statusCore.validateRequest(input);
            if (!validation.success) {
                throw new Error(`参数验证失败: ${validation.error}`);
            }

            // 查询任务状态
            const result = await statusCore.queryStatus(validation.data!);

            return {
                message: result.message,
                status: result.status,
                images: result.images || [],
                error: result.error
            };
        } catch (error) {
            throw new Error(`服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
});

// 客户端调用函数
export async function callImageEditStatusAction(params: {
    taskId: string;
    dashScopeApiKey: string;
}) {
    try {
        // 使用 Astro Actions 的客户端调用方式
        const response = await fetch('/api/actions/imageEditStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}
