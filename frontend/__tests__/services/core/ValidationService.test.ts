/**
 * @jest-environment jsdom
 * @module tests/services/validation/ValidationService
 * @description Tests for ValidationService - data validation and schema checking
 */

import { ValidationService } from "@/services/core/ValidationService";
import { ValidationError } from "@/services/core/errors";

describe("ValidationService", () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe("Required Fields", () => {
    it("should validate required fields", () => {
      const schema = {
        name: { required: true },
        email: { required: true },
      };

      const data = { name: "John", email: "john@example.com" };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should fail when required field is missing", () => {
      const schema = {
        name: { required: true },
        email: { required: true },
      };

      const data = { name: "John" };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("email");
      expect(result.errors.email).toContain("required");
    });

    it("should fail when required field is null", () => {
      const schema = { name: { required: true } };
      const data = { name: null };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(false);
    });

    it("should fail when required field is empty string", () => {
      const schema = { name: { required: true } };
      const data = { name: "" };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(false);
    });
  });

  describe("Type Validation", () => {
    it("should validate string type", () => {
      const schema = { name: { type: "string" } };
      const data = { name: "John" };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should validate number type", () => {
      const schema = { age: { type: "number" } };
      const data = { age: 25 };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should validate boolean type", () => {
      const schema = { active: { type: "boolean" } };
      const data = { active: true };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should validate array type", () => {
      const schema = { tags: { type: "array" } };
      const data = { tags: ["tag1", "tag2"] };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should validate object type", () => {
      const schema = { profile: { type: "object" } };
      const data = { profile: { name: "John" } };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should fail on type mismatch", () => {
      const schema = { age: { type: "number" } };
      const data = { age: "25" };

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.age).toContain("type");
    });
  });

  describe("String Validation", () => {
    it("should validate min length", () => {
      const schema = { name: { type: "string", minLength: 3 } };

      const valid = validationService.validate({ name: "John" }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ name: "Jo" }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should validate max length", () => {
      const schema = { name: { type: "string", maxLength: 10 } };

      const valid = validationService.validate({ name: "John" }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { name: "JohnJohnJohn" },
        schema
      );
      expect(invalid.isValid).toBe(false);
    });

    it("should validate pattern (regex)", () => {
      const schema = {
        email: {
          type: "string",
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      };

      const valid = validationService.validate(
        { email: "test@example.com" },
        schema
      );
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { email: "invalid-email" },
        schema
      );
      expect(invalid.isValid).toBe(false);
    });

    it("should validate enum values", () => {
      const schema = {
        status: {
          type: "string",
          enum: ["active", "inactive", "pending"],
        },
      };

      const valid = validationService.validate({ status: "active" }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ status: "invalid" }, schema);
      expect(invalid.isValid).toBe(false);
    });
  });

  describe("Number Validation", () => {
    it("should validate min value", () => {
      const schema = { age: { type: "number", min: 18 } };

      const valid = validationService.validate({ age: 25 }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ age: 16 }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should validate max value", () => {
      const schema = { score: { type: "number", max: 100 } };

      const valid = validationService.validate({ score: 95 }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ score: 105 }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should validate integer", () => {
      const schema = { count: { type: "number", integer: true } };

      const valid = validationService.validate({ count: 5 }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ count: 5.5 }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should validate positive numbers", () => {
      const schema = { amount: { type: "number", positive: true } };

      const valid = validationService.validate({ amount: 10 }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ amount: -5 }, schema);
      expect(invalid.isValid).toBe(false);
    });
  });

  describe("Array Validation", () => {
    it("should validate min items", () => {
      const schema = { tags: { type: "array", minItems: 2 } };

      const valid = validationService.validate(
        { tags: ["a", "b", "c"] },
        schema
      );
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ tags: ["a"] }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should validate max items", () => {
      const schema = { tags: { type: "array", maxItems: 3 } };

      const valid = validationService.validate({ tags: ["a", "b"] }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { tags: ["a", "b", "c", "d"] },
        schema
      );
      expect(invalid.isValid).toBe(false);
    });

    it("should validate unique items", () => {
      const schema = { tags: { type: "array", uniqueItems: true } };

      const valid = validationService.validate(
        { tags: ["a", "b", "c"] },
        schema
      );
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { tags: ["a", "b", "a"] },
        schema
      );
      expect(invalid.isValid).toBe(false);
    });

    it("should validate array item type", () => {
      const schema = {
        scores: {
          type: "array",
          items: { type: "number" },
        },
      };

      const valid = validationService.validate({ scores: [1, 2, 3] }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { scores: [1, "two", 3] },
        schema
      );
      expect(invalid.isValid).toBe(false);
    });
  });

  describe("Object Validation", () => {
    it("should validate nested objects", () => {
      const schema = {
        user: {
          type: "object",
          properties: {
            name: { type: "string", required: true },
            age: { type: "number", min: 0 },
          },
        },
      };

      const valid = validationService.validate(
        { user: { name: "John", age: 25 } },
        schema
      );
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate(
        { user: { age: 25 } }, // Missing name
        schema
      );
      expect(invalid.isValid).toBe(false);
    });

    it("should validate required properties in nested objects", () => {
      const schema = {
        profile: {
          type: "object",
          required: true,
          properties: {
            email: { required: true },
          },
        },
      };

      const invalid = validationService.validate({}, schema);
      expect(invalid.isValid).toBe(false);
    });
  });

  describe("Custom Validators", () => {
    it("should support custom validation functions", () => {
      const schema = {
        password: {
          type: "string",
          custom: (value: string) => {
            return (
              value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value)
            );
          },
        },
      };

      const valid = validationService.validate(
        { password: "Secure123" },
        schema
      );
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ password: "weak" }, schema);
      expect(invalid.isValid).toBe(false);
    });

    it("should provide custom error messages", () => {
      const schema = {
        age: {
          type: "number",
          min: 18,
          errorMessage: "Must be 18 or older",
        },
      };

      const result = validationService.validate({ age: 16 }, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe("Must be 18 or older");
    });
  });

  describe("Conditional Validation", () => {
    it("should support conditional validation", () => {
      const schema = {
        hasAddress: { type: "boolean" },
        address: {
          type: "string",
          requiredIf: (data: any) => data.hasAddress === true,
        },
      };

      const valid = validationService.validate({ hasAddress: false }, schema);
      expect(valid.isValid).toBe(true);

      const invalid = validationService.validate({ hasAddress: true }, schema);
      expect(invalid.isValid).toBe(false);
    });
  });

  describe("Error Messages", () => {
    it("should provide detailed error messages", () => {
      const schema = {
        name: { required: true },
        age: { type: "number", min: 0, max: 120 },
      };

      const result = validationService.validate({ age: 150 }, schema);

      expect(result.errors).toHaveProperty("name");
      expect(result.errors).toHaveProperty("age");
      expect(result.errors.name).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });

    it("should collect all errors", () => {
      const schema = {
        name: { required: true },
        email: { required: true, pattern: /^.+@.+\..+$/ },
        age: { type: "number", min: 0 },
      };

      const result = validationService.validate(
        { email: "invalid", age: -5 },
        schema
      );

      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });

  describe("Performance", () => {
    it("should validate large objects efficiently", () => {
      const schema: any = {};
      const data: any = {};

      for (let i = 0; i < 100; i++) {
        schema[`field${i}`] = { type: "string" };
        data[`field${i}`] = `value${i}`;
      }

      const start = performance.now();
      const result = validationService.validate(data, schema);
      const elapsed = performance.now() - start;

      expect(result.isValid).toBe(true);
      expect(elapsed).toBeLessThan(100); // Should complete quickly
    });

    it("should cache schema compilation", () => {
      const schema = { name: { required: true } };

      const result1 = validationService.validate({ name: "John" }, schema);
      const result2 = validationService.validate({ name: "Jane" }, schema);

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe("Sanitization", () => {
    it("should trim strings", () => {
      const schema = { name: { type: "string", trim: true } };
      const data = { name: "  John  " };

      const sanitized = validationService.sanitize(data, schema);

      expect(sanitized.name).toBe("John");
    });

    it("should convert types", () => {
      const schema = {
        age: { type: "number", convert: true },
        active: { type: "boolean", convert: true },
      };
      const data = { age: "25", active: "1" };

      const sanitized = validationService.sanitize(data, schema);

      expect(typeof sanitized.age).toBe("number");
      expect(sanitized.age).toBe(25);
      expect(typeof sanitized.active).toBe("boolean");
      expect(sanitized.active).toBe(true);
    });

    it("should remove unknown fields", () => {
      const schema = { name: { type: "string" } };
      const data = { name: "John", extra: "field" };

      const sanitized = validationService.sanitize(data, schema, {
        stripUnknown: true,
      });

      expect(sanitized).toEqual({ name: "John" });
      expect(sanitized).not.toHaveProperty("extra");
    });

    it("should set default values", () => {
      const schema = {
        name: { type: "string" },
        status: { type: "string", default: "pending" },
      };
      const data = { name: "John" };

      const sanitized = validationService.sanitize(data, schema);

      expect(sanitized.status).toBe("pending");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty objects", () => {
      const schema = {};
      const data = {};

      const result = validationService.validate(data, schema);

      expect(result.isValid).toBe(true);
    });

    it("should handle null values", () => {
      const schema = { value: { nullable: true } };

      const valid = validationService.validate({ value: null }, schema);
      expect(valid.isValid).toBe(true);
    });

    it("should handle undefined values", () => {
      const schema = { optional: { type: "string" } };

      const valid = validationService.validate({}, schema);
      expect(valid.isValid).toBe(true);
    });

    it("should throw on invalid schema", () => {
      expect(() => {
        validationService.validate({ name: "John" }, null as any);
      }).toThrow(ValidationError);
    });
  });
});
