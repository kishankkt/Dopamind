---
title: "Getting Started"
date: 2026-07-05
---

# Getting Started

Welcome to the DopaMind developer documentation! DopaMind is built as a lightweight, zero-bloat platform for cognitive training.

## Architecture Overview

DopaMind uses a hybrid web/desktop architecture:
- **Web App**: Built with Vite and React 19. It uses vanilla CSS for styling to remain lightweight and performant.
- **Desktop App**: Packaged via Tauri (Rust), wrapping the same React codebase for a native, offline-capable experience on Windows, macOS, and Linux.
- **Backend**: Supabase provides Authentication and PostgreSQL database services (with Row Level Security).
- **Content**: Markdown-first architecture. All pages, blogs, and docs are statically served and parsed at runtime using `react-markdown` and `import.meta.glob`.

## Running Locally

To run the web version locally:

1. Clone the repository
2. Install dependencies: `npm install` inside the `marketing/` directory
3. Set up your `.env` file with Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the Vite dev server: `npm run dev`

To run the Tauri desktop app locally, ensure you have the Rust toolchain installed, then run: `npm run tauri dev`.
