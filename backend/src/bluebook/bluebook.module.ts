import { Module } from '@nestjs/common';
import { BluebookController } from './bluebook.controller';
import { BluebookService } from './bluebook.service';

/**
 * Bluebook Module
 * Provides legal citation formatting according to Bluebook standards
 * Validates and formats case citations, statutes, and legal documents
 */
@Module({
  controllers: [BluebookController],
  providers: [BluebookService],
  exports: [BluebookService],
})
export class BluebookModule {}
