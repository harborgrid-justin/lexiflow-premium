/**
 * Custom Jest transformer to replace import.meta.env with process.env
 * This allows Vite's import.meta.env to work in Jest tests
 */

const tsjest = require("ts-jest");

const tsJestTransformer = tsjest.default.createTransformer({
  tsconfig: {
    jsx: "react-jsx",
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: false,
    skipLibCheck: true,
  },
  diagnostics: {
    ignoreCodes: [1343],
  },
});

module.exports = {
  process(sourceText, sourcePath, options) {
    // Replace import.meta patterns with process.env
    // First normalize whitespace in complex type assertions to make regex easier
    let transformedSource = sourceText;

    // Replace the complex multi-line pattern with a simpler one
    transformedSource = transformedSource.replace(
      /\(import\.meta\s+as\s+unknown\s+as\s+{\s*env:\s*Record<string,\s*\w+>\s*}\s*\)\.env\?\./g,
      "process.env."
    );

    // Now handle other patterns
    transformedSource = transformedSource
      .replace(
        /typeof import\.meta !== ['"]undefined['"] && import\.meta\.hot/g,
        "false"
      )
      .replace(/import\.meta\.hot/g, "undefined")
      .replace(/\(import\.meta as any\)\.env\.VITE_/g, "process.env.VITE_")
      .replace(/\(import\.meta as any\)\.env/g, "process.env")
      .replace(/import\.meta\.env\.VITE_/g, "process.env.VITE_")
      .replace(/import\.meta\.env/g, "process.env");

    // Use ts-jest to transform the modified source
    return tsJestTransformer.process(transformedSource, sourcePath, options);
  },

  getCacheKey(...args) {
    return tsJestTransformer.getCacheKey(...args);
  },
};
