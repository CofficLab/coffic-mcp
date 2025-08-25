import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createText2ImageCore } from '@/libs/text2image';

// 文本转图像任务状态查询 Action
export const text2imageStatusAction = defineAction({
    accept: 'json',
    input: z.object({
        taskId: z.string().describe("文本转图像任务的ID"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    }),
    handler: async (input) => {
        try {
            // 从环境变量获取API密钥
            const apiKey = process.env.DASHSCOPE_API_KEY || input.dashScopeApiKey;

            if (!apiKey) {
                throw new Error("需要提供DASHSCOPE_API_KEY环境变量或参数");
            }

            // 创建文本转图像核心实例
            const text2imageCore = createText2ImageCore(apiKey);

            // 查询任务状态
            const result = await text2imageCore.getTaskStatus({
                task_id: input.taskId,
                dashScopeApiKey: apiKey
            });

            return {
                status: result.output.task_status,
                data: result
            };
        } catch (error) {
            throw new Error(`服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
});

// 客户端调用函数
export async function callText2ImageStatusAction(params: {
    taskId: string;
    dashScopeApiKey?: string;
}) {
    try {
        // 使用 Astro Actions 的客户端调用方式
        const response = await fetch('/api/actions/text2imageStatus', {
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
