import { z } from "zod";

export const imageEditModelsTool = {
    name: "imageedit_models",
    prompt: "查询图像编辑功能支持的模型列表",
    schema: {},
    handler: async () => {
        // TODO: 实现模型查询逻辑
        // 这里应该返回实际支持的模型列表

        const models = [
            {
                name: "wanx2.1-imageedit",
                description: "通用图像编辑模型，支持多种编辑任务",
                capabilities: ["整体风格化", "局部风格化", "指令编辑", "局部重绘", "去文字水印", "图像修复", "扩图", "图像超分", "图像上色", "线稿生图", "卡通形象控制"],
                recommended: true
            }
        ];

        return {
            content: [{
                type: "text" as const,
                text: `支持的图像编辑模型：\n${models.map(m =>
                    `${m.recommended ? '⭐ ' : '  '}${m.name}: ${m.description}\n  能力: ${m.capabilities.join(', ')}`
                ).join('\n\n')}`
            }],
        };
    },
};
