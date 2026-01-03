/**
 * Custom Jest transformer to replace import.meta.env with process.env
 * This allows Vite's import.meta.env to work in Jest tests
 */

const tsjest = require('ts-jest');

const tsJestTransformer = tsjest.default.createTransformer({
  tsconfig: {
    jsx: 'react-jsx',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: false,
    skipLibCheck: true,
  },
  diagnostics: {
    ignoreCodes: [1343]
  },
});

module.exports = {
  process(sourceText, sourcePath, options) {
    // Replace import.meta patterns with process.env
    const transformedSource = sourceText
      .replace(/typeof import\.meta !== ['"]undefined['"] && import\.meta\.hot/g, 'false')
      .replace(/import\.meta\.hot/g, 'undefined')
      .replace(/\(import\.meta as any\)\.env\.VITE_/g, 'process.env.VITE_')
      .replace(/\(import\.meta as any\)\.env/g, 'process.env')
      .replace(/import\.meta\.env\.VITE_/g, 'process.env.VITE_')
      .replace(/import\.meta\.env/g, 'process.env');

    // Use ts-jest to transform the modified source
    return tsJestTransformer.process(transformedSource, sourcePath, options);
  },

  getCacheKey(...args) {
    return tsJestTransformer.getCacheKey(...args);
  },
};
