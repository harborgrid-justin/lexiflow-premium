import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T> {
  @ApiProperty({ example: true, description: 'Operation success status' })
  success!: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message!: string;

  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ example: null, description: 'Error details if any' })
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };

  @ApiProperty({ example: 1639584000000, description: 'Timestamp' })
  timestamp!: number;

  @ApiProperty({ example: 'abc-123-def', description: 'Request ID' })
  requestId?: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: { message: string; code?: string; details?: Record<string, unknown> },
    requestId?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = Date.now();
    this.requestId = requestId;
  }
}
