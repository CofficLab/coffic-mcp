import { z } from "zod";
import { createImageEditCore, type ImageEditFunction } from "@/libs/imageEdit";

export const makeImageEditHandler = (apiKey: string) => {
    return async ({
        imageUrl,
        prompt,
        function: editFunction,
        maskUrl,
        n,
        topScale,
        bottomScale,
        leftScale,
        rightScale,
        upscaleFactor,
        model,
        dashScopeApiKey
    }: {
        imageUrl: string;
        prompt: string;
        function?: ImageEditFunction;
        maskUrl?: string;
        n?: number;
        topScale?: number;
        bottomScale?: number;
        leftScale?: number;
        rightScale?: number;
        upscaleFactor?: number;
        model?: string;
        dashScopeApiKey?: string;
    }) => {
        try {
            // 创建图像编辑核心实例
            const imageEditCore = createImageEditCore(apiKey);

            // 构建请求参数
            const request = {
                imageUrl,
                prompt,
                function: editFunction,
                maskUrl,
                n,
                topScale,
                bottomScale,
                leftScale,
                rightScale,
                upscaleFactor,
                model,
                dashScopeApiKey
            };

            // 验证请求参数
            const validation = imageEditCore.validateRequest(request);
            if (!validation.valid) {
                return {
                    content: [{
                        type: "text" as const,
                        text: `参数验证失败: ${validation.errors.join(', ')}`
                    }],
                };
            }

            // 执行图像编辑任务
            const result = await imageEditCore.editImage(request);

            if (result.success) {
                return {
                    content: [{
                        type: "text" as const,
                        text: result.message
                    }],
                };
            } else {
                return {
                    content: [{
                        type: "text" as const,
                        text: result.message
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

export const imageEditTool = {
    name: "imageedit",
    prompt: "根据提供的图片和提示词进行图像编辑",
    schema: {
        imageUrl: z.string().describe("输入图像的URL或 Base64 编码数据，其中 Base64 编码格式为：data:{MIME_type};base64,{base64_data}"),
        prompt: z.string().describe("编辑指令描述，最多800个字符"),
        function: z.enum(["stylization_all", "stylization_local", "description_edit", "description_edit_with_mask", "remove_watermark", "inpainting", "expand", "super_resolution", "colorization", "doodle", "control_cartoon_feature"]).optional().describe("编辑功能类型，默认为整体风格化"),
        maskUrl: z.string().optional().describe("蒙版图片URL，用于指定编辑区域（局部重绘、图像修复等需要）"),
        n: z.number().optional().describe("生成图片数量，默认1"),
        topScale: z.number().optional().describe("向上扩展的缩放比例，扩图功能使用，默认1.5"),
        bottomScale: z.number().optional().describe("向下扩展的缩放比例，扩图功能使用，默认1.5"),
        leftScale: z.number().optional().describe("向左扩展的缩放比例，扩图功能使用，默认1.5"),
        rightScale: z.number().optional().describe("向右扩展的缩放比例，扩图功能使用，默认1.5"),
        upscaleFactor: z.number().optional().describe("图像超分的放大倍数，超分功能使用，默认2"),
        model: z.string().optional().describe("使用的图像编辑模型，使用imageedit_models工具查询支持的模型"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    },
    getHandler: makeImageEditHandler
};
