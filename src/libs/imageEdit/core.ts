import { z } from "zod";

// 支持的图像编辑功能类型
export type ImageEditFunction =
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

// 图像编辑请求参数接口
export interface ImageEditRequest {
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
}

// 图像编辑响应接口
export interface ImageEditResponse {
    output: {
        task_id: string;
        task_status: string;
    };
    request_id: string;
}

// 图像编辑结果接口
export interface ImageEditResult {
    success: boolean;
    taskId?: string;
    message: string;
    error?: string;
}

// 图像编辑核心功能
export class ImageEditCore {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * 执行图像编辑任务
     */
    async editImage(request: ImageEditRequest): Promise<ImageEditResult> {
        const key = request.dashScopeApiKey || this.apiKey;

        try {
            if (!key) {
                return {
                    success: false,
                    message: "错误: 需要提供DASHSCOPE_API_KEY"
                };
            }

            // 构建请求参数
            const requestBody = {
                model: request.model || 'wanx2.1-imageedit',
                input: {
                    function: request.function || 'stylization_all',
                    prompt: request.prompt,
                    base_image_url: request.imageUrl,
                    ...(request.maskUrl && { mask_image_url: request.maskUrl })
                },
                parameters: {
                    n: request.n || 1,
                    ...(request.function === 'expand' && {
                        top_scale: request.topScale || 1.5,
                        bottom_scale: request.bottomScale || 1.5,
                        left_scale: request.leftScale || 1.5,
                        right_scale: request.rightScale || 1.5
                    }),
                    ...(request.function === 'super_resolution' && {
                        upscale_factor: request.upscaleFactor || 2
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
                    success: false,
                    message: `API请求失败: ${(errorText as any).message || '未知错误'}`
                };
            }

            const data: ImageEditResponse = await response.json();

            return {
                success: true,
                taskId: data.output.task_id,
                message: `图像编辑任务已提交，任务ID: ${data.output.task_id}，请等待15秒后查询任务状态`
            };
        } catch (error) {
            return {
                success: false,
                message: `服务器内部错误: ${error instanceof Error ? error.message : '未知错误'}`
            };
        }
    }

    /**
     * 验证图像编辑请求参数
     */
    validateRequest(request: ImageEditRequest): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!request.imageUrl) {
            errors.push("图片URL是必需的");
        }

        if (!request.prompt) {
            errors.push("编辑指令是必需的");
        }

        if (request.prompt.length > 800) {
            errors.push("编辑指令不能超过800个字符");
        }

        // 验证需要蒙版的功能
        if ((request.function === 'description_edit_with_mask' || request.function === 'inpainting') && !request.maskUrl) {
            errors.push(`${request.function}功能需要提供蒙版图片URL`);
        }

        // 验证扩展参数
        if (request.function === 'expand') {
            if (request.topScale && (request.topScale < 0.5 || request.topScale > 3.0)) {
                errors.push("上扩展比例必须在0.5到3.0之间");
            }
            if (request.bottomScale && (request.bottomScale < 0.5 || request.bottomScale > 3.0)) {
                errors.push("下扩展比例必须在0.5到3.0之间");
            }
            if (request.leftScale && (request.leftScale < 0.5 || request.leftScale > 3.0)) {
                errors.push("左扩展比例必须在0.5到3.0之间");
            }
            if (request.rightScale && (request.rightScale < 0.5 || request.rightScale > 3.0)) {
                errors.push("右扩展比例必须在0.5到3.0之间");
            }
        }

        // 验证超分参数
        if (request.function === 'super_resolution') {
            if (request.upscaleFactor && (request.upscaleFactor < 2 || request.upscaleFactor > 4)) {
                errors.push("超分倍数必须在2到4之间");
            }
        }

        // 验证生成数量
        if (request.n && (request.n < 1 || request.n > 4)) {
            errors.push("生成数量必须在1到4之间");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取功能配置信息
     */
    getFunctionConfig(functionType: ImageEditFunction) {
        const configs = {
            stylization_all: {
                name: '整体风格化',
                description: '将整张图片转换为指定风格',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            stylization_local: {
                name: '局部风格化',
                description: '将图片的特定部分转换为指定风格',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            description_edit: {
                name: '指令编辑',
                description: '根据文字描述修改图片中的特定内容',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            description_edit_with_mask: {
                name: '局部重绘',
                description: '根据文字描述和蒙版指定区域进行精确重绘',
                needsMask: true,
                needsExpand: false,
                needsUpscale: false
            },
            inpainting: {
                name: '图像修复',
                description: '修复图片中的缺陷，需要提供蒙版',
                needsMask: true,
                needsExpand: false,
                needsUpscale: false
            },
            remove_watermark: {
                name: '去文字水印',
                description: '去除图片中的水印和文字',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            expand: {
                name: '扩图',
                description: '向四个方向扩展图片，支持自定义缩放比例',
                needsMask: false,
                needsExpand: true,
                needsUpscale: false
            },
            super_resolution: {
                name: '图像超分',
                description: '提高图片分辨率，支持自定义放大倍数',
                needsMask: false,
                needsExpand: false,
                needsUpscale: true
            },
            colorization: {
                name: '图像上色',
                description: '为黑白图片添加颜色，根据提示词描述上色',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            doodle: {
                name: '线稿生图',
                description: '将线稿或涂鸦转换为完整的图片',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            },
            control_cartoon_feature: {
                name: '卡通形象控制',
                description: '支持参考卡通形象生成图像',
                needsMask: false,
                needsExpand: false,
                needsUpscale: false
            }
        };

        return configs[functionType];
    }

    /**
     * 获取所有支持的功能类型
     */
    getAllFunctions(): ImageEditFunction[] {
        return [
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
        ];
    }
}

// 创建图像编辑核心实例的工厂函数
export function createImageEditCore(apiKey: string): ImageEditCore {
    return new ImageEditCore(apiKey);
}
