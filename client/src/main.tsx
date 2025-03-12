import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Import directly with relative path to avoid path resolution issues
import ErrorBoundary from './components/ErrorBoundary';

// Ensure the root element exists before trying to render
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  const root = createRoot(rootElement);
  
  try {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render the application:', error);
    // Fallback rendering in case of critical error
    root.render(
      <div style={{ 
        padding: '20px', 
        margin: '20px', 
        fontFamily: 'Arial, sans-serif',
        color: '#721c24',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px'
      }}>
        <h2>Application Error</h2>
        <p>The application couldn't be loaded due to an error. Please check the console for details.</p>
      </div>
    );
  }
}