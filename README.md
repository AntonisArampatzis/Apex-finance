# APEX — Peak Financial Control

Monthly expense tracker. Mercedes F1 palette. Email OTP verification. Supabase auth + per-user data.

**Stack:** React + TypeScript + Vite · Supabase (Auth + PostgreSQL) · Recharts · React Router v6 · Vercel

---

## Auth Flow

Register → Enter email + password → Receive 6-digit code → Verify → Account created → Dashboard
Login    → Email + password → Dashboard

---

## Setup & Deploy

### Step 1 — Create a Supabase project
1. Go to supabase.com → New project
2. Pick a name, set a DB password, choose a region close to you (EU West)
3. Wait ~2 min for it to provision

### Step 2 — Run the database schema
1. Supabase dashboard → SQL Editor → New query
2. Paste the entire contents of supabase-schema.sql
3. Click Run

### Step 3 — Configure Supabase Auth for OTP
1. Authentication → Settings
   - OTP Expiry: 600 (10 minutes)
   - Enable email confirmations: ON
2. Authentication → Providers → Email: make sure Email provider is ON

Supabase automatically sends a 6-digit OTP when signInWithOtp() is called.

### Step 4 — Get your API keys
Supabase → Project Settings → API → copy:
- Project URL  (https://xxxx.supabase.co)
- anon / public key

### Step 5 — Run locally
  cp .env.example .env     # fill in your keys
  npm install
  npm run dev              # http://localhost:5173

### Step 6 — Deploy to Vercel

OPTION A — GitHub (recommended):
1. Push to a GitHub repo
2. vercel.com → Add New Project → Import repo
3. Add Environment Variables before deploying:
   VITE_SUPABASE_URL      = your project URL
   VITE_SUPABASE_ANON_KEY = your anon key
4. Deploy — done in ~30 seconds

OPTION B — Vercel CLI:
  npm install -g vercel
  vercel
  vercel env add VITE_SUPABASE_URL
  vercel env add VITE_SUPABASE_ANON_KEY
  vercel --prod

### Step 7 — Add Vercel domain to Supabase
After deploy Vercel gives you e.g. https://apex-finance.vercel.app

Supabase → Authentication → URL Configuration:
- Site URL: https://apex-finance.vercel.app
- Redirect URLs: https://apex-finance.vercel.app/**

---

## Env vars

VITE_SUPABASE_URL       → Supabase / Project Settings / API / Project URL
VITE_SUPABASE_ANON_KEY  → Supabase / Project Settings / API / anon public key
