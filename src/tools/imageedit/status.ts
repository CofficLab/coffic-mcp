import { z } from "zod";
import { createImageEditStatusCore } from "@/libs/imageEdit";

export const makeImageEditStatusHandler = (apiKey: string) => {
    return async ({
        taskId,
        dashScopeApiKey
    }: {
        taskId: string;
        dashScopeApiKey?: string;
    }) => {
        // 创建状态查询核心实例
        const statusCore = createImageEditStatusCore(apiKey);

        // 验证请求参数
        const validation = statusCore.validateRequest({ taskId, dashScopeApiKey });
        if (!validation.success) {
            return {
                content: [{
                    type: "text" as const,
                    text: `参数验证失败: ${validation.error}`
                }],
            };
        }

        // 查询任务状态
        const result = await statusCore.queryStatus(validation.data!);

        if (result.success) {
            let message = result.message;
            if (result.images && result.images.length > 0) {
                message += `\n生成的图片：\n${result.images.map((img, index) => `图片${index + 1}: ${img}`).join('\n')}`;
            }

            return {
                content: [{
                    type: "text" as const,
                    text: message
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
    };
};

export const imageEditStatusTool = {
    name: "imageedit_status",
    prompt: "查询图像编辑任务的执行状态",
    schema: {
        taskId: z.string().describe("图像编辑任务的ID"),
        dashScopeApiKey: z.string().optional().describe("DashScope API密钥"),
    },
    getHandler: makeImageEditStatusHandler
};
