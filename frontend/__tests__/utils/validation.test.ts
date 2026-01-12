/**
 * @jest-environment jsdom
 */

import { ValidationService } from "../../src/utils/validation";

describe("ValidationService", () => {
  describe("validateRequired", () => {
    it("should not throw for valid values", () => {
      expect(() => {
        ValidationService.validateRequired("value", "testField", "testMethod");
      }).not.toThrow();

      expect(() => {
        ValidationService.validateRequired(0, "testField", "testMethod");
      }).not.toThrow();

      expect(() => {
        ValidationService.validateRequired(false, "testField", "testMethod");
      }).not.toThrow();
    });

    it("should throw for null", () => {
      expect(() => {
        ValidationService.validateRequired(null, "testField", "testMethod");
      }).toThrow(/testField.*required/i);
    });

    it("should throw for undefined", () => {
      expect(() => {
        ValidationService.validateRequired(
          undefined,
          "testField",
          "testMethod"
        );
      }).toThrow(/testField.*required/i);
    });

    it("should include method name in error", () => {
      expect(() => {
        ValidationService.validateRequired(null, "testField", "testMethod");
      }).toThrow(/testMethod/);
    });

    it("should include field name in error", () => {
      expect(() => {
        ValidationService.validateRequired(null, "testField", "testMethod");
      }).toThrow(/testField/);
    });
  });

  describe("validateString", () => {
    it("should accept valid strings", () => {
      expect(() => {
        ValidationService.validateString("test", "field", "method");
      }).not.toThrow();
    });

    it("should reject non-strings", () => {
      expect(() => {
        ValidationService.validateString(123 as any, "field", "method");
      }).toThrow(/must be a string/i);
    });

    it("should reject empty strings when required", () => {
      expect(() => {
        ValidationService.validateString("", "field", "method", true);
      }).toThrow(/cannot be empty/i);
    });

    it("should accept empty strings when not required", () => {
      expect(() => {
        ValidationService.validateString("", "field", "method", false);
      }).not.toThrow();
    });
  });

  describe("validateNumber", () => {
    it("should accept valid numbers", () => {
      expect(() => {
        ValidationService.validateNumber(42, "field", "method");
      }).not.toThrow();

      expect(() => {
        ValidationService.validateNumber(0, "field", "method");
      }).not.toThrow();

      expect(() => {
        ValidationService.validateNumber(-10, "field", "method");
      }).not.toThrow();
    });

    it("should reject non-numbers", () => {
      expect(() => {
        ValidationService.validateNumber("42" as any, "field", "method");
      }).toThrow(/must be a number/i);
    });

    it("should reject NaN", () => {
      expect(() => {
        ValidationService.validateNumber(NaN, "field", "method");
      }).toThrow(/must be a valid number/i);
    });

    it("should reject Infinity", () => {
      expect(() => {
        ValidationService.validateNumber(Infinity, "field", "method");
      }).toThrow(/must be a valid number/i);
    });
  });

  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@company.co.uk",
        "user+tag@domain.com",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        expect(() => {
          ValidationService.validateEmail(email, "email", "method");
        }).not.toThrow();
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@domain",
      ];

      invalidEmails.forEach((email) => {
        expect(() => {
          ValidationService.validateEmail(email, "email", "method");
        }).toThrow(/valid email/i);
      });
    });

    it("should reject empty email", () => {
      expect(() => {
        ValidationService.validateEmail("", "email", "method");
      }).toThrow();
    });
  });

  describe("validateUrl", () => {
    it("should accept valid HTTP URLs", () => {
      const validUrls = [
        "http://example.com",
        "https://example.com",
        "https://www.example.com/path",
        "https://example.com:8080/path?query=value",
      ];

      validUrls.forEach((url) => {
        expect(() => {
          ValidationService.validateUrl(url, "url", "method");
        }).not.toThrow();
      });
    });

    it("should reject invalid URLs", () => {
      const invalidUrls = [
        "not-a-url",
        "ftp://example.com", // Wrong protocol
        "example.com", // Missing protocol
        "http://", // Incomplete
      ];

      invalidUrls.forEach((url) => {
        expect(() => {
          ValidationService.validateUrl(url, "url", "method");
        }).toThrow(/valid URL/i);
      });
    });
  });

  describe("validateArray", () => {
    it("should accept valid arrays", () => {
      expect(() => {
        ValidationService.validateArray([1, 2, 3], "arr", "method");
      }).not.toThrow();

      expect(() => {
        ValidationService.validateArray([], "arr", "method");
      }).not.toThrow();
    });

    it("should reject non-arrays", () => {
      expect(() => {
        ValidationService.validateArray("not array" as any, "arr", "method");
      }).toThrow(/must be an array/i);
    });

    it("should enforce minimum length", () => {
      expect(() => {
        ValidationService.validateArray([1], "arr", "method", 2);
      }).toThrow(/at least 2/i);
    });

    it("should accept arrays meeting minimum length", () => {
      expect(() => {
        ValidationService.validateArray([1, 2], "arr", "method", 2);
      }).not.toThrow();
    });
  });

  describe("validateDate", () => {
    it("should accept valid date strings", () => {
      const validDates = [
        "2025-12-19",
        "2025-01-01",
        "2024-02-29", // Leap year
      ];

      validDates.forEach((date) => {
        expect(() => {
          ValidationService.validateDate(date, "date", "method");
        }).not.toThrow();
      });
    });

    it("should reject invalid date strings", () => {
      const invalidDates = [
        "not-a-date",
        "2025-13-01", // Invalid month
        "2025-02-30", // Invalid day
        "12/19/2025", // Wrong format
      ];

      invalidDates.forEach((date) => {
        expect(() => {
          ValidationService.validateDate(date, "date", "method");
        }).toThrow(/valid date/i);
      });
    });
  });

  describe("validatePleadingDocument", () => {
    it("should accept valid pleading document", () => {
      const validDoc = {
        id: "plead-123",
        title: "Test Pleading",
        sections: [
          { id: "sec-1", type: "Caption", content: "Test" },
          { id: "sec-2", type: "Certificate", content: "Test" },
        ],
        createdAt: "2025-12-19",
        updatedAt: "2025-12-19",
      };

      const result = ValidationService.validatePleadingDocument(validDoc);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required sections", () => {
      const invalidDoc = {
        id: "plead-123",
        title: "Test Pleading",
        sections: [],
        createdAt: "2025-12-19",
        updatedAt: "2025-12-19",
      };

      const result = ValidationService.validatePleadingDocument(invalidDoc);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect unreplaced placeholders", () => {
      const docWithPlaceholders = {
        id: "plead-123",
        title: "Test [[PLACEHOLDER]]",
        sections: [
          { id: "sec-1", type: "Caption", content: "Test [[NAME]]" },
          { id: "sec-2", type: "Certificate", content: "Valid content" },
        ],
        createdAt: "2025-12-19",
        updatedAt: "2025-12-19",
      };

      const result =
        ValidationService.validatePleadingDocument(docWithPlaceholders);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.some((w) => w.message.includes("placeholder"))
      ).toBe(true);
    });

    it("should detect sections exceeding max length", () => {
      const longContent = "x".repeat(51000); // Over 50KB limit
      const docWithLongSection = {
        id: "plead-123",
        title: "Test",
        sections: [
          { id: "sec-1", type: "Caption", content: longContent },
          { id: "sec-2", type: "Certificate", content: "Valid" },
        ],
        createdAt: "2025-12-19",
        updatedAt: "2025-12-19",
      };

      const result =
        ValidationService.validatePleadingDocument(docWithLongSection);
      expect(result.warnings.some((w) => w.message.includes("exceeds"))).toBe(
        true
      );
    });
  });

  describe("sanitizeInput", () => {
    it("should remove dangerous HTML tags", () => {
      const dangerous = '<script>alert("xss")</script>Hello';
      const sanitized = ValidationService.sanitizeInput(dangerous);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("Hello");
    });

    it("should remove event handlers", () => {
      const dangerous = '<div onclick="alert()">Click</div>';
      const sanitized = ValidationService.sanitizeInput(dangerous);
      expect(sanitized).not.toContain("onclick");
    });

    it("should preserve safe content", () => {
      const safe = "<p>This is <strong>safe</strong> content</p>";
      const sanitized = ValidationService.sanitizeInput(safe);
      expect(sanitized).toBeTruthy();
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle very long strings", () => {
      const longString = "x".repeat(100000);
      expect(() => {
        ValidationService.validateString(longString, "field", "method");
      }).not.toThrow();
    });

    it("should handle special characters in strings", () => {
      const specialChars = '!@#$%^&*(){}[]|\\:;"<>?,./';
      expect(() => {
        ValidationService.validateString(specialChars, "field", "method");
      }).not.toThrow();
    });

    it("should handle unicode characters", () => {
      const unicode = "你好世界 🌍 مرحبا";
      expect(() => {
        ValidationService.validateString(unicode, "field", "method");
      }).not.toThrow();
    });

    it("should handle extremely large numbers", () => {
      expect(() => {
        ValidationService.validateNumber(
          Number.MAX_SAFE_INTEGER,
          "field",
          "method"
        );
      }).not.toThrow();
    });

    it("should handle extremely small numbers", () => {
      expect(() => {
        ValidationService.validateNumber(
          Number.MIN_SAFE_INTEGER,
          "field",
          "method"
        );
      }).not.toThrow();
    });
  });
});
