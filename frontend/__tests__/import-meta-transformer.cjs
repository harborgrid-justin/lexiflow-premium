/**
 * Custom Jest transformer to replace import.meta.env with process.env
 * This allows Vite's import.meta.env to work in Jest tests
 */

const path = require('path');

// Get the ts-jest transformer
const tsJestModule = require('ts-jest/dist/legacy/ts-jest-transformer');
const TsJestTransformer = tsJestModule.TsJestTransformer;

const tsJestTransformer = new TsJestTransformer({
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
    // Replace import.meta.env with process.env (handles various patterns)
    const transformedSource = sourceText
      .replace(/\(import\.meta as any\)\.env\.VITE_/g, 'process.env.VITE_')
      .replace(/\(import\.meta as any\)\.env/g, 'process.env')
      .replace(/import\.meta\.env\.VITE_/g, 'process.env.VITE_')
      .replace(/import\.meta\.env/g, 'process.env');

    // Use ts-jest to transform the modified source
    return tsJestTransformer.process(transformedSource, sourcePath, options);
  },
};
