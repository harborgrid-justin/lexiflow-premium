import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DraftingController } from './drafting.controller';
import { DraftingService } from './drafting.service';
import { Document } from '../documents/entities/document.entity';
import { DocumentReviewer } from '../documents/entities/document-reviewer.entity';
import { DraftingTemplate } from './entities/template.entity';
import { GeneratedDocument } from './entities/generated-document.entity';
import { Clause } from '../clauses/entities/clause.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Document,
      DocumentReviewer,
      DraftingTemplate,
      GeneratedDocument,
      Clause,
    ]),
  ],
  controllers: [DraftingController],
  providers: [DraftingService],
  exports: [DraftingService],
})
export class DraftingModule {}

