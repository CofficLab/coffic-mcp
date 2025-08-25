export interface ModelInfo {
    id: string;
    name: string;
    version: string;
    type: string;
    description: string;
    recommended: boolean;
}

const models: ModelInfo[] = [
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
    },
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
    },
    {
        id: 'wanx2.0-t2i-turbo',
        name: 'wanx2.0-t2i-turbo',
        version: '2.0',
        type: '极速版',
        description: '万相2.0极速版。擅长质感人像与创意设计，性价比高。',
        recommended: false
    }
];

// 导出模型数据
export const text2imageModels = models;
