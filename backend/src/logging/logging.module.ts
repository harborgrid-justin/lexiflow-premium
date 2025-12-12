import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { FileTransport } from './transports/file.transport';
import { ConsoleTransport } from './transports/console.transport';

/**
 * Logging Module
 * Provides centralized logging functionality with multiple transports
 */
@Global()
@Module({
  providers: [LoggingService, FileTransport, ConsoleTransport],
  exports: [LoggingService],
})
export class LoggingModule {}
