import { SetMetadata } from '@nestjs/common';
import { ApiKeyScope } from '../dto';
import { API_KEY_SCOPES } from '../guards/api-key.guard';

export const RequireApiKeyScopes = (...scopes: ApiKeyScope[]) =>
  SetMetadata(API_KEY_SCOPES, scopes);
