import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKeysModule } from '@api-keys/api-keys.module';
import {
  RateLimitService,
  RequestValidationService,
  WebhookSecurityService,
} from './services';
import { ApiKeyScopeGuard } from './guards';
import { RequestSigningInterceptor } from './interceptors';

@Module({
  imports: [ApiKeysModule],
  providers: [
    // Services
    RateLimitService,
    RequestValidationService,
    WebhookSecurityService,

    // Guards
    ApiKeyScopeGuard,

    // Interceptors
    RequestSigningInterceptor,
  ],
  exports: [
    // Services
    RateLimitService,
    RequestValidationService,
    WebhookSecurityService,

    // Guards
    ApiKeyScopeGuard,

    // Interceptors
    RequestSigningInterceptor,
  ],
})
export class ApiSecurityModule {}
