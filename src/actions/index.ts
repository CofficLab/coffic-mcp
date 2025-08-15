import { getImageEditModels } from './getImageEditModels';
import { getImageEditCapabilities } from './getImageEditCapabilities';
import { getModelsByCapabilityAction } from './getModelsByCapability';
import { getModelDetails } from './getModelDetails';
import { imageEditAction, getImageEditFunctionConfigAction, getAllImageEditFunctionsAction } from './imageEdit';

export const server = {
  getImageEditModels,
  getImageEditCapabilities,
  getModelsByCapabilityAction,
  getModelDetails,
  imageEditAction,
  getImageEditFunctionConfigAction,
  getAllImageEditFunctionsAction,
};
