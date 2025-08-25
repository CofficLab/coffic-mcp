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

// 获取所有模型
export const getAllModels = (): ModelInfo[] => {
    return models.flatMap(group => group.models);
};

// 获取推荐模型
export const getRecommendedModels = (): ModelInfo[] => {
    return getAllModels().filter(model => model.recommended);
};

// 根据版本获取模型
export const getModelsByVersion = (version: string): ModelInfo[] => {
    const group = models.find(g => g.version === version);
    return group ? group.models : [];
};

// 根据类型获取模型
export const getModelsByType = (type: string): ModelInfo[] => {
    return getAllModels().filter(model => model.type === type);
};

// 根据名称获取模型
export const getModelByName = (name: string): ModelInfo | undefined => {
    return getAllModels().find(model => model.name === name);
};

// 获取所有版本
export const getAllVersions = (): string[] => {
    return models.map(group => group.version);
};

// 获取所有类型
export const getAllTypes = (): string[] => {
    const types = new Set<string>();
    getAllModels().forEach(model => types.add(model.type));
    return Array.from(types);
};

// 导出模型数据
export const text2imageModels = models;
