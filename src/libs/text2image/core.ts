import type {
    Text2ImageRequest,
    Text2ImageStatusRequest,
    DashScopeResponse,
    TaskStatusResponse
} from './types';

export class Text2ImageCore {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * 创建文本转图像任务
     */
    async createTask(request: Text2ImageRequest): Promise<DashScopeResponse> {
        const key = request.dashScopeApiKey || this.apiKey;

        if (!key) {
            throw new Error('需要提供DASHSCOPE_API_KEY');
        }

        // 构建请求参数
        const requestBody = {
            model: request.model || 'wan2.2-t2i-plus',
            input: {
                prompt: request.prompt
            },
            parameters: {
                size: request.size || '1024*1024',
                n: request.n || 1,
                prompt_extend: false,
                // 随机数种子，用于控制模型生成内容的随机性。seed参数取值范围是[0, 2147483647]。
                // 如果不提供，则算法自动生成一个随机数作为种子。如果给定了，则根据n的值分别为n张图片生成seed参数，例如n=4，算法将分别生成seed、seed+ 1、seed+ 2、seed+3作为参数的图片。
                // 如果您希望生成内容保持相对稳定，请使用相同的seed参数值。
                seed: 171126
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
            throw new Error(`API请求失败: ${(errorText as any).message || '未知错误'}`);
        }

        return await response.json();
    }

    /**
     * 查询任务状态
     */
    async getTaskStatus(request: Text2ImageStatusRequest): Promise<TaskStatusResponse> {
        const key = request.dashScopeApiKey || this.apiKey;

        if (!key) {
            throw new Error('API配置错误，缺少DASHSCOPE_API_KEY');
        }

        // 查询任务状态
        const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${request.task_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`查询任务状态失败: ${errorText}`);
        }

        return await response.json();
    }
}

/**
 * 创建 Text2ImageCore 实例
 */
export const createText2ImageCore = (apiKey: string): Text2ImageCore => {
    return new Text2ImageCore(apiKey);
};
