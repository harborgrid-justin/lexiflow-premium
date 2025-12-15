import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';

@Module({
  controllers: [KnowledgeController],
  providers: [],
  exports: []
})
export class KnowledgeModule {}
