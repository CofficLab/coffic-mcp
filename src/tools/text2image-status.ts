import { z } from "zod";
import { updateTaskWithImages } from '@/utils/downloadImage';

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
    return async ({ task_id }: { task_id: string }) => {
        try {
            // 检查API密钥
            if (!apiKey) {
                console.error('缺少DASHSCOPE_API_KEY');
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
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('DashScope任务查询错误:', response.status, errorText);
                return {
                    content: [{
                        type: "text" as const,
                        text: `查询任务状态失败: ${errorText}`
                    }],
                };
            }

            const data: TaskStatusResponse = await response.json();
            console.log('data', data);

            // 如果任务成功，自动下载图片并更新任务数据
            if (data.output?.task_status === 'SUCCEEDED') {
                try {
                    await updateTaskWithImages(task_id, data);
                } catch (error) {
                    console.error('自动下载图片失败:', error);
                    // 不抛出错误，避免影响主要功能
                }
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `任务状态: ${data.output?.task_status || 'UNKNOWN'}\n任务ID: ${task_id}\n提交时间: ${data.output?.submit_time || 'N/A'}\n结束时间: ${data.output?.end_time || 'N/A'}`
                }],
            };

        } catch (error) {
            console.error('查询任务状态错误:', error);
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
    },
    getHandler: makeText2ImageStatusHandler
}; 