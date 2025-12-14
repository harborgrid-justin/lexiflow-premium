import { Module, Global } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
// TimeoutInterceptor is instantiated directly in main.ts with a timeout value
import { ValidationPipe } from './pipes/validation.pipe';

@Global()
@Module({
  providers: [
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    ValidationPipe,
  ],
  exports: [
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    ValidationPipe,
  ],
})
export class CommonModule {}
