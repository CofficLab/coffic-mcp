// 统一导出文本转图像核心功能
export * from './models';
export * from './types';
export * from './core';

// 重新导出类型和函数，保持向后兼容
export type { ModelInfo, ModelGroup } from './models';
export type {
    TaskResult,
    TaskMetrics,
    TaskOutput,
    TaskStatusResponse,
    DashScopeResponse,
    Text2ImageRequest,
    Text2ImageStatusRequest
} from './types';

export {
    text2imageModels,
    getAllModels,
    getRecommendedModels,
    getModelsByVersion,
    getModelsByType,
    getModelByName,
    getAllVersions,
    getAllTypes
} from './models';

export {
    Text2ImageCore,
    createText2ImageCore
} from './core';
