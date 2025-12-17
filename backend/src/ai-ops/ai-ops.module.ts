import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiOpsController } from './ai-ops.controller';
import { AiOpsService } from './ai-ops.service';
import { VectorEmbedding } from './entities/vector-embedding.entity';
import { AIModel } from './entities/ai-model.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VectorEmbedding, AIModel]),
    AuthModule,
  ],
  controllers: [AiOpsController],
  providers: [AiOpsService],
  exports: [AiOpsService],
})
export class AiOpsModule {}
