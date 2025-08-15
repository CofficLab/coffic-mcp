import { z } from "zod";

interface ImageEditResponse {
    output: {
        task_id: string;
        task_status: string;
    };
    request_id: string;
}

// 支持的图像编辑功能类型
type ImageEditFunction =
    | "stylization_all"      // 整体风格化
    | "stylization_local"    // 局部风格化
    | "description_edit"     // 指令编辑
    | "description_edit_with_mask" // 局部重绘
    | "remove_watermark"     // 去文字水印
    | "inpainting"           // 图像修复
    | "expand"               // 扩图
    | "super_resolution"     // 图像超分
    | "colorization"         // 图像上色
    | "doodle"               // 线稿生图
    | "control_cartoon_feature"; // 卡通形象控制

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

            // 构建请求参数
            const requestBody = {
                model: model || 'wanx2.1-imageedit',
                input: {
                    function: editFunction || 'stylization_all',
                    prompt: prompt,
                    base_image_url: imageUrl,
                    ...(maskUrl && { mask_image_url: maskUrl })
                },
                parameters: {
                    n: n || 1,
                    ...(editFunction === 'expand' && {
                        top_scale: topScale || 1.5,
                        bottom_scale: bottomScale || 1.5,
                        left_scale: leftScale || 1.5,
                        right_scale: rightScale || 1.5
                    }),
                    ...(editFunction === 'super_resolution' && {
                        upscale_factor: upscaleFactor || 2
                    })
                }
            };

            // 调用DashScope图像编辑API
            const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis', {
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
                return {
                    content: [{
                        type: "text" as const,
                        text: `API请求失败: ${(errorText as any).message || '未知错误'}`
                    }],
                };
            }

            const data: ImageEditResponse = await response.json();

            return {
                content: [{
                    type: "text" as const,
                    text: `图像编辑任务已提交，任务ID: ${data.output.task_id}，请等待15秒（通过sleep命令）后查询任务状态`
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

export const imageEditTool = {
    name: "imageedit",
    prompt: "根据提供的图片和提示词进行图像编辑",
    schema: {
        imageUrl: z.string().describe("需要编辑的图片URL"),
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
