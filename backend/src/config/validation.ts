import { ValidationPipeOptions } from '@nestjs/common';
import * as MasterConfig from './master.config';

export const validationPipeConfig: ValidationPipeOptions = {
  whitelist: MasterConfig.VALIDATION_WHITELIST,
  forbidNonWhitelisted: MasterConfig.VALIDATION_FORBID_NON_WHITELISTED,
  transform: MasterConfig.VALIDATION_TRANSFORM,
  transformOptions: {
    enableImplicitConversion: MasterConfig.VALIDATION_ENABLE_IMPLICIT_CONVERSION,
  },
  disableErrorMessages: MasterConfig.VALIDATION_DISABLE_ERROR_MESSAGES,
  validationError: {
    target: false,
    value: false,
  },
};
