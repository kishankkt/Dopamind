---
name: DopaMind Platform Guidelines
description: Developer guidelines, SVG logo assets, database schema configurations, and Vercel monorepo patterns for DopaMind.
---

# 🌿 DopaMind - Core Developer Guidelines

This file is a developer skill configuration. It instructs future coding agents how to build, maintain, and scale the DopaMind platform without context drift.

---

## 🏛️ DopaMind 4-Level Platform Taxonomy

DopaMind is meticulously managed via a strict First Principles taxonomy. Any new feature must be classified into one of these 4 levels before development begins.

### Level 1: Public Marketing & Growth Engine
*   **Role:** The public face of the app (SEO, conversions, pricing).
*   **Status:** Built (Vite/React shell).

### Level 2: User Flow Engine
*   **Role:** Supabase Authentication, Onboarding, Profile creation.
*   **Status:** Built (Email/Password, Google OAuth).

### Level 3: App-Level Engines
*   **Role:** Global gamification, social logic, and AI layers overlaying the core experience.
*   **Status:**
    *   `Seeding Board (Streak Engine)`: Built.
    *   `Performance Engine`: Built (Recharts telemetry).
    *   `Global Leaderboard`: Built (Supabase joins).
    *   `Interactive Leaf (Companion Engine)`: Built.
    *   `Guidance & Schedule Builder (AI Engine)`: Built.

### Level 4: Brain Gym (The Games Engine)
*   **Role:** The isolated cognitive testing components.
*   **Games:** SpeedMatch, TimeEstimator, DirectionDash, SymbolMatch, NumberCascade, ReactionTap, PatternPulse, WordWarp, CountFlow, FocusGrid.

---

## 🎨 Design System & Colors
* **Theme:** Calm, premium, spacious, soft glassmorphism.
* **Palette:**
  - Deep Emerald: `hsl(145, 30%, 15%)`
  - Base Emerald: `hsl(145, 40%, 25%)`
  - Sage Green: `hsl(120, 18%, 85%)`
  - Oat: `hsl(36, 33%, 96%)`
  - Accent Gold: `hsl(43, 85%, 60%)`
  - Error Coral: `hsl(354, 70%, 65%)`
* **Fonts:** Outfit (Headers), Inter (Body text).

---

## 🏷️ Custom Brain-Leaf SVG Logo Spec
When rendering the logo, do not use emoji. Render this inline SVG so it dynamically matches dark/light themes via `currentColor`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <!-- Stylized leaf contour -->
  <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Central main vein -->
  <path d="M50 88 V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Left hemisphere curves (representing brain lobes & veins) -->
  <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Right hemisphere curves -->
  <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Top focus node seed (Gold) -->
  <circle cx="50" cy="12" r="3.5" fill="#EAB308" />
</svg>
```

---

## 🗄️ Database Schemas & Auth Triggers
Users' profiles must reside inside Supabase PostgreSQL `public.profiles`:
* **Attributes:** `id` (references auth.users), `streak_count`, `last_played_at`, `plant_stage`, `is_premium`.
* **Authentication triggers:** Trigger `on_auth_user_created` executes `handle_new_user()` on `auth.users` row creation to seed the database profile row.

### 🎮 Per-Game Schema Database Rule
To ensure optimal schema isolation, the core `profiles` table only manages global authentication and streak metrics. Every sub-game under the DopaMind platform MUST manage its own statistics and play history logs inside its own isolated database table (e.g. `speedmatch_history` for SpeedMatch), referencing `auth.users(id)` as a foreign key:
* **SpeedMatch History Schema (`speedmatch_history`):**
  - Attributes: `id` (primary key), `user_id` (foreign key to auth.users), `created_at`, `score`, `attempts`, `accuracy_percent`, `avg_speed_seconds`.
* **Security Rule:** Enable Row Level Security (RLS) for all game history tables. Only allow users to select/insert records that match their own `auth.uid()`.

---

## 💎 Premium UX & Design Guidelines
* **No Default Popups:** Banned using `window.alert()` or `window.confirm()`. All warnings, success toasts, and exit confirmations MUST be rendered as custom glassmorphic modals that adapt to dark/light templates.

---

## 📦 Vercel Monorepo Settings
Vercel is linked to the repository root. Build pipeline is handled via:
- Build Command: `cd marketing && npm run build`
- Install Command: `cd marketing && npm install`
- Output Directory: `marketing/dist`
- Serverless API functions: Mapped automatically from the root `/api` directory.

---

## 🧠 Architectural & Coding Principles

To maintain specialist-grade engineering standards and ensure DopaMind remains easily updateable, modular, and future-ready:

* **DRY (Don't Repeat Yourself) & Shared Helpers:** Avoid duplicate logic. Put state helpers, formatters, and analytics triggers in centralized modules.
* **Modular API-First Separation:** Decouple front-end view state from database and external logic. Communicate exclusively via clean API calls (e.g., Supabase JS query layers and Serverless functions).
* **Specialist Design Quality (Dark & White Themes):** 
  - Style interfaces using unified CSS custom properties (`var(--...)`) mapping to a consistent sage-green palette.
  - Implement fluid layout transitions and high-performance micro-animations.
  - Interface must seamlessly shift between light and dark themes using unified system preferences.
* **Future-Ready & Native Device Portability:** 
  - Keep styling layouts fully fluid, mobile-first, and responsive.
  - Ensure front-end code is compatible with standard Web views as well as native desktop wrapper containers (like Tauri or Electron shells).
* **Connectable Database Scaling:** Write clean migrations, schemas, and triggers that allow adding new features (like extra mini-games) without altering core profiles or breaking historical data sets.
