import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

/**
 * Validates that a date is not in the future
 */
@ValidatorConstraint({ name: "isNotFutureDate", async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date, _args: ValidationArguments): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    return date <= new Date();
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Date cannot be in the future";
  }
}

/**
 * Decorator for validating date is not in future
 */
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

/**
 * Validates that a date is not in the past
 */
@ValidatorConstraint({ name: "isNotPastDate", async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date, _args: ValidationArguments): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    return date >= new Date();
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Date cannot be in the past";
  }
}

/**
 * Decorator for validating date is not in past
 */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotPastDateConstraint,
    });
  };
}

/**
 * Validates that one date is after another date
 */
@ValidatorConstraint({ name: "isAfterDate", async: false })
export class IsAfterDateConstraint implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    const relatedPropertyName = args.constraints[0] as string;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
      return false;
    }

    return value > relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be after ${relatedPropertyName}`;
  }
}

/**
 * Decorator for validating one date is after another
 */
export function IsAfterDate(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterDateConstraint,
    });
  };
}

/**
 * Validates that one date is before another date
 */
@ValidatorConstraint({ name: "isBeforeDate", async: false })
export class IsBeforeDateConstraint implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];

    if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
      return false;
    }

    return value < relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be before ${relatedPropertyName}`;
  }
}

/**
 * Decorator for validating one date is before another
 */
export function IsBeforeDate(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeDateConstraint,
    });
  };
}

/**
 * Validates phone number format (international)
 */
@ValidatorConstraint({ name: "isPhoneNumber", async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phoneNumber: string, _args: ValidationArguments): boolean {
    if (typeof phoneNumber !== "string") {
      return false;
    }

    // E.164 format: +[country code][number]
    // Allows 7-15 digits after country code
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ""));
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Invalid phone number format. Use international format (e.g., +1234567890)";
  }
}

/**
 * Decorator for validating phone numbers
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberConstraint,
    });
  };
}

/**
 * Validates URL format with optional protocols
 */
@ValidatorConstraint({ name: "isUrl", async: false })
export class IsUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, _args: ValidationArguments): boolean {
    if (typeof url !== "string") {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return ["http:", "https:"].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Invalid URL format. Must be a valid HTTP or HTTPS URL";
  }
}

/**
 * Decorator for validating URLs
 */
export function IsValidUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUrlConstraint,
    });
  };
}

/**
 * Validates that a string contains only alphanumeric characters and specified special chars
 */
@ValidatorConstraint({ name: "isAlphanumericWithSpecial", async: false })
export class IsAlphanumericWithSpecialConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    if (typeof value !== "string") {
      return false;
    }

    const allowedSpecialChars = (args.constraints[0] as string) || "";
    const escapedSpecialChars = (allowedSpecialChars as string).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(`^[a-zA-Z0-9${escapedSpecialChars}]*$`);

    return regex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const [allowedSpecialChars = ""] = args.constraints;
    return allowedSpecialChars
      ? `${args.property} can only contain alphanumeric characters and: ${allowedSpecialChars}`
      : `${args.property} can only contain alphanumeric characters`;
  }
}

/**
 * Decorator for validating alphanumeric strings with optional special characters
 */
export function IsAlphanumericWithSpecial(
  allowedSpecialChars?: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [allowedSpecialChars],
      validator: IsAlphanumericWithSpecialConstraint,
    });
  };
}

/**
 * Validates file size (in bytes)
 */
@ValidatorConstraint({ name: "isFileSize", async: false })
export class IsFileSizeConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    if (typeof value !== "number" || value < 0) {
      return false;
    }

    const [maxSize] = args.constraints;
    return value <= maxSize;
  }

  defaultMessage(args: ValidationArguments): string {
    const [maxSize] = args.constraints;
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must not exceed ${maxSizeMB} MB`;
  }
}

/**
 * Decorator for validating file size
 */
export function IsFileSize(
  maxSize: number,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxSize],
      validator: IsFileSizeConstraint,
    });
  };
}

/**
 * Validates that an array has unique values
 */
@ValidatorConstraint({ name: "arrayUnique", async: false })
export class ArrayUniqueConstraint implements ValidatorConstraintInterface {
  validate(array: unknown[], args: ValidationArguments): boolean {
    if (!Array.isArray(array)) {
      return false;
    }

    const [property] = args.constraints;

    if (property) {
      // Check uniqueness by property
      const values = array.map((item) =>
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)[property]
          : item
      );
      return new Set(values).size === values.length;
    }

    // Check uniqueness of primitive values
    return new Set(array).size === array.length;
  }

  defaultMessage(args: ValidationArguments): string {
    const [property] = args.constraints;
    return property
      ? `${args.property} must contain unique values for property "${property}"`
      : `${args.property} must contain unique values`;
  }
}

/**
 * Decorator for validating array uniqueness
 */
export function ArrayUnique(
  property?: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: ArrayUniqueConstraint,
    });
  };
}

/**
 * Validates JSON string format
 */
@ValidatorConstraint({ name: "isJsonString", async: false })
export class IsJsonStringConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (typeof value !== "string") {
      return false;
    }

    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments): string {
    return "Value must be a valid JSON string";
  }
}

/**
 * Decorator for validating JSON strings
 */
export function IsJsonString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsJsonStringConstraint,
    });
  };
}

/**
 * Validates that a value matches one of the allowed values
 */
@ValidatorConstraint({ name: "isOneOf", async: false })
export class IsOneOfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [allowedValues] = args.constraints;

    if (!Array.isArray(allowedValues)) {
      return false;
    }

    return allowedValues.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const [allowedValues] = args.constraints;
    return `${args.property} must be one of: ${allowedValues.join(", ")}`;
  }
}

/**
 * Decorator for validating value is one of allowed values
 */
export function IsOneOf(
  allowedValues: unknown[],
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [allowedValues],
      validator: IsOneOfConstraint,
    });
  };
}
