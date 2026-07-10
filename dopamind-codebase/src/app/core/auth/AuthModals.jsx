import React, { useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function AuthModals({ 
  authOpen, 
  setAuthOpen, 
  showToast,
  isDesktop
}) {
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  // Check username availability
  React.useEffect(() => {
    if (authMode !== 'signup' || !authUsername) {
      setUsernameStatus(null);
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus('checking');
      if (!/^[a-zA-Z0-9_]+$/.test(authUsername)) {
        setUsernameStatus('invalid');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', authUsername)
        .single();

      if (error && error.code === 'PGRST116') {
        setUsernameStatus('available');
      } else if (data) {
        setUsernameStatus('taken');
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [authUsername, authMode]);

  if (!authOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setAuthOpen(false);
        if (!isDesktop) window.location.href = '/dashboard';
      } else {
        if (usernameStatus !== 'available') {
          throw new Error("Please choose a valid and available username.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authFullName,
              username: authUsername
            }
          }
        });
        if (error) throw error;
        
        if (data?.user && !data.session) {
          setAuthSuccessMessage("A verification link has been sent to " + authEmail + ". Please check your inbox and click the confirmation link to activate your account.");
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      if (isDesktop) {
        const { open } = await import('@tauri-apps/plugin-shell');
        // Open the Web-to-Desktop Bridge directly
        await open('https://dopamind-silk.vercel.app/desktop-auth');
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setAuthError(err.message || "Failed to start Google sign-in.");
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={() => setAuthOpen(false)}>
      <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={() => setAuthOpen(false)}>×</button>
        <h2>{authSuccessMessage ? "Account Created" : authMode === "login" ? "Welcome to DopaMind (v0.1.15)" : "Create Account (v0.1.15)"}</h2>
        <p className="auth-sub">{authSuccessMessage ? "Verification email dispatched" : "Keep your streak watered in the database"}</p>

        {authSuccessMessage ? (
          <div className="auth-success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <span className="success-icon" style={{ fontSize: '3rem' }}>📧</span>
            <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5', margin: '0' }}>{authSuccessMessage}</p>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '600' }} onClick={() => {
              setAuthSuccessMessage("");
              setAuthMode("login");
            }}>
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === "signup" && (
                <>
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                  />

                  <label>
                    Username
                    {usernameStatus === 'available' && <span style={{ color: 'var(--color-emerald-base)', fontSize: '0.8rem', marginLeft: '8px' }}>Available ✅</span>}
                    {usernameStatus === 'taken' && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>Taken ❌</span>}
                    {usernameStatus === 'checking' && <span style={{ color: 'gray', fontSize: '0.8rem', marginLeft: '8px' }}>Checking...</span>}
                    {usernameStatus === 'invalid' && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>Letters/numbers/_ only</span>}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="johndoe123"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value.toLowerCase())}
                    style={{ borderColor: usernameStatus === 'taken' ? 'red' : usernameStatus === 'available' ? 'var(--color-emerald-base)' : 'inherit' }}
                  />
                </>
              )}

              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="your@email.com" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />

              <label>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />

              {authError && <p className="auth-error-msg">⚠️ {authError}</p>}

              <button 
                type="submit" 
                className="btn-primary auth-submit-btn" 
                disabled={authLoading || (authMode === 'signup' && usernameStatus !== 'available')}
              >
                {authLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button className="google-auth-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 48 48" width="20px" height="20px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.196-5.239C29.21,35.154,26.685,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.239C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="auth-toggle">
              {authMode === "login" ? "New to DopaMind?" : "Already have an account?"}
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Create Account" : "Sign In"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
