// 从功能模块导入 Actions
import * as imageEditActions from './imageEdit';
import * as text2imageActions from './text2image';

export const server = {
  // 图像编辑相关 Actions
  ...imageEditActions,

  // 文本转图像相关 Actions
  ...text2imageActions,
};
