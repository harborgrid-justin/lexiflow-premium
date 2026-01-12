/**
 * @jest-environment jsdom
 */

import {
  capitalize,
  formatCompactCurrency,
  formatCurrency,
  formatCurrencyPrecise,
  formatFileSize,
  formatNumber,
  formatPercent,
  pluralize,
  slugify,
  truncateText,
} from "../../src/utils/formatUtils";

describe("formatUtils", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers with dollar sign", () => {
      expect(formatCurrency(1234)).toBe("$1,234");
      expect(formatCurrency(1000000)).toBe("$1,000,000");
    });

    it("should format negative numbers", () => {
      expect(formatCurrency(-1234)).toBe("$-1,234");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("$0");
    });

    it("should exclude sign when includeSign is false", () => {
      expect(formatCurrency(1234, false)).toBe("1,234");
    });

    it("should handle decimal numbers by rounding", () => {
      expect(formatCurrency(1234.56)).toBe("$1,235");
      expect(formatCurrency(1234.49)).toBe("$1,234");
    });

    it("should handle very large numbers", () => {
      expect(formatCurrency(999999999)).toBe("$999,999,999");
    });

    it("should handle small decimals", () => {
      expect(formatCurrency(0.99)).toBe("$1");
      expect(formatCurrency(0.49)).toBe("$0");
    });
  });

  describe("formatCurrencyPrecise", () => {
    it("should format with 2 decimal places", () => {
      expect(formatCurrencyPrecise(1234.56)).toBe("$1,234.56");
      expect(formatCurrencyPrecise(1000000.99)).toBe("$1,000,000.99");
    });

    it("should add .00 for whole numbers", () => {
      expect(formatCurrencyPrecise(1234)).toBe("$1,234.00");
    });

    it("should handle negative values", () => {
      expect(formatCurrencyPrecise(-1234.56)).toBe("$-1,234.56");
    });

    it("should round to 2 decimals", () => {
      expect(formatCurrencyPrecise(1234.567)).toBe("$1,234.57");
      expect(formatCurrencyPrecise(1234.564)).toBe("$1,234.56");
    });

    it("should exclude sign when includeSign is false", () => {
      expect(formatCurrencyPrecise(1234.56, false)).toBe("1,234.56");
    });
  });

  describe("formatCompactCurrency", () => {
    it("should format billions with B suffix", () => {
      expect(formatCompactCurrency(1234567890)).toBe("$1.2B");
      expect(formatCompactCurrency(5000000000)).toBe("$5.0B");
    });

    it("should format millions with M suffix", () => {
      expect(formatCompactCurrency(1234567)).toBe("$1.2M");
      expect(formatCompactCurrency(999999)).toBe("$1.0M");
    });

    it("should format thousands with K suffix", () => {
      expect(formatCompactCurrency(1234)).toBe("$1.2K");
      expect(formatCompactCurrency(999)).toBe("$1000");
    });

    it("should format small numbers without suffix", () => {
      expect(formatCompactCurrency(999)).toBe("$999");
      expect(formatCompactCurrency(100)).toBe("$100");
    });

    it("should handle negative values", () => {
      expect(formatCompactCurrency(-1234567)).toBe("$-1.2M");
    });

    it("should exclude sign when includeSign is false", () => {
      expect(formatCompactCurrency(1234567, false)).toBe("1.2M");
    });

    it("should handle zero", () => {
      expect(formatCompactCurrency(0)).toBe("$0");
    });
  });

  describe("formatNumber", () => {
    it("should format with thousands separators", () => {
      expect(formatNumber(1234)).toBe("1,234");
      expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("should handle decimal places", () => {
      expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
      expect(formatNumber(1234.5678, 0)).toBe("1,235");
    });

    it("should default to 0 decimals", () => {
      expect(formatNumber(1234.99)).toBe("1,235");
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-1234.56, 2)).toBe("-1,234.56");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(0, 2)).toBe("0.00");
    });
  });

  describe("formatPercent", () => {
    it("should format percentage without decimals", () => {
      expect(formatPercent(25)).toBe("25%");
      expect(formatPercent(100)).toBe("100%");
    });

    it("should format percentage with decimals", () => {
      expect(formatPercent(25.5, 1)).toBe("25.5%");
      expect(formatPercent(33.333, 2)).toBe("33.33%");
    });

    it("should handle zero", () => {
      expect(formatPercent(0)).toBe("0%");
    });

    it("should handle negative percentages", () => {
      expect(formatPercent(-10.5, 1)).toBe("-10.5%");
    });

    it("should handle values over 100", () => {
      expect(formatPercent(150)).toBe("150%");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
    });

    it("should format KB", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(2048)).toBe("2 KB");
    });

    it("should format MB", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    });

    it("should format GB", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatFileSize(3.5 * 1024 * 1024 * 1024)).toBe("3.5 GB");
    });

    it("should format TB", () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should handle decimal values correctly", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });

    it("should round to 2 decimal places", () => {
      const result = formatFileSize(1234567);
      expect(result).toMatch(/^\d+\.\d{1,2} MB$/);
    });
  });

  describe("truncateText", () => {
    it("should not truncate text shorter than maxLength", () => {
      expect(truncateText("Hello", 10)).toBe("Hello");
    });

    it("should truncate text longer than maxLength", () => {
      expect(truncateText("Hello World!", 8)).toBe("Hello Wo...");
    });

    it("should handle exact length", () => {
      expect(truncateText("Hello", 5)).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(truncateText("", 10)).toBe("");
    });

    it("should add ellipsis when truncating", () => {
      const result = truncateText("This is a long text", 10);
      expect(result).toContain("...");
      expect(result.length).toBeLessThanOrEqual(13); // 10 + 3 for '...'
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should handle already capitalized", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("should preserve rest of string", () => {
      expect(capitalize("hello WORLD")).toBe("Hello WORLD");
    });
  });

  describe("pluralize", () => {
    it("should return singular for count 1", () => {
      expect(pluralize(1, "item")).toBe("item");
    });

    it("should return plural for count > 1", () => {
      expect(pluralize(2, "item")).toBe("items");
      expect(pluralize(10, "item")).toBe("items");
    });

    it("should return plural for count 0", () => {
      expect(pluralize(0, "item")).toBe("items");
    });

    it("should use custom plural form", () => {
      expect(pluralize(2, "child", "children")).toBe("children");
      expect(pluralize(1, "child", "children")).toBe("child");
    });

    it("should handle negative counts", () => {
      expect(pluralize(-5, "item")).toBe("items");
    });
  });

  describe("slugify", () => {
    it("should convert spaces to hyphens", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should lowercase text", () => {
      expect(slugify("HELLO WORLD")).toBe("hello-world");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello @World!")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("Hello    World")).toBe("hello-world");
    });

    it("should remove leading/trailing spaces", () => {
      expect(slugify("  Hello World  ")).toBe("hello-world");
    });

    it("should handle already slugified text", () => {
      expect(slugify("hello-world")).toBe("hello-world");
    });
  });

  describe("edge cases", () => {
    it("should handle NaN gracefully", () => {
      expect(formatNumber(NaN)).toBe("NaN");
      expect(formatCurrency(NaN)).toContain("NaN");
    });

    it("should handle Infinity", () => {
      expect(formatNumber(Infinity)).toBe("Infinity");
    });

    it("should handle very small numbers", () => {
      expect(formatNumber(0.0001, 4)).toBe("0.0001");
    });

    it("should handle very large numbers", () => {
      const billion = 1000000000000;
      const result = formatNumber(billion);
      expect(result).toContain(",");
    });
  });
});
