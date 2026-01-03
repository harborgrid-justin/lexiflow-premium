// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Handle uncaught exceptions from React hydration errors
Cypress.on('uncaught:exception', (err) => {
  // Ignore React hydration errors that occur during SSR
  if (err.message.includes('Hydration failed')) {
    return false;
  }
  // Ignore other React-related errors that shouldn't fail tests
  if (err.message.includes('Minified React error')) {
    return false;
  }
  // Let other errors fail the test
  return true;
})