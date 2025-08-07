import { z } from "zod";

interface TaskResult {
    orig_prompt: string;
    actual_prompt: string;
    url: string;
}

interface TaskMetrics {
    TOTAL: number;
    SUCCEEDED: number;
    FAILED: number;
}

interface TaskOutput {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
    submit_time: string;
    scheduled_time: string;
    end_time?: string;
    results: TaskResult[];
    task_metrics: TaskMetrics;
}

interface TaskStatusResponse {
    request_id: string;
    output: TaskOutput;
    usage: {
        image_count: number;
    };
}

export const makeText2ImageStatusHandler = (apiKey: string) => {
    return async ({ task_id, dashScopeApiKey }: { task_id: string, dashScopeApiKey?: string }) => {
        const key = dashScopeApiKey || apiKey;

        try {
            // 检查API密钥
            if (!key) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "错误: API配置错误，缺少DASHSCOPE_API_KEY"
                    }],
                };
            }

            // 查询任务状态
            const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${task_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    content: [{
                        type: "text" as const,
                        text: `查询任务状态失败: ${errorText}`
                    }],
                };
            }

            const data: TaskStatusResponse = await response.json();

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
    schema: {
        task_id: z.string(),
        dashScopeApiKey: z.string().optional(),
    },
    getHandler: makeText2ImageStatusHandler
}; 