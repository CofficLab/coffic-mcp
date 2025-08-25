import { z } from "zod";
import { createText2ImageCore } from '@/libs/text2image';
import type { Text2ImageRequest } from '@/libs/text2image';

export const makeText2ImageHandler = (apiKey: string) => {
    return async (request: Text2ImageRequest) => {
        try {
            const core = createText2ImageCore(apiKey);
            const data = await core.createTask(request);

            return {
                content: [{
                    type: "text" as const,
                    text: `任务已提交，任务ID: ${data.output.task_id}，请等待15秒（通过sleep命令）后查询任务状态`
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
        prompt: z.string().describe("文字描述，最多800个字符"),
        size: z.string().optional().describe("默认值是1024*1024。图像宽高边长的像素范围为：[512, 1440]，单位像素。可任意组合以设置不同的图像分辨率，最高可达200万像素。"),
        n: z.number().optional().describe("生成图片数量，默认1"),
        model: z.string().optional().describe("模型，使用text2image_models工具查询支持的模型，使用推荐的模型可得到最佳的效果"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    },
    getHandler: makeText2ImageHandler
};