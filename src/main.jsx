import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App.jsx';
import './index.css';
import { theme } from './theme/theme';

console.log('Starting application...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('Root element found:', document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
  
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Error rendering application:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Error Loading Application</h1>
      <p>There was an error loading the application. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error.message}</pre>
    </div>
  `;
}
