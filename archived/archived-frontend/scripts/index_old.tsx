import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Critical Error: Could not find root element 'root' to mount React application.";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="color:red; padding: 20px; font-family: sans-serif;"><h1>Fatal Error</h1><p>${errorMsg}</p></div>`;
  throw new Error(errorMsg);
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary scope="Root">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
