/**
 * @jest-environment jsdom
 */

import { NAVIGATION_ITEMS } from "../../src/config/nav.config";
import { PATHS } from "../../src/config/paths.config";

describe("nav.config", () => {
  describe("NAVIGATION_ITEMS structure", () => {
    it("should be an array", () => {
      expect(Array.isArray(NAVIGATION_ITEMS)).toBe(true);
    });

    it("should have multiple navigation items", () => {
      expect(NAVIGATION_ITEMS.length).toBeGreaterThan(10);
    });

    it("should have all required properties", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("icon");
        expect(item).toHaveProperty("category");
      });
    });
  });

  describe("Navigation categories", () => {
    it("should have Main category items", () => {
      const mainItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Main"
      );
      expect(mainItems.length).toBeGreaterThan(0);
    });

    it("should have Case Work category items", () => {
      const caseWorkItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Case Work"
      );
      expect(caseWorkItems.length).toBeGreaterThan(0);
    });

    it("should have Litigation Tools category items", () => {
      const litigationItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Litigation Tools"
      );
      expect(litigationItems.length).toBeGreaterThan(0);
    });

    it("should have Operations category items", () => {
      const operationsItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Operations"
      );
      expect(operationsItems.length).toBeGreaterThan(0);
    });

    it("should have Knowledge category items", () => {
      const knowledgeItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Knowledge"
      );
      expect(knowledgeItems.length).toBeGreaterThan(0);
    });

    it("should only use defined categories", () => {
      const validCategories = [
        "Main",
        "Case Work",
        "Litigation Tools",
        "Operations",
        "Knowledge",
        "Admin",
      ];
      NAVIGATION_ITEMS.forEach((item) => {
        expect(validCategories).toContain(item.category);
      });
    });
  });

  describe("Main category items", () => {
    it("should include Dashboard", () => {
      const dashboard = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.DASHBOARD
      );
      expect(dashboard).toBeDefined();
      expect(dashboard?.label).toBe("Dashboard");
      expect(dashboard?.category).toBe("Main");
    });

    it("should include Master Calendar", () => {
      const calendar = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.CALENDAR
      );
      expect(calendar).toBeDefined();
      expect(calendar?.label).toBe("Master Calendar");
    });

    it("should include Secure Messenger", () => {
      const messages = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.MESSAGES
      );
      expect(messages).toBeDefined();
      expect(messages?.label).toBe("Secure Messenger");
    });
  });

  describe("Path consistency", () => {
    it("should use paths from PATHS config", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        const pathValues = Object.values(PATHS);
        expect(pathValues).toContain(item.id);
      });
    });

    it("should have valid path IDs", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(typeof item.id).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Icons", () => {
    it("should have icon components", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe("function");
      });
    });

    it("should be valid Lucide icons", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(item.icon).toHaveProperty("displayName");
      });
    });
  });

  describe("Labels", () => {
    it("should have non-empty labels", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(typeof item.label).toBe("string");
        expect(item.label.length).toBeGreaterThan(0);
      });
    });

    it("should have capitalized labels", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        const firstChar = item.label.charAt(0);
        expect(firstChar).toBe(firstChar.toUpperCase());
      });
    });

    it("should not have trailing or leading spaces", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(item.label).toBe(item.label.trim());
      });
    });
  });

  describe("Permission flags", () => {
    it("should have boolean permission flags when present", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        if (item.requiresAdmin !== undefined) {
          expect(typeof item.requiresAdmin).toBe("boolean");
        }
        if (item.requiresAttorney !== undefined) {
          expect(typeof item.requiresAttorney).toBe("boolean");
        }
        if (item.requiresStaff !== undefined) {
          expect(typeof item.requiresStaff).toBe("boolean");
        }
      });
    });

    it("should mark admin section with requiresAdmin", () => {
      const adminItems = NAVIGATION_ITEMS.filter(
        (item) => item.category === "Admin"
      );
      adminItems.forEach((item) => {
        expect(item.requiresAdmin).toBe(true);
      });
    });
  });

  describe("Child items", () => {
    it("should have valid child structure when present", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        if (item.children) {
          expect(Array.isArray(item.children)).toBe(true);
          item.children.forEach((child) => {
            expect(child).toHaveProperty("id");
            expect(child).toHaveProperty("label");
            expect(child).toHaveProperty("icon");
          });
        }
      });
    });

    it("should have children with valid IDs", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            expect(typeof child.id).toBe("string");
            expect(child.id.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  describe("Specific feature coverage", () => {
    it("should include Cases/Matters", () => {
      const cases = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.CASES || item.id === PATHS.MATTERS
      );
      expect(cases).toBeDefined();
    });

    it("should include Discovery", () => {
      const discovery = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.DISCOVERY
      );
      expect(discovery).toBeDefined();
    });

    it("should include Documents", () => {
      const documents = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.DOCUMENTS
      );
      expect(documents).toBeDefined();
    });

    it("should include Billing", () => {
      const billing = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.BILLING
      );
      expect(billing).toBeDefined();
    });

    it("should include Analytics", () => {
      const analytics = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.ANALYTICS
      );
      expect(analytics).toBeDefined();
    });

    it("should include Research", () => {
      const research = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.RESEARCH
      );
      expect(research).toBeDefined();
    });

    it("should include Compliance", () => {
      const compliance = NAVIGATION_ITEMS.find(
        (item) => item.id === PATHS.COMPLIANCE
      );
      expect(compliance).toBeDefined();
    });
  });

  describe("ID uniqueness", () => {
    it("should have unique navigation IDs", () => {
      const ids = NAVIGATION_ITEMS.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique child IDs within each parent", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        if (item.children) {
          const childIds = item.children.map((child) => child.id);
          const uniqueChildIds = new Set(childIds);
          expect(uniqueChildIds.size).toBe(childIds.length);
        }
      });
    });
  });

  describe("Category distribution", () => {
    it("should have balanced category distribution", () => {
      const categoryCount: Record<string, number> = {};
      NAVIGATION_ITEMS.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      // Each category should have at least 1 item
      Object.values(categoryCount).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });

    it("should not have too many items in one category", () => {
      const categoryCount: Record<string, number> = {};
      NAVIGATION_ITEMS.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      // No category should dominate (> 50% of items)
      Object.values(categoryCount).forEach((count) => {
        expect(count).toBeLessThan(NAVIGATION_ITEMS.length / 2);
      });
    });
  });

  describe("Consistency with paths config", () => {
    it("should use consistent naming", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        const pathKey = Object.keys(PATHS).find(
          (key) => (PATHS as any)[key] === item.id
        );
        expect(pathKey).toBeDefined();
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle items without children", () => {
      const itemsWithoutChildren = NAVIGATION_ITEMS.filter(
        (item) => !item.children
      );
      expect(itemsWithoutChildren.length).toBeGreaterThan(0);
    });

    it("should handle items without permissions", () => {
      const itemsWithoutPerms = NAVIGATION_ITEMS.filter(
        (item) =>
          !item.requiresAdmin && !item.requiresAttorney && !item.requiresStaff
      );
      expect(itemsWithoutPerms.length).toBeGreaterThan(0);
    });
  });

  describe("Type conformity", () => {
    it("should match NavItemConfig interface", () => {
      NAVIGATION_ITEMS.forEach((item) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("icon");
        expect(item).toHaveProperty("category");

        // Optional properties
        if ("requiresAdmin" in item) {
          expect(typeof item.requiresAdmin).toBe("boolean");
        }
        if ("requiresAttorney" in item) {
          expect(typeof item.requiresAttorney).toBe("boolean");
        }
        if ("requiresStaff" in item) {
          expect(typeof item.requiresStaff).toBe("boolean");
        }
        if ("children" in item) {
          expect(Array.isArray(item.children)).toBe(true);
        }
      });
    });
  });
});
