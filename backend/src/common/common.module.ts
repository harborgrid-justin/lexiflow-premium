import { Module, Global } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';

@Global()
@Module({
  providers: [
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    TimeoutInterceptor,
    ValidationPipe,
  ],
  exports: [
    HttpExceptionFilter,
    AllExceptionsFilter,
    TransformInterceptor,
    LoggingInterceptor,
    TimeoutInterceptor,
    ValidationPipe,
  ],
})
export class CommonModule {}
