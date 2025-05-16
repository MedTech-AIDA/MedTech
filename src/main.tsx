import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Import the mock server but don't initialize it
// import { initMockServer } from './mocks/mockServer'

// Initialize mock server in development
// We're commenting this out to use the real backend
// if (process.env.NODE_ENV === 'development') {
//   initMockServer();
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
