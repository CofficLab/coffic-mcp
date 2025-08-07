
export interface ModelInfo {
    id: string;
    name: string;
    version: string;
    type: string;
    description: string;
    recommended: boolean;
}

export interface ModelGroup {
    version: string;
    title: string;
    models: ModelInfo[];
}

const models: ModelGroup[] = [
    {
        version: '2.2',
        title: '通义万相文生图2.2 (最新版本)',
        models: [
            {
                id: 'wan2.2-t2i-flash',
                name: 'wan2.2-t2i-flash',
                version: '2.2',
                type: '极速版',
                description: '万相2.2极速版，当前最新模型。在创意性、稳定性、写实质感上全面升级，生成速度快，性价比高。',
                recommended: true
            },
            {
                id: 'wan2.2-t2i-plus',
                name: 'wan2.2-t2i-plus',
                version: '2.2',
                type: '专业版',
                description: '万相2.2专业版，当前最新模型。在创意性、稳定性、写实质感上全面升级，生成细节丰富。',
                recommended: true
            }
        ]
    },
    {
        version: '2.1',
        title: '通义万相文生图2.1',
        models: [
            {
                id: 'wanx2.1-t2i-turbo',
                name: 'wanx2.1-t2i-turbo',
                version: '2.1',
                type: '极速版',
                description: '万相2.1极速版。生成速度快，效果均衡。',
                recommended: false
            },
            {
                id: 'wanx2.1-t2i-plus',
                name: 'wanx2.1-t2i-plus',
                version: '2.1',
                type: '专业版',
                description: '万相2.1专业版。生成图像细节更丰富，速度稍慢。',
                recommended: false
            }
        ]
    },
    {
        version: '2.0',
        title: '通义万相文生图2.0',
        models: [
            {
                id: 'wanx2.0-t2i-turbo',
                name: 'wanx2.0-t2i-turbo',
                version: '2.0',
                type: '极速版',
                description: '万相2.0极速版。擅长质感人像与创意设计，性价比高。',
                recommended: false
            }
        ]
    }
];

export const text2imageModelsTool = {
    name: "text2image_models",
    prompt: "查询文本转图像支持的模型",
    schema: {},
    handler: async () => {
        try {
            // 格式化模型信息
            const modelsText = models.map(group => {
                const groupText = group.models.map(model =>
                    `- ${model.name} (${model.type})\n  描述: ${model.description}\n  推荐: ${model.recommended ? '是' : '否'}`
                ).join('\n');
                return `${group.title}:\n${groupText}`;
            }).join('\n\n');

            return {
                content: [{
                    type: "text" as const,
                    text: `文本转图像支持的模型:\n\n${modelsText}`
                }],
            };

        } catch (error) {
            return {
                content: [{
                    type: "text" as const,
                    text: `查询模型信息失败: ${error instanceof Error ? error.message : '未知错误'}`
                }],
            };
        }
    },
};