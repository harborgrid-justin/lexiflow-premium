import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Error information for standard response
 */
export class StandardErrorDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid input data',
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'Error code',
    example: 'VAL_INVALID_INPUT',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Additional error details',
  })
  @IsOptional()
  details?: Record<string, unknown>;
}

/**
 * Standard Response DTO
 * Simplified response format for basic operations
 */
export class StandardResponseDto<T = unknown> {
  @ApiProperty({
    example: true,
    description: 'Operation success status',
  })
  @IsBoolean()
  readonly success!: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Response message',
  })
  @IsString()
  readonly message!: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  @IsOptional()
  readonly data?: T;

  @ApiPropertyOptional({
    description: 'Error details if any',
    type: StandardErrorDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StandardErrorDto)
  readonly error?: StandardErrorDto;

  @ApiProperty({
    example: 1639584000000,
    description: 'Unix timestamp in milliseconds',
  })
  @IsNumber()
  readonly timestamp!: number;

  @ApiPropertyOptional({
    example: 'abc-123-def-456',
    description: 'Request correlation ID',
  })
  @IsOptional()
  @IsString()
  readonly requestId?: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: StandardErrorDto,
    requestId?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = Date.now();
    this.requestId = requestId;
  }

  /**
   * Create a success response
   */
  static success<T>(
    message: string,
    data?: T,
    requestId?: string,
  ): StandardResponseDto<T> {
    return new StandardResponseDto(true, message, data, undefined, requestId);
  }

  /**
   * Create an error response
   */
  static error<T = undefined>(
    message: string,
    error?: StandardErrorDto,
    requestId?: string,
  ): StandardResponseDto<T> {
    return new StandardResponseDto<T>(
      false,
      message,
      undefined as T,
      error,
      requestId,
    );
  }
}
