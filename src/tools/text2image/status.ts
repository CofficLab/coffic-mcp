import { z } from "zod";
import { createText2ImageCore } from '@/libs/text2image';
import type { Text2ImageStatusRequest } from '@/libs/text2image';

export const makeText2ImageStatusHandler = (apiKey: string) => {
    return async (request: Text2ImageStatusRequest) => {
        try {
            const core = createText2ImageCore(apiKey);
            const data = await core.getTaskStatus(request);

            // 返回供应商的原始数据
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(data, null, 2)
                }],
            };

        } catch (error) {
            return {
                content: [{
                    type: "text" as const,
                    text: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`
                }],
            };
        }
    };
};

export const text2imageStatusTool = {
    name: "text2image_status",
    prompt: "查询文本转图像任务状态",
    schema: {
        task_id: z.string().describe("任务ID"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    },
    getHandler: makeText2ImageStatusHandler
}; 