/**
 * Cypress E2E Testing Configuration
 *
 * Enterprise-grade end-to-end testing configuration for LexiFlow.
 * Provides comprehensive test coverage and reporting capabilities.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL for the application under test
    baseUrl: 'http://localhost:3000',

    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,

    // Test execution settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Video and screenshot settings
    video: true,
    screenshotOnRunFailure: true,
    videoCompression: 32,

    // Test file patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    // Browser settings
    chromeWebSecurity: false,

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Node event listeners and plugins
    setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ): Cypress.PluginConfigOptions | void {
      // Environment-specific configuration
      const environment = config.env.ENVIRONMENT || 'development';

      // Set environment-specific base URL
      if (environment === 'staging') {
        config.baseUrl = config.env.STAGING_URL || 'https://staging.lexiflow.com';
      } else if (environment === 'production') {
        config.baseUrl = config.env.PRODUCTION_URL || 'https://lexiflow.com';
      }

      // Register custom tasks
      on('task', {
        log(message: string): null {
          console.log(message);
          return null;
        },
      });

      // Return the modified config
      return config;
    },
  },

  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },

  // Environment variables
  env: {
    ENVIRONMENT: 'development',
    API_BASE_URL: 'http://localhost:3001/api',
  },

  // File server options
  fileServerFolder: '.',
  fixturesFolder: 'cypress/fixtures',
  downloadsFolder: 'cypress/downloads',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',

  // Reporter configuration
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.json',
  },
});
