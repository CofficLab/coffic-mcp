import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createImageEditCore, type ImageEditFunction } from '../../libs/imageEdit';

// 图像编辑Action
export const imageEditAction = defineAction({
    accept: 'json',
    input: z.object({
        imageUrl: z.string().describe("需要编辑的图片URL"),
        prompt: z.string().describe("编辑指令描述，最多800个字符"),
        function: z.enum([
            "stylization_all",
            "stylization_local",
            "description_edit",
            "description_edit_with_mask",
            "remove_watermark",
            "inpainting",
            "expand",
            "super_resolution",
            "colorization",
            "doodle",
            "control_cartoon_feature"
        ]).optional().describe("编辑功能类型，默认为整体风格化"),
        maskUrl: z.string().optional().describe("蒙版图片URL，用于指定编辑区域"),
        n: z.number().optional().describe("生成图片数量，默认1"),
        topScale: z.number().optional().describe("向上扩展的缩放比例，扩图功能使用"),
        bottomScale: z.number().optional().describe("向下扩展的缩放比例，扩图功能使用"),
        leftScale: z.number().optional().describe("向左扩展的缩放比例，扩图功能使用"),
        rightScale: z.number().optional().describe("向右扩展的缩放比例，扩图功能使用"),
        upscaleFactor: z.number().optional().describe("图像超分的放大倍数，超分功能使用"),
        model: z.string().optional().describe("使用的图像编辑模型"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    }),
    handler: async (input) => {
        try {
            // 从环境变量获取API密钥
            const apiKey = process.env.DASHSCOPE_API_KEY || input.dashScopeApiKey;

            if (!apiKey) {
                return {
                    success: false,
                    message: "错误: 需要提供DASHSCOPE_API_KEY环境变量或参数"
                };
            }

            // 创建图像编辑核心实例
            const imageEditCore = createImageEditCore(apiKey);

            // 验证请求参数
            const validation = imageEditCore.validateRequest(input);
            if (!validation.valid) {
                return {
                    success: false,
                    message: `参数验证失败: ${validation.errors.join(', ')}`
                };
            }

            // 执行图像编辑任务
            const result = await imageEditCore.editImage(input);

            return result;
        } catch (error) {
            return {
                success: false,
                message: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }
});

// 获取功能配置Action
export const getImageEditFunctionConfigAction = defineAction({
    accept: 'json',
    input: z.object({
        function: z.enum([
            "stylization_all",
            "stylization_local",
            "description_edit",
            "description_edit_with_mask",
            "remove_watermark",
            "inpainting",
            "expand",
            "super_resolution",
            "colorization",
            "doodle",
            "control_cartoon_feature"
        ]).describe("要查询的功能类型")
    }),
    handler: async (input) => {
        try {
            // 创建图像编辑核心实例（API密钥在这里不重要，只是获取配置）
            const imageEditCore = createImageEditCore("dummy");

            // 获取功能配置
            const config = imageEditCore.getFunctionConfig(input.function);

            return {
                success: true,
                config
            };
        } catch (error) {
            return {
                success: false,
                message: `获取功能配置失败: ${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }
});

// 获取所有功能类型Action
export const getAllImageEditFunctionsAction = defineAction({
    accept: 'json',
    input: z.object({}),
    handler: async () => {
        try {
            // 创建图像编辑核心实例（API密钥在这里不重要，只是获取功能列表）
            const imageEditCore = createImageEditCore("dummy");

            // 获取所有功能类型
            const functions = imageEditCore.getAllFunctions();

            // 获取每个功能的配置信息
            const functionConfigs = functions.map(func => ({
                function: func,
                ...imageEditCore.getFunctionConfig(func)
            }));

            return {
                success: true,
                functions: functionConfigs
            };
        } catch (error) {
            return {
                success: false,
                message: `获取功能列表失败: ${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }
});
