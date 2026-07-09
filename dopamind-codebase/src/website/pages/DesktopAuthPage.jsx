import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import PublicLayout from '@/shared/ui/PublicLayout';

export default function DesktopAuthPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href // Redirect back to this exact page
        }
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || "Failed to start Google sign-in.");
    }
  };

  const handleOpenApp = () => {
    if (session?.access_token && session?.refresh_token) {
      // Trigger the deep link to the desktop app
      const deepLink = `dopamind://auth#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
      window.location.href = deepLink;
    }
  };

  return (
    <PublicLayout>
      <div className="page-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div className="glass-panel animate-fade-in" style={{ padding: '40px 60px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          
          <div style={{ fontSize: '3rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
            🌿
          </div>
          
          <h1 style={{ marginBottom: '10px' }}>Desktop Sign In</h1>
          
          {loading ? (
            <p style={{ opacity: 0.7 }}>Verifying connection...</p>
          ) : session ? (
            <>
              <p style={{ opacity: 0.9, marginBottom: '30px', color: 'var(--color-emerald-base)', fontWeight: 'bold' }}>
                Authentication Successful!
              </p>
              <p style={{ opacity: 0.7, marginBottom: '30px' }}>
                You are securely logged into your account. Click the button below to bounce back to your Desktop App.
              </p>
              
              <button 
                onClick={handleOpenApp}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }}
              >
                Open DopaMind Desktop
              </button>

              <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '20px' }}>
                If you see a browser prompt asking to open "DopaMind", please click Allow.
              </p>
            </>
          ) : (
            <>
              <p style={{ opacity: 0.7, marginBottom: '30px' }}>
                Log in to sync your profile with the DopaMind Desktop App.
              </p>

              {authError && <p style={{ color: 'var(--color-rose-base)', marginBottom: '20px' }}>⚠️ {authError}</p>}

              <button className="google-auth-btn" onClick={handleGoogleLogin} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                <svg viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.196-5.239C29.21,35.154,26.685,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.239C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                <span style={{ marginLeft: '12px' }}>Continue with Google</span>
              </button>
            </>
          )}
          
        </div>
      </div>
    </PublicLayout>
  );
}
