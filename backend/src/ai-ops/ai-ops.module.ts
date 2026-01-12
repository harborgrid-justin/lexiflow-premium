import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiOpsController } from './ai-ops.controller';
import { AiOpsService } from './ai-ops.service';
import { AIModel } from './entities/ai-model.entity';
import { VectorEmbedding } from '@ai-dataops/entities/ai.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIModel, VectorEmbedding]),
    AuthModule,
  ],
  controllers: [AiOpsController],
  providers: [AiOpsService],
  exports: [AiOpsService, TypeOrmModule],
})
export class AiOpsModule {}
