# DopaMind Brand & Application Infrastructure Plan

This plan establishes **DopaMind** as a premium, institutionalized brand. We will create a highly structured corporate workspace containing our brand design guidelines, legal policies, user growth strategies, support documentation, marketing portfolio website, and native application codebase.

---

## User Review Required

> [!IMPORTANT]
> **Ad-Hoc Distribution Strategy:** For the macOS build, we will establish a dedicated download subpage on our marketing site with explicit, user-friendly visual guides on how to install using the **Right-Click ➡️ Open** bypass. This maintains a premium user experience even before acquiring the paid Apple Developer Account.
>
> **Privacy & Compliance:** The legal agreements will include modern standard clauses for data tracking (GDPR, CCPA) related to game statistics and third-party processing (Stripe/Razorpay), which are required for any serious brand.

---

## Proposed Changes

We will organize the folder structure under a new directory: [dopamind-app](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app) inside your workspace.

```
dopamind-app/
├── brand/          # Identity, design tokens, logo specs
├── legal/          # Privacy Policy, Terms of Service, compliance docs
├── strategy/       # Product roadmap, retention & ad-funnel strategies
├── docs/           # Support center, FAQs
├── marketing/      # Ultra-premium marketing portfolio website (Vite + React)
└── app/            # Native Tauri + React desktop/mobile application
```

---

### 🏛️ Component 1: Brand & Legal Foundation

#### [NEW] [identity.md](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/brand/identity.md)
* Establishes the typography, color system (Sage Greens, Oats, Dark Emerald), voice, tone, and visual guidelines.

#### [NEW] [privacy_policy.md](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/legal/privacy_policy.md)
* Standard professional privacy policy detailing data storage, account credentials (via Supabase), and secure transactional tokens (via Stripe/Razorpay).

#### [NEW] [terms_of_service.md](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/legal/terms_of_service.md)
* Clear terms governing subscriptions, micro-transactions, fair usage, and intellectual property.

#### [NEW] [support.md](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/docs/support.md)
* A ready-to-publish FAQ and contact guide positioning us as a customer-focused, established developer.

---

### 📈 Component 2: Product & Growth Strategy

#### [NEW] [growth_and_retention.md](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/strategy/growth_and_retention.md)
* Documents the gamification mechanics, including the Duolingo-style streak loop, the cortisol-rescue system, and the step-by-step ad-to-conversion funnel.

---

### 💻 Component 3: Marketing Portfolio & App Base

#### [NEW] [marketing-site](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/marketing/) (Vite + React)
* We will create a responsive, modern landing page with a hero header, interactive game previews, feature benefits (focus, memory, cognitive agility), dynamic FAQ dropdowns, and download buttons for Windows (.exe), Mac (.dmg), Linux (.deb), and Mobile.

#### [NEW] [app](file:///c:/Users/PREMIUM/Desktop/testing-laptop-imported/dopamind-app/app/) (Tauri + Vite + React)
* Initializes the cross-platform Tauri project structure, setting up the basic shell, routing, and the priority game **SpeedMatch**.

---

## Verification Plan

### Automated Tests
- Verify successful initialization of Vite templates for both `/marketing` and `/app`.
- Compile test build check: Run `npm run build` on the marketing site to confirm static assets bundle correctly.

### Manual Verification
- Review the brand docs, legal pages, and strategies in the workspace.
- View the marketing site on a local web server to confirm visual responsiveness.
