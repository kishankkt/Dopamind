import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './Router.jsx'
import { supabase } from '@/supabaseClient'

// Early Deep Link Interceptor for Tauri Desktop OAuth
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
              window.location.href = '/dashboard';
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
