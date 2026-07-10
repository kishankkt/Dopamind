import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

window.onerror = function(msg, url, line, col, error) {
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h2>Error</h2>
    <p>${msg}</p>
    <p>${url}:${line}:${col}</p>
    <pre>${error?.stack}</pre>
  </div>`;
};

window.addEventListener("unhandledrejection", function(event) {
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
    <h2>Unhandled Promise Rejection</h2>
    <p>${event.reason}</p>
    <pre>${event.reason?.stack}</pre>
  </div>`;
});

// Import Router AFTER setting up error handlers
import Router from './Router.jsx'
import { supabase } from '@/supabaseClient'

if (window.__TAURI_INTERNALS__) {
  import('@tauri-apps/plugin-deep-link').then(({ onOpenUrl }) => {
    onOpenUrl(async (urls) => {
      for (const url of urls) {
        if (url.includes('access_token=')) {
          const hash = url.split('#')[1];
          if (hash) {
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
          }
        }
      }
    }).catch(err => console.warn("Failed to register deep link listener:", err));
  }).catch(err => console.warn("Deep link plugin not available:", err));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
