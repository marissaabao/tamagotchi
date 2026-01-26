
/**
 * main.tsx (Entry Point)
 * ----------------------
 * Author: Marissa Abao
 *
 * Description:
 * This file serves as the entry point for the React application.
 * It initializes the React DOM root and renders the main <App />
 * component inside React's Strict Mode for improved debugging.
 *
 * Purpose:
 * - Attach the application to the #root element in index.html.
 * - Load global styles from index.css.
 * - Ensure the app runs with React's recommended development checks.
 *
 * Notes:
 * - StrictMode affects development only and has no impact on production.
 * - All future components will ultimately be rendered through App.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
