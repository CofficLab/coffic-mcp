import { z } from "zod";

interface ImageEditStatusResponse {
    output: {
        task_status: string;
        task_result?: {
            images?: Array<{
                url: string;
            }>;
        };
    };
    request_id: string;
}

export const makeImageEditStatusHandler = (apiKey: string) => {
    return async ({
        taskId,
        dashScopeApiKey
    }: {
        taskId: string;
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

            // 调用DashScope API查询任务状态
            const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
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

            const data: ImageEditStatusResponse = await response.json();
            const status = data.output.task_status;

            if (status === 'SUCCEEDED') {
                const images = data.output.task_result?.images || [];
                if (images.length > 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: `图像编辑任务已完成！\n生成的图片：\n${images.map((img, index) => `图片${index + 1}: ${img.url}`).join('\n')}`
                        }],
                    };
                } else {
                    return {
                        content: [{
                            type: "text" as const,
                            text: "图像编辑任务已完成，但未返回图片结果"
                        }],
                    };
                }
            } else if (status === 'FAILED') {
                return {
                    content: [{
                        type: "text" as const,
                        text: "图像编辑任务执行失败"
                    }],
                };
            } else {
                return {
                    content: [{
                        type: "text" as const,
                        text: `图像编辑任务正在执行中，状态: ${status}`
                    }],
                };
            }
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

export const imageEditStatusTool = {
    name: "imageedit_status",
    prompt: "查询图像编辑任务的执行状态",
    schema: {
        taskId: z.string().describe("图像编辑任务的ID"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    },
    getHandler: makeImageEditStatusHandler
};
