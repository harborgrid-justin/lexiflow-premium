import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiDataopsController } from './ai-dataops.controller';
import { AiDataopsService } from './ai-dataops.service';
import { VectorEmbedding, AIModel } from './entities/ai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VectorEmbedding, AIModel])],
  controllers: [AiDataopsController],
  providers: [AiDataopsService],
  exports: [AiDataopsService],
})
export class AiDataopsModule {}
