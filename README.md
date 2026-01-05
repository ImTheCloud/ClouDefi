🚀 Challenges Planner
👉 https://cloudefi.vercel.app/

Challenges Planner — Goal Tracking App (React + Vite + Supabase)
Track personal challenges with daily, weekly, and monthly goals. Modern web app with quantitative/binary/weight tracking, real-time check-ins, and secure user isolation via Row-Level Security.

✨ Features
- Challenge types: Quantitative, Binary, Weight
- Flexible scheduling: Daily, Weekly (select days), Monthly
- Weekly dashboard with check-in tracking
- User authentication (email/password via Supabase)
- Row-Level Security: each user sees only their own data
- Minimaliste UI: light theme, responsive design
- Real-time sync with Supabase

🧱 Stack
React 19 + TypeScript + Vite  
Supabase (PostgreSQL + Auth + RLS)  
CSS custom (no Tailwind)  
Vercel (deployment)

📱 Getting Started
```bash
cd frontend
cp .env.example .env  # Add Supabase keys
npm install
npm run dev
```

📚 Documentation
[Design System](./frontend/DESIGN_SYSTEM.md) | [Frontend Redesign](./frontend/FRONTEND_REDESIGN.md) | [Maintenance](./frontend/MAINTENANCE_GUIDE.md)

📄 License
Private project — All rights reserved.

