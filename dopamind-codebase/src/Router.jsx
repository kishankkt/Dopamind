// FILE: Router.jsx
// PURPOSE: Main application router using React Router (react-router-dom)
// REPLACES: The current hash-based navigation in App.jsx
// 
// ROUTES TO IMPLEMENT:
//   /              → LandingPage (marketing, public)
//   /vision        → VisionPage (why we exist, public)
//   /play          → GamesLibraryPage (browse games by category, NO auth required)
//   /play/:gameId  → Play a specific game (NO auth required, scores not saved)
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
import ProtectedRoute from './app/core/auth/ProtectedRoute';

import LandingPage from '@/website/pages/LandingPage';
import VisionPage from '@/website/pages/VisionPage';
import GamesLibraryPage from '@/website/pages/GamesLibraryPage';
import DownloadsPage from '@/website/pages/DownloadsPage';
import BlogPage from '@/website/pages/BlogPage';
import ChangelogPage from '@/website/pages/ChangelogPage';
import ContactPage from '@/website/pages/ContactPage';
import DocsPage from '@/website/pages/DocsPage';
import PricingPage from '@/website/pages/PricingPage';

// The App component will act as the authenticated shell
import AppShell from './app/core/auth/AppShell';

const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={isDesktop ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route path="/vision" element={<VisionPage />} />
        <Route path="/play" element={<GamesLibraryPage />} />
        <Route path="/play/:gameId" element={<GamesLibraryPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Phase 2: Trial & Username Routing */}
        <Route path="/trial/:fingerprint" element={<AppShell />} />
        <Route path="/:username" element={<AppShell />} />

        {/* Protected Routes rendered within the App shell */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gym" 
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
