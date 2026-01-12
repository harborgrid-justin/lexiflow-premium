/**
 * @jest-environment jsdom
 */

import { PATHS } from "../../src/config/paths.config";

describe("paths.config", () => {
  describe("PATHS constant", () => {
    it("should have DASHBOARD path", () => {
      expect(PATHS.DASHBOARD).toBe("dashboard");
    });

    it("should have CASES path", () => {
      expect(PATHS.CASES).toBe("cases");
    });

    it("should have CREATE_CASE path", () => {
      expect(PATHS.CREATE_CASE).toBe("cases/create");
    });

    it("should have DOCKET path", () => {
      expect(PATHS.DOCKET).toBe("docket");
    });

    it("should have DISCOVERY path", () => {
      expect(PATHS.DISCOVERY).toBe("discovery");
    });

    it("should have EVIDENCE path", () => {
      expect(PATHS.EVIDENCE).toBe("evidence");
    });

    it("should have DOCUMENTS path", () => {
      expect(PATHS.DOCUMENTS).toBe("documents");
    });

    it("should have ANALYTICS path", () => {
      expect(PATHS.ANALYTICS).toBe("analytics");
    });

    it("should have CALENDAR path", () => {
      expect(PATHS.CALENDAR).toBe("calendar");
    });

    it("should have BILLING path", () => {
      expect(PATHS.BILLING).toBe("billing");
    });
  });

  describe("Case Management paths", () => {
    it("should have CASES_OVERVIEW", () => {
      expect(PATHS.CASES_OVERVIEW).toBe("cases/overview");
    });

    it("should have CASES_CALENDAR", () => {
      expect(PATHS.CASES_CALENDAR).toBe("cases/calendar-view");
    });

    it("should have CASES_ANALYTICS", () => {
      expect(PATHS.CASES_ANALYTICS).toBe("cases/analytics");
    });

    it("should have CASES_INTAKE", () => {
      expect(PATHS.CASES_INTAKE).toBe("cases/intake");
    });

    it("should have CASES_OPERATIONS", () => {
      expect(PATHS.CASES_OPERATIONS).toBe("cases/operations");
    });

    it("should have CASES_INSIGHTS", () => {
      expect(PATHS.CASES_INSIGHTS).toBe("cases/insights");
    });

    it("should have CASES_FINANCIALS", () => {
      expect(PATHS.CASES_FINANCIALS).toBe("cases/financials");
    });
  });

  describe("Legacy compatibility", () => {
    it("should alias CASES and MATTERS", () => {
      expect(PATHS.CASES).toBe(PATHS.MATTERS);
      expect(PATHS.CASE_MANAGEMENT).toBe(PATHS.MATTERS);
    });

    it("should have legacy MATTERS_OVERVIEW", () => {
      expect(PATHS.MATTERS_OVERVIEW).toBe("cases/overview");
    });

    it("should have legacy MATTERS_CALENDAR", () => {
      expect(PATHS.MATTERS_CALENDAR).toBe("cases/calendar-view");
    });

    it("should have legacy MATTERS_ANALYTICS", () => {
      expect(PATHS.MATTERS_ANALYTICS).toBe("cases/analytics");
    });
  });

  describe("Real Estate Division paths", () => {
    it("should have REAL_ESTATE root path", () => {
      expect(PATHS.REAL_ESTATE).toBe("real_estate");
    });

    it("should have RE_PORTFOLIO_SUMMARY", () => {
      expect(PATHS.RE_PORTFOLIO_SUMMARY).toBe("real_estate/portfolio_summary");
    });

    it("should have RE_INVENTORY", () => {
      expect(PATHS.RE_INVENTORY).toBe("real_estate/inventory");
    });

    it("should have RE_UTILIZATION", () => {
      expect(PATHS.RE_UTILIZATION).toBe("real_estate/utilization");
    });

    it("should have RE_OUTGRANTS", () => {
      expect(PATHS.RE_OUTGRANTS).toBe("real_estate/outgrants");
    });

    it("should have RE_ACQUISITION", () => {
      expect(PATHS.RE_ACQUISITION).toBe("real_estate/acquisition");
    });

    it("should have RE_USER_MGMT", () => {
      expect(PATHS.RE_USER_MGMT).toBe("real_estate/user_management");
    });
  });

  describe("Document Management paths", () => {
    it("should have DRAFTING path", () => {
      expect(PATHS.DRAFTING).toBe("drafting");
    });

    it("should have LIBRARY path", () => {
      expect(PATHS.LIBRARY).toBe("library");
    });

    it("should have CLAUSES path", () => {
      expect(PATHS.CLAUSES).toBe("clauses");
    });

    it("should have PLEADING_BUILDER path", () => {
      expect(PATHS.PLEADING_BUILDER).toBe("pleading_builder");
    });

    it("should have LITIGATION_BUILDER path", () => {
      expect(PATHS.LITIGATION_BUILDER).toBe("litigation_builder");
    });
  });

  describe("Research and Compliance paths", () => {
    it("should have RESEARCH path", () => {
      expect(PATHS.RESEARCH).toBe("research");
    });

    it("should have CITATIONS path", () => {
      expect(PATHS.CITATIONS).toBe("citations");
    });

    it("should have COMPLIANCE path", () => {
      expect(PATHS.COMPLIANCE).toBe("compliance");
    });

    it("should have JURISDICTION path", () => {
      expect(PATHS.JURISDICTION).toBe("jurisdiction");
    });
  });

  describe("Communication paths", () => {
    it("should have MESSAGES path", () => {
      expect(PATHS.MESSAGES).toBe("messages");
    });

    it("should have CORRESPONDENCE path", () => {
      expect(PATHS.CORRESPONDENCE).toBe("correspondence");
    });
  });

  describe("Business Operations paths", () => {
    it("should have CRM path", () => {
      expect(PATHS.CRM).toBe("crm");
    });

    it("should have PRACTICE path", () => {
      expect(PATHS.PRACTICE).toBe("practice");
    });

    it("should have WORKFLOWS path", () => {
      expect(PATHS.WORKFLOWS).toBe("workflows");
    });
  });

  describe("Administrative paths", () => {
    it("should have ADMIN path", () => {
      expect(PATHS.ADMIN).toBe("admin");
    });

    it("should have PROFILE path", () => {
      expect(PATHS.PROFILE).toBe("profile");
    });
  });

  describe("Advanced features paths", () => {
    it("should have WAR_ROOM path", () => {
      expect(PATHS.WAR_ROOM).toBe("war_room");
    });

    it("should have RULES_ENGINE path", () => {
      expect(PATHS.RULES_ENGINE).toBe("rules_engine");
    });

    it("should have ENTITIES path", () => {
      expect(PATHS.ENTITIES).toBe("entities");
    });

    it("should have DATA_PLATFORM path", () => {
      expect(PATHS.DATA_PLATFORM).toBe("data_platform");
    });

    it("should have DAF path", () => {
      expect(PATHS.DAF).toBe("daf");
    });
  });

  describe("Path consistency", () => {
    it("should not have leading slashes", () => {
      Object.values(PATHS).forEach((path) => {
        expect(path).not.toMatch(/^\//);
      });
    });

    it("should not have trailing slashes", () => {
      Object.values(PATHS).forEach((path) => {
        expect(path).not.toMatch(/\/$/);
      });
    });

    it("should use underscores for multi-word paths", () => {
      expect(PATHS.WAR_ROOM).toContain("_");
      expect(PATHS.REAL_ESTATE).toContain("_");
    });

    it("should use forward slashes for nested paths", () => {
      expect(PATHS.CASES_OVERVIEW).toContain("/");
      expect(PATHS.RE_PORTFOLIO_SUMMARY).toContain("/");
    });

    it("should be lowercase", () => {
      Object.values(PATHS).forEach((path) => {
        expect(path).toBe(path.toLowerCase());
      });
    });
  });

  describe("Path structure", () => {
    it("should have hierarchical paths for case management", () => {
      expect(PATHS.CASES_OVERVIEW).toMatch(/^cases\//);
      expect(PATHS.CASES_ANALYTICS).toMatch(/^cases\//);
      expect(PATHS.CASES_CALENDAR).toMatch(/^cases\//);
    });

    it("should have hierarchical paths for real estate", () => {
      expect(PATHS.RE_PORTFOLIO_SUMMARY).toMatch(/^real_estate\//);
      expect(PATHS.RE_INVENTORY).toMatch(/^real_estate\//);
      expect(PATHS.RE_UTILIZATION).toMatch(/^real_estate\//);
    });

    it("should have single-level paths for main modules", () => {
      expect(PATHS.DASHBOARD).not.toContain("/");
      expect(PATHS.ANALYTICS).not.toContain("/");
      expect(PATHS.CALENDAR).not.toContain("/");
    });
  });

  describe("Path uniqueness", () => {
    it("should have unique path values", () => {
      const pathValues = Object.values(PATHS);
      const uniquePaths = new Set(pathValues);

      // Allow some duplicates for aliases (CASES/MATTERS)
      expect(uniquePaths.size).toBeGreaterThan(pathValues.length - 10);
    });

    it("should have unique keys", () => {
      const pathKeys = Object.keys(PATHS);
      const uniqueKeys = new Set(pathKeys);
      expect(uniqueKeys.size).toBe(pathKeys.length);
    });
  });

  describe("Type safety", () => {
    it("should be a const object", () => {
      // @ts-expect-error - Should not allow assignment
      expect(() => {
        (PATHS as any).NEW_PATH = "new";
      }).toThrow();
    });

    it("should export all paths as string literals", () => {
      Object.values(PATHS).forEach((path) => {
        expect(typeof path).toBe("string");
      });
    });
  });

  describe("Path count", () => {
    it("should have at least 50 paths defined", () => {
      const pathCount = Object.keys(PATHS).length;
      expect(pathCount).toBeGreaterThanOrEqual(50);
    });

    it("should have reasonable number of paths", () => {
      const pathCount = Object.keys(PATHS).length;
      expect(pathCount).toBeLessThan(200);
    });
  });
});
