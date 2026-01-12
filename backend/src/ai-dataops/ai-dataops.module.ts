import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { AiDataopsController } from './ai-dataops.controller';
import { AiDataopsService } from './ai-dataops.service';
import { VectorEmbedding } from './entities/ai.entity';
import { AiOpsModule } from '../ai-ops/ai-ops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VectorEmbedding]),
    AiOpsModule,
    AuthModule,
  ],
  controllers: [AiDataopsController],
  providers: [AiDataopsService],
  exports: [AiDataopsService],
})
export class AiDataopsModule {}
