// FILE: ProtectedRoute.jsx
// PURPOSE: Middleware wrapper component for auth-protected routes
// BEHAVIOR:
//   - Checks if Supabase session exists
//   - If YES → render children (the protected page)
//   - If NO → redirect to "/" and trigger auth modal
// USED BY: Router.jsx wraps /dashboard, /gym, /settings routes with this
// READ: supabaseClient.js for the Supabase instance

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>Loading...</div>;
  }

  if (!session) {
    // Redirect to landing page or desktop-login to open auth modal
    const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;
    return <Navigate to={isDesktop ? "/desktop-login?auth=true" : "/?auth=true"} replace />;
  }

  return children;
}
