/**
 * ESLint Configuration for Frontend API Layer
 * Enforces enterprise architecture governance rules
 *
 * Add this to your root .eslintrc.js or .eslintrc.json:
 *
 * {
 *   "overrides": [
 *     {
 *       "files": ["src/lib/frontend-api/**\/*.ts"],
 *       "excludedFiles": ["**\/*.test.ts", "**\/*.spec.ts", "**\/governance.ts"],
 *       "rules": {
 *         "no-restricted-imports": ["error", {
 *           "patterns": [
 *             {
 *               "group": ["react", "react-dom", "react-router-dom", "react/*", "react-dom/*"],
 *               "message": "Frontend API modules must not import React. APIs are pure domain contracts and must remain UI-agnostic."
 *             },
 *             {
 *               "group": ["@/components/*", "components/*"],
 *               "message": "Frontend API modules must not import components. Keep API layer separate from UI layer."
 *             },
 *             {
 *               "group": ["@/contexts/*", "contexts/*"],
 *               "message": "Frontend API modules must not import contexts. No state access in API layer."
 *             },
 *             {
 *               "group": ["@/hooks/*", "hooks/*"],
 *               "message": "Frontend API modules must not import hooks. Hooks belong in UI layer, not API layer."
 *             },
 *             {
 *               "group": ["@/providers/*", "providers/*"],
 *               "message": "Frontend API modules must not import providers. APIs are provider-agnostic."
 *             },
 *             {
 *               "group": ["*.tsx"],
 *               "message": "Frontend API modules must not import .tsx files. API layer is pure TypeScript."
 *             }
 *           ]
 *         }],
 *         "no-console": ["warn", { "allow": ["error", "warn"] }],
 *         "@typescript-eslint/explicit-function-return-type": ["error", {
 *           "allowExpressions": false,
 *           "allowTypedFunctionExpressions": true
 *         }],
 *         "@typescript-eslint/no-explicit-any": "error",
 *         "@typescript-eslint/explicit-module-boundary-types": "error"
 *       }
 *     }
 *   ]
 * }
 */

module.exports = {
  overrides: [
    {
      // Frontend API layer - strict governance
      files: ["src/lib/frontend-api/**/*.ts"],
      excludedFiles: ["**/*.test.ts", "**/*.spec.ts", "**/governance.ts"],
      rules: {
        // Prevent UI imports
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "react",
                  "react-dom",
                  "react-router-dom",
                  "react/*",
                  "react-dom/*",
                ],
                message:
                  "Frontend API modules must not import React. APIs are pure domain contracts and must remain UI-agnostic.",
              },
              {
                group: ["@/components/*", "components/*"],
                message:
                  "Frontend API modules must not import components. Keep API layer separate from UI layer.",
              },
              {
                group: ["@/contexts/*", "contexts/*"],
                message:
                  "Frontend API modules must not import contexts. No state access in API layer.",
              },
              {
                group: ["@/hooks/*", "hooks/*"],
                message:
                  "Frontend API modules must not import hooks. Hooks belong in UI layer, not API layer.",
              },
              {
                group: ["@/providers/*", "providers/*"],
                message:
                  "Frontend API modules must not import providers. APIs are provider-agnostic.",
              },
              {
                group: ["*.tsx"],
                message:
                  "Frontend API modules must not import .tsx files. API layer is pure TypeScript.",
              },
            ],
          },
        ],

        // Limit console usage
        "no-console": ["warn", { allow: ["error", "warn"] }],

        // Require explicit return types
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          {
            allowExpressions: false,
            allowTypedFunctionExpressions: true,
          },
        ],

        // Prevent any types
        "@typescript-eslint/no-explicit-any": "error",

        // Require explicit module boundary types
        "@typescript-eslint/explicit-module-boundary-types": "error",

        // Prevent side effects
        "no-restricted-syntax": [
          "error",
          {
            selector:
              "ExpressionStatement[expression.callee.name='localStorage']",
            message:
              "Direct localStorage access forbidden. Use pure functions.",
          },
          {
            selector:
              "ExpressionStatement[expression.callee.name='sessionStorage']",
            message:
              "Direct sessionStorage access forbidden. Use pure functions.",
          },
        ],
      },
    },

    {
      // Normalization layer - similar restrictions
      files: ["src/lib/normalization/**/*.ts"],
      excludedFiles: ["**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["react", "react-dom", "react/*"],
                message:
                  "Normalizers must be pure functions with no React dependencies.",
              },
              {
                group: ["@/components/*", "@/contexts/*", "@/hooks/*"],
                message: "Normalizers must not depend on UI layer.",
              },
            ],
          },
        ],
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/no-explicit-any": "error",
      },
    },
  ],
};
