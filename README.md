# AgriConnect AI

Production-ready MERN stack platform connecting farmers with consumers, plus equipment rental, expert consultation, community forum, real-time chat, delivery tracking, analytics, and a placeholder AI disease-detection module.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, React Query, Framer Motion, Recharts, Socket.IO Client |
| Backend | Node.js, Express, JWT, Multer, Socket.IO, Bcrypt |
| Database | MongoDB Atlas, Mongoose |

## Project structure

```
Agri/
├── backend/          # Express API + Socket.IO
│   └── src/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       └── sockets/
└── frontend/         # React SPA
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        └── services/
```

## Setup

### 1. MongoDB Atlas

Create a cluster and copy your connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, CLIENT_ORIGIN
npm install
npm run dev
```

API: `http://localhost:5000`  
Health: `GET /api/health`

Optional seed data:

```bash
node scripts/seed.js
```

### 3. Frontend

```bash
cd frontend
# Create .env with:
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000
npm install
npm run dev
```

App: `http://localhost:5173`

## User roles

- **farmer** — products, farm profile, orders, equipment rental, consultations
- **consumer** — marketplace, cart, wishlist, payments, orders
- **expert** — consultation replies
- **delivery** — delivery status updates
- **equipment_owner** — equipment listings and booking approvals
- **admin** — platform analytics

## Implemented features (Phase 1)

- JWT auth with refresh tokens, email verify & password reset flows
- Marketplace with search, filters, sorting, pagination
- Cart (localStorage) → simulated payment → orders
- Wishlist, farmer follow, public farmer profiles
- Farmer product CRUD and farm profile
- Equipment rental booking workflow
- Expert consultations with image upload
- Community forum (posts, likes, comments)
- Socket.IO chat and notifications
- Delivery tracking
- Role-based dashboards and analytics API
- AI Lab mock disease prediction (placeholder for TensorFlow/FastAPI)

## API overview

| Module | Base path |
|--------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Farms | `/api/farms` |
| Products | `/api/products` |
| Orders | `/api/orders` |
| Equipment | `/api/equipment` |
| Bookings | `/api/bookings` |
| Consultations | `/api/consultations` |
| Forum | `/api/forum` |
| Messages | `/api/messages` |
| Notifications | `/api/notifications` |
| Deliveries | `/api/deliveries` |
| Analytics | `/api/analytics` |
| AI (mock) | `/api/ai` |

## Next steps (recommended)

1. MongoDB seed / demo accounts for viva demo
2. Admin UI for user verification and complaints
3. Reviews & ratings collections
4. Real payment gateway (Razorpay/Stripe)
5. FastAPI + MobileNetV2 for plant disease detection
6. Mobile app (React Native)

## Deploy (Git + Netlify + Render)

This app has two parts:

| Part | Host | Why |
|------|------|-----|
| **Frontend** (`frontend/`) | [Netlify](https://www.netlify.com) or [Vercel](https://vercel.com) | Static Vite build + React Router |
| **Backend** (`backend/`) | [Render](https://render.com) | Express + Socket.IO + file uploads |

Example production backend: `https://agriconnect-backend-uutq.onrender.com`

### 1. Push to GitHub

```bash
cd Agri
git init
git add .
git commit -m "Initial commit: AgriConnect AI MERN app"
```

Create a new repo on GitHub (empty, no README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy backend (Render)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** (or Web Service).
2. Connect your GitHub repo; use `render.yaml` or set **Root Directory** to `backend`.
3. **Environment variables** (from `backend/.env.example`):

   | Variable | Example |
   |----------|---------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `ACCESS_TOKEN_SECRET` | Long random string |
   | `REFRESH_TOKEN_SECRET` | Long random string |
   | `CLIENT_ORIGIN` | `http://localhost:5173,https://YOUR-NETLIFY-SITE.netlify.app` |

4. Deploy and copy the service URL, e.g. `https://agriconnect-backend-uutq.onrender.com`.

### 3. Deploy frontend (Netlify)

1. Push code to [GitHub](https://github.com/santhoshkumaritla/AgriConnect) (see step 1).
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → **GitHub** → choose **AgriConnect**.
3. **Build settings** (important):

   | Setting | Value |
   |---------|--------|
   | Base directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | `frontend/dist` |

   (Or leave defaults if `frontend/netlify.toml` is detected when base = `frontend`.)

4. **Site configuration** → **Environment variables** → **Add a variable** (deploy context: **Production**):

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://agriconnect-backend-uutq.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://agriconnect-backend-uutq.onrender.com` |

5. **Deploy site**. Copy your Netlify URL (e.g. `https://agriconnect-ai.netlify.app`).
6. On **Render**, set `CLIENT_ORIGIN` to:

   `http://localhost:5173,https://YOUR-NETLIFY-URL.netlify.app`

   Save → Render redeploys. Without this, login/API calls fail with CORS errors.

### 3b. Deploy frontend (Vercel) — optional

1. [vercel.com](https://vercel.com) → import repo, **Root Directory**: `frontend`.
2. Same `VITE_*` env vars as Netlify above.
3. Add the Vercel URL to Render `CLIENT_ORIGIN` (comma-separated).

### 4. MongoDB Atlas

- Network Access: allow `0.0.0.0/0` (or Render’s IPs) for cloud hosting.
- Use the same `MONGODB_URI` on Render.

### Local vs production

- Never commit `.env` files (they are in `.gitignore`).
- After deploy, run seed once against production DB only if you intend to use demo accounts:

  ```bash
  cd backend
  MONGODB_URI="your-atlas-uri" node scripts/seed.js
  ```

## License

Academic / final-year project use.
