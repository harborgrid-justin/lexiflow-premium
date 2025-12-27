import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OcrService } from './ocr.service';
import { FileStorageModule } from '@file-storage/file-storage.module';

@Module({
  imports: [ConfigModule, FileStorageModule],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
