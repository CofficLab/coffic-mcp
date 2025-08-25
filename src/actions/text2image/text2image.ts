import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createText2ImageCore } from '@/libs/text2image';

// 文本转图像 Action
export const text2imageAction = defineAction({
    accept: 'json',
    input: z.object({
        prompt: z.string().describe("文字描述，最多800个字符"),
        size: z.string().optional().describe("默认值是1024*1024。图像宽高边长的像素范围为：[512, 1440]，单位像素。可任意组合以设置不同的图像分辨率，最高可达200万像素。"),
        n: z.number().optional().describe("生成图片数量，默认1"),
        model: z.string().optional().describe("模型，使用getText2ImageModels工具查询支持的模型，使用推荐的模型可得到最佳的效果"),
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

            // 执行文本转图像任务
            const result = await text2imageCore.createTask(input);

            return {
                message: '任务已提交',
                task_id: result.output.task_id,
                task_status: result.output.task_status,
                request_id: result.request_id
            };
        } catch (error) {
            throw new Error(`服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
});
