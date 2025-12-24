import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

/**
 * Entry point for the React 18 application.
 * Ensures the DOM container exists before attempting to render.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Critical Error: Could not find root element 'root' to mount React application.";
  
  // Log to console for debugging
  console.error(errorMsg);
  
  // Render a fallback UI directly to the body if the React root is missing
  document.body.innerHTML = `
    <div style="color: #ef4444; padding: 40px; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
      <h1 style="font-size: 24px; font-weight: bold;">Fatal Initialization Error</h1>
      <p style="margin-top: 10px; color: #4b5563;">${errorMsg}</p>
    </div>
  `;
  
  throw new Error(errorMsg);
}

// Create the React 18 root
const root = ReactDOM.createRoot(rootElement);

// Initial render
root.render(
  <React.StrictMode>
    <ErrorBoundary scope="Root">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
