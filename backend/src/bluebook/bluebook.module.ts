import { Module } from '@nestjs/common';
import { BluebookController } from './bluebook.controller';
import { BluebookService } from './bluebook.service';

@Module({
  controllers: [BluebookController],
  providers: [BluebookService],
  exports: [BluebookService],
})
export class BluebookModule {}
