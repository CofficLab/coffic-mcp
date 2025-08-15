import { addTool } from './add';
import { calculateTool } from './calculate';
import { text2imageModelsTool } from './text2image/models';
import { text2imageTool, makeText2ImageHandler } from './text2image/create';
import { text2imageStatusTool, makeText2ImageStatusHandler } from './text2image/status';
import { imageEditModelsTool } from './imageedit/models';
import { imageEditTool, makeImageEditHandler } from './imageedit/create';
import { imageEditStatusTool, makeImageEditStatusHandler } from './imageedit/status';

const tools = {
    addTool: addTool,
    calculateTool: calculateTool,
    text2imageModelsTool: text2imageModelsTool,
    text2imageTool: text2imageTool,
    text2imageStatusTool: text2imageStatusTool,
    imageEditModelsTool: imageEditModelsTool,
    imageEditTool: imageEditTool,
    imageEditStatusTool: imageEditStatusTool,
    makeText2ImageHandler: makeText2ImageHandler,
    makeText2ImageStatusHandler: makeText2ImageStatusHandler,
    makeImageEditHandler: makeImageEditHandler,
    makeImageEditStatusHandler: makeImageEditStatusHandler,
}

export default tools;