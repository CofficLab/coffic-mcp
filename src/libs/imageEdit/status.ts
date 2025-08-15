import { z } from "zod";

// 类型定义
export interface ImageEditStatusResponse {
    request_id: string;
    output: {
        task_id: string;
        task_status: string;
        submit_time: string;
        scheduled_time: string;
        end_time: string;
        results: Array<{
            url: string;
        }>;
        task_metrics: {
            TOTAL: number;
            SUCCEEDED: number;
            FAILED: number;
        };
    };
    usage: {
        image_count: number;
    };
}

export interface ImageEditStatusResult {
    success: boolean;
    status: string;
    message: string;
    images?: string[];
    error?: string;
}

// 验证模式
export const imageEditStatusSchema = z.object({
    taskId: z.string().describe("图像编辑任务的ID"),
    dashScopeApiKey: z.string().describe("DashScope API密钥"),
});

export type ImageEditStatusRequest = z.infer<typeof imageEditStatusSchema>;

// 核心状态查询逻辑
export class ImageEditStatusCore {
    constructor(private defaultApiKey?: string) { }

    /**
     * 查询图像编辑任务状态
     */
    async queryStatus(request: ImageEditStatusRequest): Promise<ImageEditStatusResult> {
        const { taskId, dashScopeApiKey } = request;
        const apiKey = dashScopeApiKey || this.defaultApiKey;

        try {
            if (!apiKey) {
                return {
                    success: false,
                    status: 'error',
                    message: '需要提供DashScope API密钥',
                    error: 'MISSING_API_KEY'
                };
            }

            // 调用DashScope API查询任务状态
            const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    status: 'error',
                    message: `API请求失败: ${(errorData as any).message || '未知错误'}`,
                    error: 'API_REQUEST_FAILED'
                };
            }

            const data: ImageEditStatusResponse = await response.json();
            const status = data.output.task_status;
            console.log(data);

            if (status === 'SUCCEEDED') {
                const images = data.output.results || [];
                const endTime = new Date(data.output.end_time).toLocaleString('zh-CN');
                const totalTime = Math.round((new Date(data.output.end_time).getTime() - new Date(data.output.submit_time).getTime()) / 1000);

                if (images.length > 0) {
                    return {
                        success: true,
                        status: 'completed',
                        message: `图像编辑任务已完成！生成了 ${images.length} 张图片，完成时间: ${endTime}，总耗时: ${totalTime}秒`,
                        images: images.map((img: { url: string }) => img.url)
                    };
                } else {
                    return {
                        success: true,
                        status: 'completed',
                        message: `图像编辑任务已完成，但未返回图片结果，完成时间: ${endTime}`
                    };
                }
            } else if (status === 'FAILED') {
                return {
                    success: false,
                    status: 'failed',
                    message: '图像编辑任务执行失败',
                    error: 'TASK_FAILED'
                };
            } else {
                // 其他状态：PENDING, RUNNING 等
                const submitTime = new Date(data.output.submit_time).toLocaleString('zh-CN');
                return {
                    success: true,
                    status: 'pending',
                    message: `图像编辑任务正在执行中，状态: ${status}，提交时间: ${submitTime}`
                };
            }
        } catch (error) {
            return {
                success: false,
                status: 'error',
                message: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`,
                error: 'INTERNAL_ERROR'
            };
        }
    }

    /**
     * 验证请求参数
     */
    validateRequest(request: any): { success: boolean; data?: ImageEditStatusRequest; error?: string } {
        try {
            const validatedData = imageEditStatusSchema.parse(request);
            return { success: true, data: validatedData };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    success: false,
                    error: `参数验证失败: ${error.errors.map(e => e.message).join(', ')}`
                };
            }
            return { success: false, error: '未知验证错误' };
        }
    }
}

// 工厂函数
export function createImageEditStatusCore(defaultApiKey?: string): ImageEditStatusCore {
    return new ImageEditStatusCore(defaultApiKey);
}

