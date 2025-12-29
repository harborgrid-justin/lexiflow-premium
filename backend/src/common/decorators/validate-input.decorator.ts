import { SetMetadata } from '@nestjs/common';

export const VALIDATE_INPUT_KEY = 'validateInput';

/**
 * Validate Input Schema
 */
export interface InputValidationSchema {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  sanitize?: boolean;
  required?: boolean;
}

/**
 * Input Validation Options
 */
export interface InputValidationOptions {
  fields?: Record<string, InputValidationSchema>;
  strictMode?: boolean;
  allowExtraFields?: boolean;
}

/**
 * Validate Input Decorator
 *
 * Marks a route for strict input validation beyond standard DTO validation.
 * Use this for extra-sensitive endpoints like authentication, payment, etc.
 *
 * @example
 * @ValidateInput({
 *   fields: {
 *     email: { pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, required: true },
 *     password: { minLength: 8, maxLength: 128, required: true }
 *   },
 *   strictMode: true
 * })
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {}
 */
export const ValidateInput = (options: InputValidationOptions = {}) =>
  SetMetadata(VALIDATE_INPUT_KEY, options);
