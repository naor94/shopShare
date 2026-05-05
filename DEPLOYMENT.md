# Deployment Guide - על האש BBQ Planner

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, password, and region (choose closest to Israel)

### Run Database Schema
1. Go to **SQL Editor** in the Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run**

### Enable Realtime
Go to **Database → Replication** and enable realtime for:
- `events`
- `families`  
- `items`

### Get API Keys
Go to **Settings → API** and copy:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Local Development

```bash
cd bbq-planner
npm install

# Copy env file
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

npm run dev
# Visit http://localhost:3000
```

---

## 3. Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel deploy
# Follow prompts, set env vars when asked
```

### Option B: GitHub + Vercel (recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## 4. PWA Icons

Before deploying, add icons to `public/icons/`:
- `icon-192x192.png` (192×192 px)
- `icon-512x512.png` (512×512 px)

Use [favicon.io](https://favicon.io) or [realfavicongenerator.net](https://realfavicongenerator.net).

---

## 5. Share Your Event

After deploying, create an event and share the URL:
```
https://your-app.vercel.app/event/<event-id>
```

All families who open this link will see real-time updates! 🔥
