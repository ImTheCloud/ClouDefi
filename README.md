🚀 Challenges Planner
👉 https://cloudefi.vercel.app/

Challenges Planner — Goal Tracking App (React + Vite + Supabase)
Track your personal challenges with daily, weekly, and monthly goals. A modern, minimal web app for managing quantitative, binary, and weight-based challenges with real-time check-ins, progress tracking, and secure user isolation via Row-Level Security (RLS).

✨ Features
- **Challenge Types**: Quantitative (e.g., 100km), Binary (yes/no), Weight tracking
- **Flexible Scheduling**: Daily, Weekly (select specific days), Monthly recurrence
- **Weekly Dashboard**: Visual week view with task cards, completion status, and quick check-ins
- **Check-ins**: Log progress with optional notes, undo completed tasks
- **Challenge Management**: Create, edit, delete challenges with full CRUD operations
- **User Authentication**: Secure email/password signup + login via Supabase Auth
- **Row-Level Security**: Each user sees only their own challenges (RLS policies enforced)
- **Modern UI**: Minimaliste, épuré design with light theme, responsive on all devices
- **Real-time Sync**: Instant data synchronization with Supabase backend

🎨 Design
- Clean, minimalist interface (white + blue #2563eb accent)
- Inter typography for optimal readability
- Smooth animations and transitions
- Mobile-responsive layout (works on all screen sizes)
- Dark/Light theme ready (CSS variables system)

🧱 Stack
**Frontend:**
- React 19 + TypeScript
- Vite (fast build tool)
- React Router (client-side routing)
- CSS (custom, no Tailwind)
- Responsive design system with CSS variables

**Backend:**
- Supabase (PostgreSQL + Authentication)
- Row-Level Security (RLS) policies for data isolation
- JWT-based auth
- Firestore-style real-time sync (via Supabase)

**Deployment:**
- Vercel (frontend)
- Supabase Cloud (database)

🗄️ Database Schema
```
challenges
├── id (UUID)
├── user_id (FK → auth.users)
├── title, description
├── type (quantitative | binary | weight)
├── unit, target_value
├── start_date, end_date
├── is_active (boolean)
└── RLS: Users see only their own

challenge_schedules
├── id (UUID)
├── user_id (FK)
├── challenge_id (FK)
├── frequency (daily | weekly | monthly)
├── weekly_days (array)
└── RLS: Users see only their own

checkins
├── id (UUID)
├── user_id (FK)
├── challenge_id (FK)
├── check_date, value, note
└── RLS: Users see only their own
```

🧑‍💻 Content Workflow
**Managing Challenges (in-app):**
1. Sign up / Log in
2. Click "Nouveau challenge"
3. Fill form: title, type, dates, frequency, schedule
4. Save → appears on dashboard
5. Edit / Delete anytime

**Check-ins (daily tracking):**
1. Dashboard shows current week tasks
2. Click on a task to log progress
3. Enter value (quantitative) or mark done (binary)
4. Add optional notes
5. Undo anytime by clicking task again

**No CMS needed** — All data managed directly in the app via Supabase.

🔒 Security
- Row-Level Security (RLS) on all tables
- JWT authentication via Supabase
- Password hashing (Supabase Auth)
- Each user's data is completely isolated
- HTTPS enforced on production

🚀 Deployment
**Frontend (Vercel):**
```bash
cd frontend
npm install
npm run build
# Auto-deployed on git push
```

**Backend (Supabase):**
- Database hosted on Supabase Cloud
- Migrations auto-applied on `supabase db push`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

📱 Getting Started (Local Dev)
```bash
# Clone repo
git clone https://github.com/ImTheCloud/ClouDefi.git
cd ClouDefi/frontend

# Setup .env
cp .env.example .env
# Add your Supabase URL & Anon Key

# Install & run
npm install
npm run dev

# Open http://localhost:5173
```

📚 Documentation
- [Design System](./DESIGN_SYSTEM.md) — Colors, spacing, typography
- [Frontend Redesign](./FRONTEND_REDESIGN.md) — UI/UX improvements
- [Maintenance Guide](./MAINTENANCE_GUIDE.md) — How to modify styles
- [Netlify Deployment](./NETLIFY_DEPLOYMENT.md) — Deploy to Netlify (alternative)

📝 Features Roadmap
- [ ] Dark mode toggle
- [ ] Statistics dashboard (charts, progress %)
- [ ] Achievements / badges
- [ ] Social sharing (challenges with friends)
- [ ] Mobile app (React Native)
- [ ] Email reminders for check-ins
- [ ] Export data (CSV/PDF)

📄 License
Private project — All rights reserved.

---

**Built with ❤️ for goal tracking.**
