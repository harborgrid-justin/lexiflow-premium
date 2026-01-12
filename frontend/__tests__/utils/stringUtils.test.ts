/**
 * @jest-environment jsdom
 */

import { StringUtils } from "../../src/utils/stringUtils";

describe("StringUtils", () => {
  describe("levenshtein", () => {
    it("should return 0 for identical strings", () => {
      expect(StringUtils.levenshtein("hello", "hello")).toBe(0);
      expect(StringUtils.levenshtein("", "")).toBe(0);
    });

    it("should calculate distance for single character difference", () => {
      expect(StringUtils.levenshtein("hello", "hallo")).toBe(1);
      expect(StringUtils.levenshtein("cat", "bat")).toBe(1);
    });

    it("should calculate distance for insertions", () => {
      expect(StringUtils.levenshtein("cat", "cats")).toBe(1);
      expect(StringUtils.levenshtein("test", "testing")).toBe(3);
    });

    it("should calculate distance for deletions", () => {
      expect(StringUtils.levenshtein("cats", "cat")).toBe(1);
      expect(StringUtils.levenshtein("testing", "test")).toBe(3);
    });

    it("should calculate distance for substitutions", () => {
      expect(StringUtils.levenshtein("cat", "dog")).toBe(3);
      expect(StringUtils.levenshtein("hello", "world")).toBe(4);
    });

    it("should handle empty strings", () => {
      expect(StringUtils.levenshtein("", "hello")).toBe(5);
      expect(StringUtils.levenshtein("hello", "")).toBe(5);
    });

    it("should be symmetric", () => {
      expect(StringUtils.levenshtein("hello", "world")).toBe(
        StringUtils.levenshtein("world", "hello")
      );
    });

    it("should handle long strings", () => {
      const long1 = "a".repeat(100);
      const long2 = "b".repeat(100);
      const distance = StringUtils.levenshtein(long1, long2);
      expect(distance).toBe(100);
    });

    it("should handle unicode characters", () => {
      expect(StringUtils.levenshtein("café", "cafe")).toBeGreaterThan(0);
      expect(StringUtils.levenshtein("你好", "你好")).toBe(0);
    });

    it("should handle mixed case", () => {
      expect(StringUtils.levenshtein("Hello", "hello")).toBe(1);
      expect(StringUtils.levenshtein("HELLO", "hello")).toBe(5);
    });

    it("should calculate correct distance for typical examples", () => {
      expect(StringUtils.levenshtein("kitten", "sitting")).toBe(3);
      expect(StringUtils.levenshtein("saturday", "sunday")).toBe(3);
      expect(StringUtils.levenshtein("book", "back")).toBe(2);
    });
  });

  describe("fuzzyMatch", () => {
    it("should match exact substrings", () => {
      expect(StringUtils.fuzzyMatch("cat", "category")).toBe(true);
      expect(StringUtils.fuzzyMatch("test", "testing")).toBe(true);
    });

    it("should match case-insensitively", () => {
      expect(StringUtils.fuzzyMatch("cat", "CATEGORY")).toBe(true);
      expect(StringUtils.fuzzyMatch("TEST", "testing")).toBe(true);
    });

    it("should match within threshold", () => {
      expect(StringUtils.fuzzyMatch("cat", "cot", 3)).toBe(true);
      expect(StringUtils.fuzzyMatch("hello", "hallo", 3)).toBe(true);
    });

    it("should not match beyond threshold", () => {
      expect(StringUtils.fuzzyMatch("cat", "dog", 1)).toBe(false);
      expect(StringUtils.fuzzyMatch("hello", "world", 2)).toBe(false);
    });

    it("should match with default threshold of 3", () => {
      expect(StringUtils.fuzzyMatch("test", "tent")).toBe(true);
      expect(StringUtils.fuzzyMatch("test", "best")).toBe(true);
    });

    it("should handle partial matches", () => {
      expect(StringUtils.fuzzyMatch("java", "javascript")).toBe(true);
      expect(StringUtils.fuzzyMatch("script", "javascript")).toBe(true);
    });

    it("should handle empty strings", () => {
      expect(StringUtils.fuzzyMatch("", "hello")).toBe(false);
      expect(StringUtils.fuzzyMatch("hello", "")).toBe(false);
    });

    it("should match identical strings", () => {
      expect(StringUtils.fuzzyMatch("hello", "hello")).toBe(true);
    });

    it("should work with custom threshold", () => {
      expect(StringUtils.fuzzyMatch("cat", "dog", 5)).toBe(true);
      expect(StringUtils.fuzzyMatch("cat", "dog", 2)).toBe(false);
    });

    it("should handle special characters", () => {
      expect(StringUtils.fuzzyMatch("test!", "test")).toBe(true);
      expect(StringUtils.fuzzyMatch("hello-world", "helloworld")).toBe(true);
    });

    it("should handle numbers", () => {
      expect(StringUtils.fuzzyMatch("123", "1234")).toBe(true);
      expect(StringUtils.fuzzyMatch("v1.2", "v1.3")).toBe(true);
    });

    it("should handle whitespace differences", () => {
      expect(StringUtils.fuzzyMatch("hello world", "helloworld")).toBe(false);
      expect(StringUtils.fuzzyMatch("hello", "hello ")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle very long strings in fuzzyMatch", () => {
      const long = "a".repeat(1000);
      expect(StringUtils.fuzzyMatch("aaa", long)).toBe(true);
    });

    it("should handle special characters in levenshtein", () => {
      expect(StringUtils.levenshtein("!@#", "!@$")).toBe(1);
      expect(StringUtils.levenshtein("a b c", "a-b-c")).toBe(3);
    });

    it("should handle single character strings", () => {
      expect(StringUtils.levenshtein("a", "b")).toBe(1);
      expect(StringUtils.fuzzyMatch("a", "a")).toBe(true);
    });

    it("should handle strings with only spaces", () => {
      expect(StringUtils.levenshtein("   ", "    ")).toBe(1);
      expect(StringUtils.fuzzyMatch(" ", "  ")).toBe(true);
    });

    it("should handle emoji characters", () => {
      expect(StringUtils.levenshtein("😀", "😁")).toBeGreaterThan(0);
      expect(StringUtils.fuzzyMatch("test😀", "test😀")).toBe(true);
    });
  });

  describe("performance", () => {
    it("should handle reasonable string lengths efficiently", () => {
      const str1 = "a".repeat(100);
      const str2 = "b".repeat(100);

      const start = Date.now();
      StringUtils.levenshtein(str1, str2);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle multiple fuzzyMatch calls efficiently", () => {
      const queries = ["test", "example", "search", "query", "match"];
      const target = "testing example search query matching";

      const start = Date.now();
      queries.forEach((q) => StringUtils.fuzzyMatch(q, target));
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
