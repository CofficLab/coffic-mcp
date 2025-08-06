import { z } from "zod";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { scanAllTaskDirectories } from '@/utils/downloadImage';

interface DashScopeResponse {
    output: {
        task_id: string;
        task_status: string;
    };
    request_id: string;
}

export const makeText2ImageHandler = (apiKey: string) => {
    return async ({ prompt, size, n, model }: {
        prompt: string;
        size?: string;
        n?: number;
        model?: string;
    }) => {
        try {
            // 先检查是否有相同提示词的任务
            const existingTasks = await scanAllTaskDirectories();
            const matchingTask = existingTasks.find(task =>
                task.prompt === prompt
            );

            if (matchingTask) {
                console.log(`找到相同提示词的任务: ${matchingTask.taskId}`);
                return {
                    content: [{
                        type: "text" as const,
                        text: `找到相同提示词的任务: ${matchingTask.taskId}，直接返回结果`
                    }],
                };
            }

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

            console.log('准备调用DashScope API，请求参数是', requestBody);

            // 调用DashScope API
            const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
                method: 'POST',
                headers: {
                    'X-DashScope-Async': 'enable',
                    'Authorization': `Bearer ${apiKey}`,
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

            // 保存任务信息到本地
            await saveTaskInfo(data.output.task_id, prompt, data);

            return {
                content: [{
                    type: "text" as const,
                    text: `任务已提交，任务ID: ${data.output.task_id}，请等待处理完成`
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
    schema: {
        prompt: z.string(),
        size: z.string().optional(),
        n: z.number().optional(),
        model: z.string().optional(),
    },
    getHandler: makeText2ImageHandler
};

/**
 * 保存任务信息到本地
 * @param taskId 任务ID
 * @param prompt 原始提示词
 * @param apiResponse API响应数据
 */
async function saveTaskInfo(taskId: string, prompt: string, apiResponse: DashScopeResponse) {
    try {
        // 创建任务目录
        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');
        const taskDir = join(assetsDir, taskId);

        // 确保目录存在
        if (!existsSync(assetsDir)) {
            await mkdir(assetsDir, { recursive: true });
        }
        if (!existsSync(taskDir)) {
            await mkdir(taskDir, { recursive: true });
        }

        // 创建任务信息对象
        const taskInfo = {
            taskId: taskId,
            prompt: prompt,
            createdAt: new Date().toISOString(),
            status: apiResponse.output.task_status,
            requestId: apiResponse.request_id,
            apiResponse: apiResponse,
            // 这些字段将在任务完成后更新
            submitTime: null,
            endTime: null,
            images: []
        };

        // 保存任务信息到JSON文件
        const taskInfoPath = join(taskDir, 'task-info.json');
        await writeFile(taskInfoPath, JSON.stringify(taskInfo, null, 2), 'utf-8');

        console.log(`任务信息已保存到: ${taskInfoPath}`);

    } catch (error) {
        console.error('保存任务信息失败:', error);
        // 不抛出错误，因为主要功能（调用API）已经成功
    }
} 