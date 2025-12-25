import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DraftingController } from './drafting.controller';
import { DraftingService } from './drafting.service';
import { Document } from '../documents/entities/document.entity';
import { DocumentReviewer } from '../documents/entities/document-reviewer.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Document, DocumentReviewer])],
  controllers: [DraftingController],
  providers: [DraftingService],
  exports: [DraftingService],
})
export class DraftingModule {}
