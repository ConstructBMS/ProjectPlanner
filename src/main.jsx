import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './supabase/client.js'

// Expose environment variables globally for SDK access
if (typeof window !== 'undefined') {
  window.__ENV__ = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE
  }
  
  // Expose the existing Supabase client for SDK reuse
  window.supabase = supabase
  window.__PROJECTPLANNER__ = {
    supabase
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
