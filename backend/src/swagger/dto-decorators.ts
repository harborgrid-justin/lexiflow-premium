import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptions,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsUrl,
  IsUUID,
  IsDate,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  ValidateNested,
  IsNotEmpty,
  IsDateString,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enhanced DTO Decorators for LexiFlow API
 *
 * These decorators combine validation and OpenAPI documentation
 * to provide comprehensive type safety and API documentation
 */

// ============ STRING DECORATORS ============

export interface StringFieldOptions extends Partial<ApiPropertyOptions> {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  example?: string;
  examples?: string[];
  required?: boolean;
}

/**
 * String field with validation and documentation
 */
export function StringField(options: StringFieldOptions = {}) {
  const decorators = [IsString()];

  if (options.minLength) {
    decorators.push(MinLength(options.minLength));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength));
  }

  if (options.pattern) {
    decorators.push(Matches(options.pattern));
  }

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    type: 'string',
    description: options.description,
    example: options.example,
    examples: options.examples,
    minLength: options.minLength,
    maxLength: options.maxLength,
    pattern: options.pattern?.source,
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Email field with validation and documentation
 */
export function EmailField(options: Partial<StringFieldOptions> = {}) {
  return applyDecorators(
    IsEmail(),
    IsNotEmpty(),
    ApiProperty({
      type: 'string',
      format: 'email',
      description: options.description || 'Email address',
      example: options.example || 'user@example.com',
      ...options,
    }),
  );
}

/**
 * URL field with validation and documentation
 */
export function UrlField(options: Partial<StringFieldOptions> = {}) {
  return applyDecorators(
    IsUrl(),
    IsNotEmpty(),
    ApiProperty({
      type: 'string',
      format: 'uri',
      description: options.description || 'URL',
      example: options.example || 'https://example.com',
      ...options,
    }),
  );
}

/**
 * UUID field with validation and documentation
 */
export function UuidField(options: Partial<StringFieldOptions> = {}) {
  return applyDecorators(
    IsUUID(),
    IsNotEmpty(),
    ApiProperty({
      type: 'string',
      format: 'uuid',
      description: options.description || 'UUID identifier',
      example: options.example || '123e4567-e89b-12d3-a456-426614174000',
      ...options,
    }),
  );
}

// ============ NUMBER DECORATORS ============

export interface NumberFieldOptions extends Partial<ApiPropertyOptions> {
  min?: number;
  max?: number;
  example?: number;
  required?: boolean;
}

/**
 * Number field with validation and documentation
 */
export function NumberField(options: NumberFieldOptions = {}) {
  const decorators = [IsNumber()];

  if (options.min !== undefined) {
    decorators.push(Min(options.min));
  }

  if (options.max !== undefined) {
    decorators.push(Max(options.max));
  }

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    type: 'number',
    description: options.description,
    example: options.example,
    minimum: options.min,
    maximum: options.max,
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

/**
 * Integer field with validation and documentation
 */
export function IntegerField(options: NumberFieldOptions = {}) {
  return applyDecorators(
    IsNumber({ maxDecimalPlaces: 0 }),
    options.min !== undefined ? Min(options.min) : () => {},
    options.max !== undefined ? Max(options.max) : () => {},
    options.required === false ? IsOptional() : IsNotEmpty(),
    options.required === false
      ? ApiPropertyOptional({
          type: 'integer',
          ...options,
        })
      : ApiProperty({
          type: 'integer',
          ...options,
        }),
  );
}

// ============ BOOLEAN DECORATORS ============

export interface BooleanFieldOptions extends Partial<ApiPropertyOptions> {
  example?: boolean;
  required?: boolean;
}

/**
 * Boolean field with validation and documentation
 */
export function BooleanField(options: BooleanFieldOptions = {}) {
  const decorators = [IsBoolean()];

  if (options.required === false) {
    decorators.push(IsOptional());
  }

  if (options.required === false) {
    decorators.push(
      ApiPropertyOptional({
        type: 'boolean',
        ...options,
      }),
    );
  } else {
    decorators.push(
      ApiProperty({
        type: 'boolean',
        ...options,
      }),
    );
  }

  return applyDecorators(...decorators);
}

// ============ DATE DECORATORS ============

export interface DateFieldOptions extends Partial<ApiPropertyOptions> {
  example?: string;
  required?: boolean;
}

/**
 * Date field with validation and documentation
 */
export function DateField(options: DateFieldOptions = {}) {
  const decorators = [IsISO8601()];

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    type: 'string',
    format: 'date-time',
    description: options.description || 'ISO 8601 date-time',
    example: options.example || new Date().toISOString(),
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

// ============ ENUM DECORATORS ============

export interface EnumFieldOptions extends Partial<ApiPropertyOptions> {
  enum: object;
  example?: any;
  required?: boolean;
}

/**
 * Enum field with validation and documentation
 */
export function EnumField(options: EnumFieldOptions) {
  const decorators = [IsEnum(options.enum)];

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    enum: options.enum,
    description: options.description,
    example: options.example,
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

// ============ ARRAY DECORATORS ============

export interface ArrayFieldOptions extends Partial<ApiPropertyOptions> {
  itemType?: any;
  minItems?: number;
  maxItems?: number;
  example?: any[];
  required?: boolean;
}

/**
 * Array field with validation and documentation
 */
export function ArrayField(options: ArrayFieldOptions = {}) {
  const decorators = [IsArray()];

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  if (options.itemType) {
    decorators.push(ValidateNested({ each: true }));
    decorators.push(Type(() => options.itemType));
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    type: 'array',
    items: options.itemType
      ? { type: options.itemType.name.toLowerCase() }
      : undefined,
    description: options.description,
    example: options.example,
    minItems: options.minItems,
    maxItems: options.maxItems,
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

// ============ OBJECT DECORATORS ============

export interface ObjectFieldOptions extends Partial<ApiPropertyOptions> {
  type?: any;
  example?: any;
  required?: boolean;
}

/**
 * Nested object field with validation and documentation
 */
export function ObjectField(options: ObjectFieldOptions = {}) {
  const decorators = [];

  if (options.type) {
    decorators.push(ValidateNested());
    decorators.push(Type(() => options.type));
  }

  if (options.required === false) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  const apiPropertyOptions: ApiPropertyOptions = {
    type: options.type || 'object',
    description: options.description,
    example: options.example,
    required: options.required !== false,
    ...options,
  };

  if (options.required === false) {
    decorators.push(ApiPropertyOptional(apiPropertyOptions));
  } else {
    decorators.push(ApiProperty(apiPropertyOptions));
  }

  return applyDecorators(...decorators);
}

// ============ SPECIALIZED DECORATORS ============

/**
 * Case number field (CASE-YYYY-NNN format)
 */
export function CaseNumberField(options: Partial<StringFieldOptions> = {}) {
  return StringField({
    description: 'Case number in CASE-YYYY-NNN format',
    example: 'CASE-2024-001',
    pattern: /^CASE-\d{4}-\d{3,}$/,
    ...options,
  });
}

/**
 * Phone number field
 */
export function PhoneField(options: Partial<StringFieldOptions> = {}) {
  return StringField({
    description: 'Phone number',
    example: '+1-555-123-4567',
    pattern: /^\+?[\d\s\-\(\)]+$/,
    ...options,
  });
}

/**
 * Money amount field
 */
export function MoneyField(options: NumberFieldOptions = {}) {
  return NumberField({
    description: 'Monetary amount',
    example: 1234.56,
    min: 0,
    ...options,
  });
}

/**
 * Percentage field
 */
export function PercentageField(options: NumberFieldOptions = {}) {
  return NumberField({
    description: 'Percentage (0-100)',
    example: 75.5,
    min: 0,
    max: 100,
    ...options,
  });
}

/**
 * Tax ID field
 */
export function TaxIdField(options: Partial<StringFieldOptions> = {}) {
  return StringField({
    description: 'Tax identification number',
    example: '12-3456789',
    ...options,
  });
}

/**
 * Bar number field (attorney bar number)
 */
export function BarNumberField(options: Partial<StringFieldOptions> = {}) {
  return StringField({
    description: 'Attorney bar number',
    example: 'CA-123456',
    ...options,
  });
}

/**
 * Court case number field
 */
export function CourtCaseNumberField(options: Partial<StringFieldOptions> = {}) {
  return StringField({
    description: 'Court case number',
    example: '2024-CV-12345',
    ...options,
  });
}

/**
 * JSON field
 */
export function JsonField(options: Partial<ApiPropertyOptions> = {}) {
  return applyDecorators(
    IsOptional(),
    ApiPropertyOptional({
      type: 'object',
      description: 'JSON object',
      example: { key: 'value' },
      ...options,
    }),
  );
}

/**
 * File upload field
 */
export function FileField(options: Partial<ApiPropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      format: 'binary',
      description: 'File upload',
      ...options,
    }),
  );
}

export default {
  StringField,
  EmailField,
  UrlField,
  UuidField,
  NumberField,
  IntegerField,
  BooleanField,
  DateField,
  EnumField,
  ArrayField,
  ObjectField,
  CaseNumberField,
  PhoneField,
  MoneyField,
  PercentageField,
  TaxIdField,
  BarNumberField,
  CourtCaseNumberField,
  JsonField,
  FileField,
};
