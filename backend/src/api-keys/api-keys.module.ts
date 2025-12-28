import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyService } from './services/api.key.service';

@Module({
  imports: [],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    ApiKeyService,
  ],
  exports: [
    ApiKeysService,
    ApiKeyService,
  ],
})
export class ApiKeysModule {}
