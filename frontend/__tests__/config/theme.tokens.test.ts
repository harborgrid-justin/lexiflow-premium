/**
 * @jest-environment jsdom
 */

import { getTokens, tokens } from "../../src/shared/theme/tokens";

describe("theme/tokens", () => {
  describe("tokens object", () => {
    it("should export tokens object", () => {
      expect(tokens).toBeDefined();
      expect(typeof tokens).toBe("object");
    });

    it("should have colors", () => {
      expect(tokens.colors).toBeDefined();
      expect(typeof tokens.colors).toBe("object");
    });

    it("should have spacing", () => {
      expect(tokens.spacing).toBeDefined();
      expect(typeof tokens.spacing).toBe("object");
    });

    it("should have shadows", () => {
      expect(tokens.shadows).toBeDefined();
      expect(typeof tokens.shadows).toBe("object");
    });

    it("should have borderRadius", () => {
      expect(tokens.borderRadius).toBeDefined();
      expect(typeof tokens.borderRadius).toBe("object");
    });

    it("should have typography", () => {
      expect(tokens.typography).toBeDefined();
      expect(typeof tokens.typography).toBe("object");
    });
  });

  describe("color tokens", () => {
    it("should have primary colors", () => {
      expect(tokens.colors.primary).toBeDefined();
      expect(typeof tokens.colors.primary).toBe("string");
    });

    it("should have secondary colors", () => {
      expect(tokens.colors.secondary).toBeDefined();
      expect(typeof tokens.colors.secondary).toBe("string");
    });

    it("should have accent colors", () => {
      expect(tokens.colors.accent).toBeDefined();
      expect(typeof tokens.colors.accent).toBe("string");
    });

    it("should have background colors", () => {
      expect(tokens.colors.background).toBeDefined();
      expect(tokens.colors.surface).toBeDefined();
    });

    it("should have border colors", () => {
      expect(tokens.colors.border).toBeDefined();
      expect(tokens.colors.borderLight).toBeDefined();
    });

    it("should have text colors", () => {
      expect(tokens.colors.text).toBeDefined();
      expect(tokens.colors.textMuted).toBeDefined();
    });

    it("should have semantic colors", () => {
      expect(tokens.colors.success).toBeDefined();
      expect(tokens.colors.warning).toBeDefined();
      expect(tokens.colors.error).toBeDefined();
      expect(tokens.colors.info).toBeDefined();
    });

    it("should have valid hex color format", () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      Object.values(tokens.colors).forEach((color) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });

  describe("spacing tokens", () => {
    it("should have spacing for all densities", () => {
      expect(tokens.spacing.compact).toBeDefined();
      expect(tokens.spacing.normal).toBeDefined();
      expect(tokens.spacing.comfortable).toBeDefined();
    });

    it("should have spacing properties", () => {
      const spacingProps = [
        "unit",
        "gutter",
        "container",
        "inputPadding",
        "cardPadding",
        "rowHeight",
      ];

      ["compact", "normal", "comfortable"].forEach((density) => {
        const spacingSet =
          tokens.spacing[density as keyof typeof tokens.spacing];
        spacingProps.forEach((prop) => {
          expect(spacingSet).toHaveProperty(prop);
        });
      });
    });

    it("should have valid CSS unit format", () => {
      const unitPattern = /^\d+(?:\.\d+)?(?:px|rem|em)$/;

      Object.values(tokens.spacing).forEach((densitySpacing) => {
        Object.values(densitySpacing).forEach((value) => {
          expect(value).toMatch(unitPattern);
        });
      });
    });

    it("should have increasing values from compact to comfortable", () => {
      const compactUnit = parseFloat(tokens.spacing.compact.unit);
      const normalUnit = parseFloat(tokens.spacing.normal.unit);
      const comfortableUnit = parseFloat(tokens.spacing.comfortable.unit);

      expect(normalUnit).toBeGreaterThan(compactUnit);
      expect(comfortableUnit).toBeGreaterThan(normalUnit);
    });
  });

  describe("shadow tokens", () => {
    it("should have all shadow sizes", () => {
      expect(tokens.shadows.sm).toBeDefined();
      expect(tokens.shadows.md).toBeDefined();
      expect(tokens.shadows.lg).toBeDefined();
      expect(tokens.shadows.xl).toBeDefined();
      expect(tokens.shadows.inner).toBeDefined();
    });

    it("should have valid CSS shadow format", () => {
      Object.values(tokens.shadows).forEach((shadow) => {
        expect(typeof shadow).toBe("string");
        expect(shadow.length).toBeGreaterThan(0);
      });
    });

    it("should contain shadow keywords", () => {
      Object.values(tokens.shadows).forEach((shadow) => {
        // Should contain px units or 'none'
        expect(shadow === "none" || shadow.includes("px")).toBe(true);
      });
    });
  });

  describe("border radius tokens", () => {
    it("should have all radius sizes", () => {
      expect(tokens.borderRadius.sm).toBeDefined();
      expect(tokens.borderRadius.md).toBeDefined();
      expect(tokens.borderRadius.lg).toBeDefined();
      expect(tokens.borderRadius.xl).toBeDefined();
      expect(tokens.borderRadius.full).toBeDefined();
    });

    it("should have valid CSS radius format", () => {
      const radiusPattern = /^\d+(?:\.\d+)?(?:px|rem|%)$|^9999px$/;

      Object.values(tokens.borderRadius).forEach((radius) => {
        expect(radius).toMatch(radiusPattern);
      });
    });

    it("should have full radius as very large value", () => {
      expect(tokens.borderRadius.full).toMatch(/9999px|999rem|50%/);
    });
  });

  describe("typography tokens", () => {
    it("should have font family definitions", () => {
      expect(tokens.typography.fontSans).toBeDefined();
      expect(tokens.typography.fontSerif).toBeDefined();
      expect(tokens.typography.fontMono).toBeDefined();
    });

    it("should have font sizes", () => {
      expect(tokens.typography.fontSize).toBeDefined();
      expect(typeof tokens.typography.fontSize).toBe("object");
    });

    it("should have font weights", () => {
      expect(tokens.typography.fontWeight).toBeDefined();
      expect(typeof tokens.typography.fontWeight).toBe("object");
    });

    it("should have line heights", () => {
      expect(tokens.typography.lineHeight).toBeDefined();
      expect(typeof tokens.typography.lineHeight).toBe("object");
    });

    it("should have standard font size scales", () => {
      const expectedSizes = [
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
      ];
      const fontSize = tokens.typography.fontSize as any;

      expectedSizes.forEach((size) => {
        expect(fontSize[size]).toBeDefined();
      });
    });

    it("should have standard font weights", () => {
      const expectedWeights = ["normal", "medium", "semibold", "bold"];
      const fontWeight = tokens.typography.fontWeight as any;

      expectedWeights.forEach((weight) => {
        expect(fontWeight[weight]).toBeDefined();
      });
    });
  });

  describe("getTokens function", () => {
    it("should return tokens for light mode", () => {
      const lightTokens = getTokens("light", "normal", "sans");
      expect(lightTokens).toBeDefined();
      expect(lightTokens.colors).toBeDefined();
    });

    it("should return tokens for dark mode", () => {
      const darkTokens = getTokens("dark", "normal", "sans");
      expect(darkTokens).toBeDefined();
      expect(darkTokens.colors).toBeDefined();
    });

    it("should return different colors for light and dark", () => {
      const lightTokens = getTokens("light", "normal", "sans");
      const darkTokens = getTokens("dark", "normal", "sans");

      expect(lightTokens.colors.background).not.toBe(
        darkTokens.colors.background
      );
    });

    it("should handle all density modes", () => {
      expect(() => getTokens("light", "compact", "sans")).not.toThrow();
      expect(() => getTokens("light", "normal", "sans")).not.toThrow();
      expect(() => getTokens("light", "comfortable", "sans")).not.toThrow();
    });

    it("should handle all font modes", () => {
      expect(() => getTokens("light", "normal", "sans")).not.toThrow();
      expect(() => getTokens("light", "normal", "serif")).not.toThrow();
    });

    it("should return consistent structure across modes", () => {
      const lightTokens = getTokens("light", "normal", "sans");
      const darkTokens = getTokens("dark", "compact", "serif");

      expect(Object.keys(lightTokens)).toEqual(Object.keys(darkTokens));
    });
  });

  describe("theme consistency", () => {
    it("should have consistent property names", () => {
      const requiredProps = [
        "colors",
        "spacing",
        "shadows",
        "borderRadius",
        "typography",
      ];

      requiredProps.forEach((prop) => {
        expect(tokens).toHaveProperty(prop);
      });
    });

    it("should use consistent units", () => {
      // All spacing should use consistent units (px, rem, or em)
      Object.values(tokens.spacing).forEach((densitySpacing) => {
        const units = Object.values(densitySpacing).map((value) => {
          const match = value.match(/(px|rem|em)$/);
          return match ? match[0] : null;
        });

        // All units should be defined
        units.forEach((unit) => {
          expect(unit).not.toBeNull();
        });
      });
    });
  });

  describe("accessibility", () => {
    it("should have sufficient contrast colors", () => {
      // Check that we have both light and dark variants
      expect(tokens.colors.text).toBeDefined();
      expect(tokens.colors.textMuted).toBeDefined();
      expect(tokens.colors.background).toBeDefined();

      // They should be different values
      expect(tokens.colors.text).not.toBe(tokens.colors.background);
    });

    it("should have semantic color names", () => {
      const semanticColors = ["success", "warning", "error", "info"];

      semanticColors.forEach((color) => {
        expect(tokens.colors).toHaveProperty(color);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle undefined parameters gracefully", () => {
      expect(() => getTokens(undefined as any, "normal", "sans")).not.toThrow();
    });

    it("should have non-empty values", () => {
      Object.values(tokens.colors).forEach((color) => {
        expect(color.length).toBeGreaterThan(0);
      });
    });

    it("should not have null values", () => {
      const checkForNull = (obj: any): boolean => {
        return Object.values(obj).every((value) => {
          if (value === null) return false;
          if (typeof value === "object") return checkForNull(value);
          return true;
        });
      };

      expect(checkForNull(tokens)).toBe(true);
    });
  });

  describe("responsive design support", () => {
    it("should have multiple spacing scales", () => {
      expect(Object.keys(tokens.spacing).length).toBeGreaterThanOrEqual(3);
    });

    it("should have multiple font sizes", () => {
      const fontSize = tokens.typography.fontSize as any;
      expect(Object.keys(fontSize).length).toBeGreaterThanOrEqual(5);
    });

    it("should support different densities", () => {
      const densities = ["compact", "normal", "comfortable"];
      densities.forEach((density) => {
        expect(tokens.spacing).toHaveProperty(density);
      });
    });
  });
});
