import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary/ErrorBoundary';

/**
 * Enterprise Entry Point (Vite 7 + React 18)
 * Using 'createRoot' enables Concurrent React features.
 */
const mountRoot = (): void => {
  const container = document.getElementById('root');

  if (!container) {
    const errorMsg = "Fatal: Root element '#root' not found.";
    console.error(errorMsg);
    
    // Fallback UI if the DOM isn't ready or is corrupted
    document.body.innerHTML = `
      <div style="display:grid; place-items:center; height:100vh; font-family:sans-serif; background:#0a0a0a; color:#fff;">
        <div style="text-align:center; border-left: 4px solid #ef4444; padding-left: 20px;">
          <h1 style="font-size: 1.5rem; margin:0;">System Initialization Failure</h1>
          <p style="color:#a1a1aa; margin: 8px 0 0;">${errorMsg}</p>
        </div>
      </div>
    `;
    return;
  }

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <ErrorBoundary scope="AppRoot">
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

mountRoot();