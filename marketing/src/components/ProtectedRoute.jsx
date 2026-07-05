// FILE: ProtectedRoute.jsx
// PURPOSE: Middleware wrapper component for auth-protected routes
// BEHAVIOR:
//   - Checks if Supabase session exists
//   - If YES → render children (the protected page)
//   - If NO → redirect to "/" and trigger auth modal
// USED BY: Router.jsx wraps /dashboard, /gym, /settings routes with this
// READ: supabaseClient.js for the Supabase instance

export default function ProtectedRoute({ children }) {
  // TODO: Check supabase.auth.getSession(), redirect if null
  return children;
}
