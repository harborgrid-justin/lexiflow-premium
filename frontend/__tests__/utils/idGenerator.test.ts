/**
 * @jest-environment jsdom
 */

import {
  getIdTimestamp,
  IdGenerator,
  validateId,
} from "../../src/utils/idGenerator";

describe("IdGenerator", () => {
  describe("pleading", () => {
    it("should generate IDs with plead prefix", () => {
      const id = IdGenerator.pleading();
      expect(id).toMatch(/^plead-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.pleading();
      const id2 = IdGenerator.pleading();
      expect(id1).not.toBe(id2);
    });

    it("should generate IDs with correct format", () => {
      const id = IdGenerator.pleading();
      expect(id).toMatch(/^plead-[a-z0-9]+-[a-z0-9]+$/);
    });

    it("should generate multiple unique IDs", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(IdGenerator.pleading());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("section", () => {
    it("should generate IDs with sec prefix", () => {
      const id = IdGenerator.section();
      expect(id).toMatch(/^sec-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.section();
      const id2 = IdGenerator.section();
      expect(id1).not.toBe(id2);
    });
  });

  describe("template", () => {
    it("should generate IDs with tmpl prefix", () => {
      const id = IdGenerator.template();
      expect(id).toMatch(/^tmpl-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.template();
      const id2 = IdGenerator.template();
      expect(id1).not.toBe(id2);
    });
  });

  describe("formattingRule", () => {
    it("should generate IDs with rule prefix", () => {
      const id = IdGenerator.formattingRule();
      expect(id).toMatch(/^rule-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.formattingRule();
      const id2 = IdGenerator.formattingRule();
      expect(id1).not.toBe(id2);
    });
  });

  describe("case", () => {
    it("should generate IDs with case prefix", () => {
      const id = IdGenerator.case();
      expect(id).toMatch(/^case-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.case();
      const id2 = IdGenerator.case();
      expect(id1).not.toBe(id2);
    });
  });

  describe("user", () => {
    it("should generate IDs with user prefix", () => {
      const id = IdGenerator.user();
      expect(id).toMatch(/^user-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.user();
      const id2 = IdGenerator.user();
      expect(id1).not.toBe(id2);
    });
  });

  describe("evidence", () => {
    it("should generate IDs with evid prefix", () => {
      const id = IdGenerator.evidence();
      expect(id).toMatch(/^evid-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.evidence();
      const id2 = IdGenerator.evidence();
      expect(id1).not.toBe(id2);
    });
  });

  describe("document", () => {
    it("should generate IDs with doc prefix", () => {
      const id = IdGenerator.document();
      expect(id).toMatch(/^doc-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.document();
      const id2 = IdGenerator.document();
      expect(id1).not.toBe(id2);
    });
  });

  describe("docket", () => {
    it("should generate IDs with dk prefix", () => {
      const id = IdGenerator.docket();
      expect(id).toMatch(/^dk-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.docket();
      const id2 = IdGenerator.docket();
      expect(id1).not.toBe(id2);
    });
  });

  describe("party", () => {
    it("should generate IDs with party prefix", () => {
      const id = IdGenerator.party();
      expect(id).toMatch(/^party-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.party();
      const id2 = IdGenerator.party();
      expect(id1).not.toBe(id2);
    });
  });

  describe("staff", () => {
    it("should generate IDs with staff prefix", () => {
      const id = IdGenerator.staff();
      expect(id).toMatch(/^staff-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.staff();
      const id2 = IdGenerator.staff();
      expect(id1).not.toBe(id2);
    });
  });

  describe("stipulation", () => {
    it("should generate IDs with stip prefix", () => {
      const id = IdGenerator.stipulation();
      expect(id).toMatch(/^stip-/);
    });

    it("should generate unique IDs", () => {
      const id1 = IdGenerator.stipulation();
      const id2 = IdGenerator.stipulation();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generic", () => {
    it("should generate IDs with custom prefix", () => {
      const id = IdGenerator.generic("custom");
      expect(id).toMatch(/^custom-/);
    });

    it("should handle different custom prefixes", () => {
      const id1 = IdGenerator.generic("test");
      const id2 = IdGenerator.generic("demo");
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^demo-/);
    });

    it("should generate unique IDs with same prefix", () => {
      const id1 = IdGenerator.generic("custom");
      const id2 = IdGenerator.generic("custom");
      expect(id1).not.toBe(id2);
    });
  });

  describe("validateId", () => {
    it("should validate correctly formatted IDs", () => {
      const id = IdGenerator.case();
      expect(validateId(id, "case")).toBe(true);
    });

    it("should reject IDs with wrong prefix", () => {
      const id = IdGenerator.case();
      expect(validateId(id, "user")).toBe(false);
    });

    it("should reject malformed IDs", () => {
      expect(validateId("invalid-id", "case")).toBe(false);
      expect(validateId("case-", "case")).toBe(false);
      expect(validateId("case-abc", "case")).toBe(false);
    });

    it("should reject IDs missing components", () => {
      expect(validateId("case-123", "case")).toBe(false);
      expect(validateId("case-123-", "case")).toBe(false);
    });

    it("should validate all generator types", () => {
      const validators = [
        { id: IdGenerator.pleading(), prefix: "plead" },
        { id: IdGenerator.section(), prefix: "sec" },
        { id: IdGenerator.template(), prefix: "tmpl" },
        { id: IdGenerator.case(), prefix: "case" },
        { id: IdGenerator.user(), prefix: "user" },
      ];

      validators.forEach(({ id, prefix }) => {
        expect(validateId(id, prefix)).toBe(true);
      });
    });

    it("should handle empty strings", () => {
      expect(validateId("", "case")).toBe(false);
    });

    it("should handle uppercase in IDs", () => {
      expect(validateId("CASE-123-ABC", "CASE")).toBe(false);
    });
  });

  describe("getIdTimestamp", () => {
    it("should extract timestamp from generated ID", () => {
      const beforeTime = Date.now();
      const id = IdGenerator.case();
      const afterTime = Date.now();

      const timestamp = getIdTimestamp(id);
      expect(timestamp).not.toBeNull();
      expect(timestamp!).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp!).toBeLessThanOrEqual(afterTime);
    });

    it("should return null for invalid ID format", () => {
      expect(getIdTimestamp("invalid-id")).toBeNull();
      expect(getIdTimestamp("")).toBeNull();
    });

    it("should handle IDs from all generators", () => {
      const ids = [
        IdGenerator.pleading(),
        IdGenerator.case(),
        IdGenerator.user(),
        IdGenerator.document(),
      ];

      ids.forEach((id) => {
        const timestamp = getIdTimestamp(id);
        expect(timestamp).not.toBeNull();
        expect(timestamp).toBeGreaterThan(0);
      });
    });

    it("should extract consistent timestamps", () => {
      const id1 = IdGenerator.case();
      const timestamp1 = getIdTimestamp(id1);

      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 10) {
        /* wait */
      }

      const id2 = IdGenerator.case();
      const timestamp2 = getIdTimestamp(id2);

      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1!);
    });
  });

  describe("ID format consistency", () => {
    it("should generate IDs with three parts separated by hyphens", () => {
      const id = IdGenerator.case();
      const parts = id.split("-");
      expect(parts.length).toBeGreaterThanOrEqual(3);
    });

    it("should use lowercase alphanumeric characters", () => {
      const id = IdGenerator.case();
      expect(id).toMatch(/^[a-z]+-[a-z0-9]+-[a-z0-9]+$/);
    });

    it("should have reasonable length", () => {
      const id = IdGenerator.case();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(100);
    });
  });

  describe("collision resistance", () => {
    it("should generate highly unique IDs", () => {
      const ids = new Set();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        ids.add(IdGenerator.case());
      }

      expect(ids.size).toBe(count);
    });

    it("should generate different IDs across types", () => {
      const ids = [
        IdGenerator.case(),
        IdGenerator.user(),
        IdGenerator.document(),
        IdGenerator.evidence(),
        IdGenerator.pleading(),
      ];

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("performance", () => {
    it("should generate IDs quickly", () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        IdGenerator.case();
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // 1000 IDs in under 100ms
    });

    it("should validate IDs quickly", () => {
      const ids = Array.from({ length: 1000 }, () => IdGenerator.case());

      const start = Date.now();
      ids.forEach((id) => validateId(id, "case"));
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
