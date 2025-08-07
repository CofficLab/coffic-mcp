import { z } from "zod";

interface DashScopeResponse {
    output: {
        task_id: string;
        task_status: string;
    };
    request_id: string;
}

export const makeText2ImageHandler = (apiKey: string) => {
    return async ({ prompt, size, n, model, dashScopeApiKey }: {
        prompt: string;
        size?: string;
        n?: number;
        model?: string;
        dashScopeApiKey?: string;
    }) => {
        const key = dashScopeApiKey || apiKey;

        try {
            if (!key) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "错误: 需要提供DASHSCOPE_API_KEY"
                    }],
                };
            }

            // 构建请求参数
            const requestBody = {
                model: model || 'wan2.2-t2i-plus',
                input: {
                    prompt: prompt
                },
                parameters: {
                    size: size || '1024*1024',
                    n: n || 1,
                    prompt_extend: false
                }
            };

            // 调用DashScope API
            const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
                method: 'POST',
                headers: {
                    'X-DashScope-Async': 'enable',
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.json();
                return {
                    content: [{
                        type: "text" as const,
                        text: `API请求失败: ${(errorText as any).message || '未知错误'}`
                    }],
                };
            }

            const data: DashScopeResponse = await response.json();

            return {
                content: [{
                    type: "text" as const,
                    text: `任务已提交，任务ID: ${data.output.task_id}，请等待15秒后查询任务状态`
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

export const text2imageTool = {
    name: "text2image",
    prompt: "根据提供的文字生成图片",
    schema: {
        prompt: z.string(),
        size: z.string().optional(),
        n: z.number().optional(),
        model: z.string().optional(),
        dashScopeApiKey: z.string().optional(),
    },
    getHandler: makeText2ImageHandler
};