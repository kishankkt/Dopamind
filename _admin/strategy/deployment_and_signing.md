# 🚀 DopaMind End-to-End Signing & Deployment Guide

This guide details the step-by-step roadmap to hook up DopaMind's serverless backend, configure Stripe payment portals, deploy the landing page, and compile/sign the native application.

---

## 🛠️ Infrastructure Checklist & Linking

```
                               ┌──────────────────┐
                               │   GitHub Repo    │
                               └────────┬─────────┘
                                        │ (Push Tag trigger)
                   ┌────────────────────┼────────────────────┐
                   ▼                    ▼                    ▼
          ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
          │ Vercel Hosting │   │ Supabase DB /  │   │ GitHub Actions │
          │ (Marketing /   │   │ Auth API       │   │ Multi-Platform │
          │  Serverless)   │   └────────────────┘   │ Build Releases │
          └────────────────┘                        └────────────────┘
```

---

## Step 1: GitHub Repository & Secrets Initialization

1. **Create Repo:** Create a new repository on GitHub (e.g. `github.com/username/DopaMind`).
2. **Git Init & Push:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial brand and boilerplate structure"
   git remote add origin git@github.com:username/DopaMind.git
   git branch -M main
   git push -u origin main
   ```
3. **Repository Actions Secrets:** In GitHub settings, add these variables under **Settings ➡️ Secrets and variables ➡️ Actions**:
   * `TAURI_SIGNING_PRIVATE_KEY` (Generated via Tauri CLI for release builds)
   * `TAURI_KEY_PASSWORD` (Password for your private key, if set)
   * `GITHUB_TOKEN` (Automatically provided by GitHub runner for publishing drafts)

---

## Step 2: Supabase Database Schema & Auth Setup

Since we already have a Supabase account, create the tables to manage authentication and user streak metrics.

### 1. Database Table: `profiles`
Run the following SQL in your Supabase SQL Editor:

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  streak_count integer default 0 not null,
  last_played_at timestamp with time zone,
  plant_stage integer default 0 not null, -- 0: Seed, 1: Sprout, 2: Leafy, 3: Flowering
  is_premium boolean default false not null,
  stripe_customer_id text,
  stripe_subscription_id text
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);
```

### 2. Profile Generation Trigger
Create a trigger that automatically inserts a profile row when a user registers via Supabase Auth:

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, streak_count, plant_stage, is_premium)
  values (new.id, new.raw_user_meta_data->>'username', 0, 0, false);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Step 3: Vercel Serverless & Marketing Deployment

1. **Deploy Project:** Import the GitHub repository into your Vercel dashboard.
2. **Configure Directories:**
   * **Root Directory:** Set to `marketing` (so Vercel builds the landing page as the primary index site).
   * **Functions Directory:** Vercel automatically maps `/api` at the root folder to serverless endpoints.
3. **Add Environment Variables:**
   * `SUPABASE_URL` (Your Supabase endpoint)
   * `SUPABASE_SERVICE_ROLE_KEY` (Service key to bypass RLS inside Stripe webhooks)
   * `STRIPE_SECRET_KEY` (Your private Stripe dashboard key)

---

## Step 4: Stripe Checkout & Webhook Pipeline

1. **Create Products:** In the Stripe dashboard, create a **DopaMind Premium Monthly** product ($4.99/mo).
2. **Set Webhook:** In Stripe Settings ➡️ Webhooks, add a new endpoint pointing to your deployed Vercel URL:
   * URL: `https://your-dopamind-domain.vercel.app/api/stripe-webhook`
   * Select events: `checkout.session.completed`, `customer.subscription.deleted`.
3. **Save Webhook Secret:** Copy the signing secret (`whsec_...`) and save it as Vercel env variable: `STRIPE_WEBHOOK_SECRET`.

---

## Step 5: Tauri macOS Ad-Hoc Signing & compilation

Because native macOS applications trigger Gatekeeper errors unless signed by a certified Apple Developer ($99/year), we will build the app using **Ad-Hoc Signing (Self-Signing)**.

### 1. Generating Tauri Signing Keys (Optional)
If you wish to auto-update packages safely later:
```bash
npx tauri signer generate
```
Add the output private key and password to your GitHub secrets.

### 2. Local Ad-Hoc Compilation (On Mac Desktop)
To compile and force local ad-hoc codesign:
1. Open terminal in the `/app` folder.
2. Build the app bundle:
   ```bash
   npm run tauri build
   ```
3. Tauri automatically signs binaries as ad-hoc when Apple Developer Profile certificate files are not detected.
4. If you need to manually re-sign the `.app` bundle, run:
   ```bash
   codesign --force --deep --sign - src-tauri/target/release/bundle/osx/DopaMind.app
   ```

### 3. Deploying the macOS Bundle to Users
- Upload the built `DopaMind.dmg` to your Vercel marketing downloads page.
- Present the **Right-Click ➡️ Open** warning layout. Users only need to bypass Gatekeeper once.

---

## Step 6: Automating Releases via GitHub Actions

When you are ready to publish a new build:
1. Bump the version in `app/src-tauri/tauri.conf.json` and `app/package.json`.
2. Commit and tag the commit:
   ```bash
   git add .
   git commit -m "release: v1.0.0"
   git tag -a v1.0.0 -m "Version 1.0.0 release"
   git push origin main --tags
   ```
3. **GitHub Actions** will trigger [tauri-build.yml](file:///c:/Users/PREMIUM/Desktop/Agentic-Proejcts/DopaMind/ci-cd/tauri-build.yml).
4. Go to your GitHub Repository releases page. A new **Draft Release** will be populated with Windows (.exe), Mac (.dmg), and Linux (.deb) assets, ready for you to publish.
