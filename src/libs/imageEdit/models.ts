// 图像编辑模型信息接口
export interface ImageEditModel {
    name: string;
    description: string;
    capabilities: string[];
    recommended: boolean;
}

// 支持的图像编辑模型数据
export const imageEditModels: ImageEditModel[] = [
    {
        name: "wanx2.1-imageedit",
        description: "通用图像编辑模型，支持多种编辑任务",
        capabilities: [
            "整体风格化",
            "局部风格化",
            "指令编辑",
            "局部重绘",
            "去文字水印",
            "图像修复",
            "扩图",
            "图像超分",
            "图像上色",
            "线稿生图",
            "卡通形象控制"
        ],
        recommended: true
    }
];

// 获取所有模型
export const getAllModels = () => imageEditModels;

// 获取推荐模型
export const getRecommendedModels = () => imageEditModels.filter(model => model.recommended);

// 按功能筛选模型
export const getModelsByCapability = (capability: string) => {
    return imageEditModels.filter(model =>
        model.capabilities.some(cap =>
            cap.toLowerCase().includes(capability.toLowerCase())
        )
    );
};

// 获取所有支持的功能
export const getAllCapabilities = () => {
    const allCapabilities = new Set<string>();
    imageEditModels.forEach(model => {
        model.capabilities.forEach(capability => {
            allCapabilities.add(capability);
        });
    });
    return Array.from(allCapabilities).sort();
};

// 获取模型详情
export const getModelByName = (modelName: string) => {
    return imageEditModels.find(m =>
        m.name.toLowerCase() === modelName.toLowerCase()
    );
};
