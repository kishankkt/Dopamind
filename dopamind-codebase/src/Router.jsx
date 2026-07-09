// FILE: Router.jsx
// PURPOSE: Main application router using React Router (react-router-dom)
// REPLACES: The current hash-based navigation in App.jsx
// 
// ROUTES TO IMPLEMENT:
//   /              → LandingPage (marketing, public)
//   /vision        → VisionPage (why we exist, public)
//   /brain-gym          → GamesLibraryPage (browse games by category, NO auth required)
//   /brain-gym/:gameId  → Play a specific game (NO auth required, scores not saved)
//   /downloads     → DownloadsPage (all platform downloads, public)
//   /blog          → BlogPage (markdown-rendered posts, public)
//   /changelog     → ChangelogPage (version history, public)
//   /contact       → ContactPage (support form, public)
//   /docs          → DocsPage (developer docs, public)
//   /dashboard     → DashboardPage (user stats, AUTH REQUIRED)
//   /gym           → BrainGymPage (AI workouts, AUTH REQUIRED)
//   /settings      → SettingsPage (profile, AUTH REQUIRED)
//
// MIDDLEWARE: Create a <ProtectedRoute> wrapper that checks Supabase session.
//   If no session → redirect to / with auth modal open.
//
// DESKTOP RULE: If window.__TAURI_INTERNALS__ exists, redirect "/" to "/dashboard" or auth.
//
// READ: .agents/skills/dopamind/SKILL.md → "Routing Architecture" section for full route map.
// INSTALL: npm install react-router-dom

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import ProtectedRoute from './app/core/auth/ProtectedRoute';
import InteractiveLeaf from '@/app/games/library/InteractiveLeaf';

import LandingPage from '@/website/pages/LandingPage';
import VisionPage from '@/website/pages/VisionPage';
import CollaborationPage from '@/website/pages/CollaborationPage';
import ResearchPage from '@/website/pages/ResearchPage';
import GamesLibraryPage from '@/website/pages/GamesLibraryPage';
import DownloadsPage from '@/website/pages/DownloadsPage';
import BlogPage from '@/website/pages/BlogPage';
import ChangelogPage from '@/website/pages/ChangelogPage';
import ContactPage from '@/website/pages/ContactPage';
import DocsPage from '@/website/pages/DocsPage';
import PricingPage from '@/website/pages/PricingPage';
import DesktopAuthPage from '@/website/pages/DesktopAuthPage';

import AppShell from './app/core/auth/AppShell';

const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

function DashboardRedirect() {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
         supabase.from('profiles').select('username').eq('id', session.user.id).single()
         .then(({ data }) => {
           setUsername(data?.username || 'user');
           setLoading(false);
         });
      } else {
         if (isDesktop) {
           setRedirectPath('/desktop-login?auth=true');
         } else {
           setRedirectPath('/?auth=true');
         }
      }
    });
  }, []);
  
  if (redirectPath) return <Navigate to={redirectPath} replace />;
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;
  return <Navigate to={`/${username}/dashboard`} replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      {/* 🌿 Global AI Chatbot and Theme Toggle */}
      <InteractiveLeaf />

      <Routes>
        <Route 
          path="/" 
          element={isDesktop ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/collaboration" element={<CollaborationPage />} />
        <Route path="/brain-gym" element={<GamesLibraryPage />} />
        <Route path="/brain-gym/:gameId" element={<GamesLibraryPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Guest Routing */}
        <Route path="/guest/:fingerprint/dashboard" element={<AppShell defaultTab="dashboard" />} />
        <Route path="/guest/:fingerprint/braingym" element={<AppShell defaultTab="games" />} />
        <Route path="/guest/:fingerprint/coaches" element={<AppShell defaultTab="coaches" />} />
        <Route path="/guest/:fingerprint/sessions" element={<AppShell defaultTab="sessions" />} />

        {/* Redirects */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/desktop-login" element={<AppShell defaultTab="dashboard" />} />
        <Route path="/desktop-auth" element={<DesktopAuthPage />} />
        
        {/* Username Routing (placed at bottom to prevent colliding with static paths) */}
        <Route path="/:username/dashboard" element={<ProtectedRoute><AppShell defaultTab="dashboard" /></ProtectedRoute>} />
        <Route path="/:username/braingym" element={<ProtectedRoute><AppShell defaultTab="games" /></ProtectedRoute>} />
        <Route path="/:username/coaches" element={<ProtectedRoute><AppShell defaultTab="coaches" /></ProtectedRoute>} />
        <Route path="/:username/sessions" element={<ProtectedRoute><AppShell defaultTab="sessions" /></ProtectedRoute>} />
        <Route path="/:username/settings" element={<ProtectedRoute><AppShell defaultTab="settings" /></ProtectedRoute>} />
        
        {/* Fallback for bare username */}
        <Route path="/:username" element={<Navigate to="dashboard" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
