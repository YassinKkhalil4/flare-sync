
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ProductionReadiness } from './utils/productionReadiness'
import { initializeAppEnvironment } from './utils/appSetup'

// Initialize production readiness checks
if (typeof window !== 'undefined') {
  // Perform health check on startup
  ProductionReadiness.performHealthCheck().then(result => {
    console.log('Health check result:', result);
    if (result.status === 'error') {
      console.error('Critical health check failures:', result.messages);
    }
  });
  
  // Initialize app environment
  initializeAppEnvironment().then(result => {
    console.log('App environment initialization:', result);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
