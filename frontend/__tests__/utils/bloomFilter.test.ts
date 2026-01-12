/**
 * @jest-environment jsdom
 */

import { BloomFilter } from "../../src/utils/bloomFilter";

describe("BloomFilter", () => {
  describe("constructor", () => {
    it("should create bloom filter with expected items and false positive rate", () => {
      const filter = new BloomFilter(1000, 0.01);
      expect(filter).toBeInstanceOf(BloomFilter);
    });

    it("should accept different configurations", () => {
      expect(() => new BloomFilter(100, 0.01)).not.toThrow();
      expect(() => new BloomFilter(10000, 0.001)).not.toThrow();
      expect(() => new BloomFilter(50, 0.1)).not.toThrow();
    });

    it("should handle small expected items", () => {
      const filter = new BloomFilter(10, 0.01);
      expect(filter).toBeDefined();
    });

    it("should handle large expected items", () => {
      const filter = new BloomFilter(100000, 0.01);
      expect(filter).toBeDefined();
    });
  });

  describe("add and test", () => {
    it("should add and test items", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("test-item");
      expect(filter.test("test-item")).toBe(true);
    });

    it("should return false for items not added", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("item1");
      expect(filter.test("item2")).toBe(false);
    });

    it("should handle multiple items", () => {
      const filter = new BloomFilter(100, 0.01);
      const items = ["item1", "item2", "item3", "item4", "item5"];

      items.forEach((item) => filter.add(item));

      items.forEach((item) => {
        expect(filter.test(item)).toBe(true);
      });
    });

    it("should not have false negatives", () => {
      const filter = new BloomFilter(1000, 0.01);
      const items = Array.from({ length: 500 }, (_, i) => `item-${i}`);

      items.forEach((item) => filter.add(item));

      // All added items should test positive
      items.forEach((item) => {
        expect(filter.test(item)).toBe(true);
      });
    });

    it("should handle empty strings", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("");
      expect(filter.test("")).toBe(true);
    });

    it("should handle special characters", () => {
      const filter = new BloomFilter(100, 0.01);
      const specialStrings = [
        "test!@#",
        "hello world",
        "test\n\t",
        "你好",
        "🔥",
      ];

      specialStrings.forEach((str) => filter.add(str));
      specialStrings.forEach((str) => {
        expect(filter.test(str)).toBe(true);
      });
    });

    it("should be case sensitive", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("Test");
      expect(filter.test("test")).toBe(false);
      expect(filter.test("TEST")).toBe(false);
      expect(filter.test("Test")).toBe(true);
    });

    it("should handle long strings", () => {
      const filter = new BloomFilter(100, 0.01);
      const longString = "x".repeat(1000);
      filter.add(longString);
      expect(filter.test(longString)).toBe(true);
    });
  });

  describe("mightContain", () => {
    it("should be an alias for test", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("test-item");

      expect(filter.mightContain("test-item")).toBe(filter.test("test-item"));
      expect(filter.mightContain("other-item")).toBe(filter.test("other-item"));
    });

    it("should work correctly", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("item1");

      expect(filter.mightContain("item1")).toBe(true);
      expect(filter.mightContain("item2")).toBe(false);
    });
  });

  describe("false positive rate", () => {
    it("should have low false positive rate", () => {
      const filter = new BloomFilter(1000, 0.01);
      const addedItems = Array.from({ length: 1000 }, (_, i) => `added-${i}`);
      const testItems = Array.from({ length: 1000 }, (_, i) => `test-${i}`);

      addedItems.forEach((item) => filter.add(item));

      const falsePositives = testItems.filter((item) =>
        filter.test(item)
      ).length;
      const falsePositiveRate = falsePositives / testItems.length;

      // Should be close to configured rate (0.01)
      expect(falsePositiveRate).toBeLessThan(0.05); // Allow some margin
    });

    it("should not exceed expected false positive rate significantly", () => {
      const filter = new BloomFilter(500, 0.01);

      // Add 500 items
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`);
      }

      // Test 1000 items that weren't added
      let falsePositives = 0;
      for (let i = 500; i < 1500; i++) {
        if (filter.test(`item-${i}`)) {
          falsePositives++;
        }
      }

      const rate = falsePositives / 1000;
      expect(rate).toBeLessThan(0.1); // Should be much less than 10%
    });
  });

  describe("duplicate adds", () => {
    it("should handle duplicate adds correctly", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("duplicate");
      filter.add("duplicate");
      filter.add("duplicate");

      expect(filter.test("duplicate")).toBe(true);
    });

    it("should not affect filter behavior with duplicates", () => {
      const filter = new BloomFilter(100, 0.01);

      for (let i = 0; i < 10; i++) {
        filter.add("same-item");
      }

      expect(filter.test("same-item")).toBe(true);
      expect(filter.test("other-item")).toBe(false);
    });
  });

  describe("capacity and scaling", () => {
    it("should handle adding more items than expected", () => {
      const filter = new BloomFilter(100, 0.01);

      // Add more items than expected
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`);
      }

      // All items should still be found
      for (let i = 0; i < 200; i++) {
        expect(filter.test(`item-${i}`)).toBe(true);
      }
    });

    it("should work with small capacity", () => {
      const filter = new BloomFilter(10, 0.1);

      for (let i = 0; i < 10; i++) {
        filter.add(`item-${i}`);
      }

      for (let i = 0; i < 10; i++) {
        expect(filter.test(`item-${i}`)).toBe(true);
      }
    });

    it("should work with large capacity", () => {
      const filter = new BloomFilter(10000, 0.01);

      for (let i = 0; i < 1000; i++) {
        filter.add(`item-${i}`);
      }

      for (let i = 0; i < 1000; i++) {
        expect(filter.test(`item-${i}`)).toBe(true);
      }
    });
  });

  describe("different data types as strings", () => {
    it("should handle IP addresses", () => {
      const filter = new BloomFilter(1000, 0.01);
      const ips = ["192.168.1.1", "10.0.0.1", "172.16.0.1", "8.8.8.8"];

      ips.forEach((ip) => filter.add(ip));
      ips.forEach((ip) => {
        expect(filter.test(ip)).toBe(true);
      });
    });

    it("should handle URLs", () => {
      const filter = new BloomFilter(1000, 0.01);
      const urls = [
        "https://example.com",
        "http://test.com/path",
        "https://domain.com:8080/resource",
      ];

      urls.forEach((url) => filter.add(url));
      urls.forEach((url) => {
        expect(filter.test(url)).toBe(true);
      });
    });

    it("should handle email addresses", () => {
      const filter = new BloomFilter(1000, 0.01);
      const emails = [
        "user@example.com",
        "test.user@domain.co.uk",
        "admin+tag@site.com",
      ];

      emails.forEach((email) => filter.add(email));
      emails.forEach((email) => {
        expect(filter.test(email)).toBe(true);
      });
    });
  });

  describe("hash collision resistance", () => {
    it("should distinguish similar strings", () => {
      const filter = new BloomFilter(100, 0.01);
      filter.add("test");

      expect(filter.test("test")).toBe(true);
      expect(filter.test("test1")).toBe(false);
      expect(filter.test("tast")).toBe(false);
      expect(filter.test("Test")).toBe(false);
    });

    it("should handle strings with small differences", () => {
      const filter = new BloomFilter(100, 0.01);
      const strings = ["test1", "test2", "test3", "test4"];

      filter.add("test1");

      expect(filter.test("test1")).toBe(true);
      expect(filter.test("test2")).toBe(false);
      expect(filter.test("test3")).toBe(false);
      expect(filter.test("test4")).toBe(false);
    });
  });

  describe("performance", () => {
    it("should add items quickly", () => {
      const filter = new BloomFilter(10000, 0.01);

      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        filter.add(`item-${i}`);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });

    it("should test items quickly", () => {
      const filter = new BloomFilter(10000, 0.01);

      for (let i = 0; i < 5000; i++) {
        filter.add(`item-${i}`);
      }

      const start = Date.now();
      for (let i = 0; i < 5000; i++) {
        filter.test(`item-${i}`);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe("use cases", () => {
    it("should work for blacklist checking", () => {
      const blacklist = new BloomFilter(1000, 0.01);
      const blockedIPs = ["192.168.1.100", "10.0.0.50", "172.16.0.200"];

      blockedIPs.forEach((ip) => blacklist.add(ip));

      expect(blacklist.test("192.168.1.100")).toBe(true);
      expect(blacklist.test("192.168.1.1")).toBe(false);
      expect(blacklist.test("10.0.0.1")).toBe(false);
    });

    it("should work for duplicate detection", () => {
      const seen = new BloomFilter(10000, 0.01);
      const items = ["doc1", "doc2", "doc3"];

      items.forEach((item) => seen.add(item));

      expect(seen.test("doc1")).toBe(true);
      expect(seen.test("doc4")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle unicode characters", () => {
      const filter = new BloomFilter(100, 0.01);
      const unicode = ["你好", "مرحبا", "Привет", "🚀🔥"];

      unicode.forEach((str) => filter.add(str));
      unicode.forEach((str) => {
        expect(filter.test(str)).toBe(true);
      });
    });

    it("should handle strings with null bytes", () => {
      const filter = new BloomFilter(100, 0.01);
      const str = "test\0value";
      filter.add(str);
      expect(filter.test(str)).toBe(true);
    });

    it("should handle very low false positive rate", () => {
      const filter = new BloomFilter(100, 0.001);
      expect(filter).toBeDefined();
    });

    it("should handle high false positive rate", () => {
      const filter = new BloomFilter(100, 0.5);
      expect(filter).toBeDefined();
    });
  });
});
