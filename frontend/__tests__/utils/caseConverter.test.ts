/**
 * @jest-environment jsdom
 */

import {
  camelToSnake,
  keysToCamel,
  keysToSnake,
  snakeToCamel,
} from "../../src/utils/caseConverter";

describe("caseConverter", () => {
  describe("snakeToCamel", () => {
    it("should convert snake_case to camelCase", () => {
      expect(snakeToCamel("hello_world")).toBe("helloWorld");
      expect(snakeToCamel("user_first_name")).toBe("userFirstName");
    });

    it("should handle single word", () => {
      expect(snakeToCamel("hello")).toBe("hello");
    });

    it("should handle multiple underscores", () => {
      expect(snakeToCamel("one_two_three_four")).toBe("oneTwoThreeFour");
    });

    it("should handle leading underscore", () => {
      expect(snakeToCamel("_private_field")).toBe("_privateField");
    });

    it("should handle trailing underscore", () => {
      expect(snakeToCamel("field_name_")).toBe("fieldName_");
    });

    it("should handle consecutive underscores", () => {
      expect(snakeToCamel("hello__world")).toBe("hello_World");
    });

    it("should handle empty string", () => {
      expect(snakeToCamel("")).toBe("");
    });

    it("should preserve numbers", () => {
      expect(snakeToCamel("field_1_name")).toBe("field1Name");
    });

    it("should handle uppercase letters in snake_case", () => {
      expect(snakeToCamel("USER_NAME")).toBe("USERNAME");
    });
  });

  describe("camelToSnake", () => {
    it("should convert camelCase to snake_case", () => {
      expect(camelToSnake("helloWorld")).toBe("hello_world");
      expect(camelToSnake("userFirstName")).toBe("user_first_name");
    });

    it("should handle single word", () => {
      expect(camelToSnake("hello")).toBe("hello");
    });

    it("should handle multiple capitals", () => {
      expect(camelToSnake("oneTwoThreeFour")).toBe("one_two_three_four");
    });

    it("should handle leading capital", () => {
      expect(camelToSnake("HelloWorld")).toBe("_hello_world");
    });

    it("should handle consecutive capitals", () => {
      expect(camelToSnake("HTTPResponse")).toBe("_h_t_t_p_response");
    });

    it("should handle empty string", () => {
      expect(camelToSnake("")).toBe("");
    });

    it("should preserve numbers", () => {
      expect(camelToSnake("field1Name")).toBe("field1_name");
    });

    it("should handle all lowercase", () => {
      expect(camelToSnake("alllowercase")).toBe("alllowercase");
    });

    it("should handle single capital", () => {
      expect(camelToSnake("X")).toBe("_x");
    });
  });

  describe("keysToCamel", () => {
    it("should convert object keys to camelCase", () => {
      const input = {
        first_name: "John",
        last_name: "Doe",
        email_address: "john@example.com",
      };

      const output = keysToCamel(input);

      expect(output).toEqual({
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john@example.com",
      });
    });

    it("should handle nested objects", () => {
      const input = {
        user_data: {
          first_name: "John",
          contact_info: {
            phone_number: "123-456",
          },
        },
      };

      const output = keysToCamel(input);

      expect(output).toEqual({
        userData: {
          firstName: "John",
          contactInfo: {
            phoneNumber: "123-456",
          },
        },
      });
    });

    it("should handle arrays", () => {
      const input = [{ first_name: "John" }, { first_name: "Jane" }];

      const output = keysToCamel(input);

      expect(output).toEqual([{ firstName: "John" }, { firstName: "Jane" }]);
    });

    it("should handle arrays of primitives", () => {
      const input = [1, 2, 3, "test"];
      const output = keysToCamel(input);
      expect(output).toEqual([1, 2, 3, "test"]);
    });

    it("should handle null values", () => {
      expect(keysToCamel(null)).toBeNull();
    });

    it("should handle undefined values", () => {
      expect(keysToCamel(undefined)).toBeUndefined();
    });

    it("should handle primitive values", () => {
      expect(keysToCamel("string")).toBe("string");
      expect(keysToCamel(123)).toBe(123);
      expect(keysToCamel(true)).toBe(true);
    });

    it("should handle empty objects", () => {
      expect(keysToCamel({})).toEqual({});
    });

    it("should handle empty arrays", () => {
      expect(keysToCamel([])).toEqual([]);
    });

    it("should handle mixed nested structures", () => {
      const input = {
        user_list: [
          {
            user_name: "john",
            user_roles: ["admin", "user"],
          },
        ],
        meta_data: {
          total_count: 1,
        },
      };

      const output = keysToCamel(input);

      expect(output).toEqual({
        userList: [
          {
            userName: "john",
            userRoles: ["admin", "user"],
          },
        ],
        metaData: {
          totalCount: 1,
        },
      });
    });

    it("should preserve Date objects", () => {
      const date = new Date();
      const input = { created_at: date };
      const output = keysToCamel(input);
      expect(output).toHaveProperty("createdAt", date);
    });
  });

  describe("keysToSnake", () => {
    it("should convert object keys to snake_case", () => {
      const input = {
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john@example.com",
      };

      const output = keysToSnake(input);

      expect(output).toEqual({
        first_name: "John",
        last_name: "Doe",
        email_address: "john@example.com",
      });
    });

    it("should handle nested objects", () => {
      const input = {
        userData: {
          firstName: "John",
          contactInfo: {
            phoneNumber: "123-456",
          },
        },
      };

      const output = keysToSnake(input);

      expect(output).toEqual({
        user_data: {
          first_name: "John",
          contact_info: {
            phone_number: "123-456",
          },
        },
      });
    });

    it("should handle arrays", () => {
      const input = [{ firstName: "John" }, { firstName: "Jane" }];

      const output = keysToSnake(input);

      expect(output).toEqual([{ first_name: "John" }, { first_name: "Jane" }]);
    });

    it("should handle null values", () => {
      expect(keysToSnake(null)).toBeNull();
    });

    it("should handle undefined values", () => {
      expect(keysToSnake(undefined)).toBeUndefined();
    });

    it("should handle primitive values", () => {
      expect(keysToSnake("string")).toBe("string");
      expect(keysToSnake(123)).toBe(123);
      expect(keysToSnake(true)).toBe(true);
    });

    it("should handle empty objects", () => {
      expect(keysToSnake({})).toEqual({});
    });

    it("should handle empty arrays", () => {
      expect(keysToSnake([])).toEqual([]);
    });
  });

  describe("round-trip conversions", () => {
    it("should convert snake_case to camelCase and back", () => {
      const original = "hello_world_test";
      const camel = snakeToCamel(original);
      const snake = camelToSnake(camel);
      expect(snake).toBe(original);
    });

    it("should convert object keys both ways", () => {
      const original = {
        first_name: "John",
        last_name: "Doe",
        user_id: 123,
      };

      const camel = keysToCamel(original);
      const snake = keysToSnake(camel);

      expect(snake).toEqual(original);
    });

    it("should handle nested round-trip", () => {
      const original = {
        user_data: {
          first_name: "John",
          address_info: {
            street_name: "Main St",
          },
        },
      };

      const camel = keysToCamel(original);
      const snake = keysToSnake(camel);

      expect(snake).toEqual(original);
    });
  });

  describe("edge cases", () => {
    it("should handle keys with numbers", () => {
      const input = { field_1: "test", field_2_name: "value" };
      const output = keysToCamel(input);
      expect(output).toEqual({ field1: "test", field2Name: "value" });
    });

    it("should handle keys with special characters", () => {
      const input = { "user-name": "test" };
      const output = keysToCamel(input);
      expect(output).toHaveProperty("user-name", "test");
    });

    it("should handle very deep nesting", () => {
      const input = {
        level_1: {
          level_2: {
            level_3: {
              level_4: {
                deep_value: "test",
              },
            },
          },
        },
      };

      const output = keysToCamel(input);
      expect(output).toHaveProperty(
        "level1.level2.level3.level4.deepValue",
        "test"
      );
    });

    it("should handle circular references gracefully", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      // Should not throw, but may not fully convert circular structures
      expect(() => keysToCamel(circular)).not.toThrow();
    });

    it("should handle large objects", () => {
      const large: any = {};
      for (let i = 0; i < 1000; i++) {
        large[`field_${i}`] = i;
      }

      const output = keysToCamel(large);
      expect(Object.keys(output)).toHaveLength(1000);
    });

    it("should handle objects with prototype properties", () => {
      class TestClass {
        public instanceProp = "test";
      }

      const instance = new TestClass();
      const output = keysToCamel(instance);
      expect(output).toHaveProperty("instanceProp", "test");
    });
  });

  describe("type safety", () => {
    it("should preserve value types", () => {
      const input = {
        string_field: "text",
        number_field: 42,
        boolean_field: true,
        null_field: null,
        array_field: [1, 2, 3],
      };

      const output = keysToCamel<typeof input>(input);

      expect(typeof output.stringField).toBe("string");
      expect(typeof output.numberField).toBe("number");
      expect(typeof output.booleanField).toBe("boolean");
      expect(output.nullField).toBeNull();
      expect(Array.isArray(output.arrayField)).toBe(true);
    });
  });

  describe("real-world API scenarios", () => {
    it("should convert API response to frontend format", () => {
      const apiResponse = {
        user_id: 123,
        first_name: "John",
        last_name: "Doe",
        created_at: "2025-01-01",
        is_active: true,
        metadata: {
          last_login: "2025-01-12",
          login_count: 42,
        },
      };

      const converted = keysToCamel(apiResponse);

      expect(converted).toEqual({
        userId: 123,
        firstName: "John",
        lastName: "Doe",
        createdAt: "2025-01-01",
        isActive: true,
        metadata: {
          lastLogin: "2025-01-12",
          loginCount: 42,
        },
      });
    });

    it("should convert frontend data to API format", () => {
      const frontendData = {
        userId: 123,
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john@example.com",
      };

      const converted = keysToSnake(frontendData);

      expect(converted).toEqual({
        user_id: 123,
        first_name: "John",
        last_name: "Doe",
        email_address: "john@example.com",
      });
    });
  });
});
