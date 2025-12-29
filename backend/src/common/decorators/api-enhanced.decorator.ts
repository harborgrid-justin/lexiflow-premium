import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PaginatedResponseDto,
  SuccessResponseDto,
  ErrorResponseDto,
} from '@common/dto';

/**
 * Standard API Response Documentation
 * Automatically documents common HTTP responses
 */
export function ApiStandardResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * API Create Endpoint Documentation
 * Documents a standard create endpoint with appropriate responses
 */
export function ApiCreateOperation(options: {
  summary: string;
  description?: string;
  responseType: Type<unknown>;
  tag?: string;
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiResponse({
      status: 201,
      description: 'Resource created successfully',
      type: options.responseType,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Resource already exists',
      type: ErrorResponseDto,
    }),
    ApiStandardResponses(),
    ApiBearerAuth('JWT-auth'),
  ];

  if (options.tag) {
    decorators.push(ApiTags(options.tag));
  }

  return applyDecorators(...decorators);
}

/**
 * API Read (Get One) Endpoint Documentation
 * Documents a standard get-by-id endpoint
 */
export function ApiReadOperation(options: {
  summary: string;
  description?: string;
  responseType: Type<unknown>;
  tag?: string;
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Resource UUID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Resource retrieved successfully',
      type: options.responseType,
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ApiStandardResponses(),
    ApiBearerAuth('JWT-auth'),
  ];

  if (options.tag) {
    decorators.push(ApiTags(options.tag));
  }

  return applyDecorators(...decorators);
}

/**
 * API List Endpoint Documentation
 * Documents a standard list/search endpoint with pagination
 */
export function ApiListOperation(options: {
  summary: string;
  description?: string;
  responseType: Type<unknown>;
  tag?: string;
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiExtraModels(PaginatedResponseDto, options.responseType),
    ApiResponse({
      status: 200,
      description: 'List retrieved successfully',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(options.responseType) },
              },
            },
          },
        ],
      },
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (1-based)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page',
      example: 20,
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
      example: 'desc',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search query',
      example: 'john doe',
    }),
    ApiStandardResponses(),
    ApiBearerAuth('JWT-auth'),
  ];

  if (options.tag) {
    decorators.push(ApiTags(options.tag));
  }

  return applyDecorators(...decorators);
}

/**
 * API Update Endpoint Documentation
 * Documents a standard update endpoint
 */
export function ApiUpdateOperation(options: {
  summary: string;
  description?: string;
  responseType: Type<unknown>;
  tag?: string;
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Resource UUID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 200,
      description: 'Resource updated successfully',
      type: options.responseType,
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Update violates constraints',
      type: ErrorResponseDto,
    }),
    ApiStandardResponses(),
    ApiBearerAuth('JWT-auth'),
  ];

  if (options.tag) {
    decorators.push(ApiTags(options.tag));
  }

  return applyDecorators(...decorators);
}

/**
 * API Delete Endpoint Documentation
 * Documents a standard delete endpoint
 */
export function ApiDeleteOperation(options: {
  summary: string;
  description?: string;
  tag?: string;
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'Resource UUID',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: 204,
      description: 'Resource deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Resource cannot be deleted',
      type: ErrorResponseDto,
    }),
    ApiStandardResponses(),
    ApiBearerAuth('JWT-auth'),
  ];

  if (options.tag) {
    decorators.push(ApiTags(options.tag));
  }

  return applyDecorators(...decorators);
}

/**
 * API Paginated Query Documentation
 * Adds standard pagination query parameters
 */
export function ApiPaginatedQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (1-based)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (max 100)',
      example: 20,
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
    }),
  );
}

/**
 * API Filter Query Documentation
 * Adds standard filter query parameters
 */
export function ApiFilterQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search query',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      description: 'Filter start date (ISO 8601)',
      example: '2025-01-01T00:00:00Z',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      description: 'Filter end date (ISO 8601)',
      example: '2025-12-31T23:59:59Z',
    }),
  );
}

/**
 * Combined CRUD Documentation
 * Applies all standard CRUD decorators at the controller level
 */
export function ApiCrudController(tag: string, description?: string) {
  return applyDecorators(
    ApiTags(tag),
    ApiBearerAuth('JWT-auth'),
    description ? ApiOperation({ description }) : () => {},
  );
}

/**
 * API Success Response Documentation
 * Documents a successful response with custom type
 */
export function ApiSuccessResponse<T>(options: {
  status: number;
  description: string;
  type: Type<T>;
}) {
  return ApiResponse({
    status: options.status,
    description: options.description,
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(options.type) },
          },
        },
      ],
    },
  });
}
