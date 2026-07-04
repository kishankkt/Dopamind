---
name: DopaMind Platform Guidelines
description: Developer guidelines, SVG logo assets, database schema configurations, and Vercel monorepo patterns for DopaMind.
---

# 🌿 DopaMind - Core Developer Guidelines

This file is a developer skill configuration. It instructs future coding agents how to build, maintain, and scale the DopaMind platform without context drift.

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

## 📦 Vercel Monorepo Settings
Vercel is linked to the repository root. Build pipeline is handled via:
- Build Command: `cd marketing && npm run build`
- Install Command: `cd marketing && npm install`
- Output Directory: `marketing/dist`
- Serverless API functions: Mapped automatically from the root `/api` directory.
