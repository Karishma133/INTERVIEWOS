# Deploying InterviewOS

This project has three pieces to deploy:
1. **Database** — MongoDB Atlas (you're likely already using this)
2. **Backend** — Node/Express + Socket.io API → deploy to **Render** (free tier works)
3. **Frontend** — React static build → deploy to **Vercel** or **Netlify** (free tier works)

---

## 1. MongoDB Atlas (database)

If you're already using Atlas locally, you just need to open network access
for your deployed backend:

1. Atlas dashboard → **Network Access** → **Add IP Address**
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) — simplest option for
   a hosted backend on a platform like Render, which doesn't have static IPs
   on the free tier.
3. Your existing `MONGO_URI` connection string works as-is — no changes needed.

---

## 2. Backend → Render

### Option A: One-click with the included `render.yaml`
1. Push this repo to GitHub (make sure `.env` is **not** committed — it's
   already in `.gitignore`)
2. Render dashboard → **New** → **Blueprint** → connect your repo
3. Render reads `render.yaml` automatically and creates the service
4. Fill in the two `sync: false` variables manually in the Render dashboard:
   - `MONGO_URI` — your Atlas connection string
   - `CLIENT_URL` — leave blank for now, set it after deploying the frontend (step 4 below)
5. Deploy. Your backend URL will look like `https://interviewos-backend.onrender.com`

### Option B: Manual setup
1. Render dashboard → **New** → **Web Service** → connect your repo
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add environment variables (see checklist below)

### ⚠️ Free tier notes
- Render's free tier **spins down after 15 minutes of inactivity** and takes
  ~30-60 seconds to wake up on the next request — the first request after
  idle time will feel slow. This is normal, not a bug.
- Free tier does **not** support Docker-in-Docker, so leave
  `USE_DOCKER_SANDBOX=false` — the app already falls back to the
  `child_process` sandbox automatically either way.
- Socket.io works fine on Render's free tier (WebSockets are supported).

---

## 3. Frontend → Vercel (or Netlify)

### Vercel
1. Vercel dashboard → **Add New Project** → import your repo
2. **Root Directory:** `frontend`
3. Framework preset: **Create React App** (auto-detected)
4. Add environment variables (see checklist below)
5. Deploy. Your frontend URL will look like `https://interviewos.vercel.app`
6. `frontend/vercel.json` (already included) handles React Router's
   client-side routes so refreshing a page like `/dashboard` doesn't 404.

### Netlify (alternative)
1. Netlify dashboard → **Add new site** → import your repo
2. **Base directory:** `frontend`
3. **Build command:** `npm run build`
4. **Publish directory:** `frontend/build`
5. Add environment variables in **Site settings → Environment variables**
6. `frontend/public/_redirects` (already included) handles SPA routing

---

## 4. Connect them together (important — do this last)

After both are deployed, point them at each other:

1. **Backend** (Render) → environment variables → set `CLIENT_URL` to your
   deployed frontend URL (e.g. `https://interviewos.vercel.app`) → redeploy
2. **Frontend** (Vercel/Netlify) → environment variables → set:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://your-backend.onrender.com`
   → redeploy (React env vars are baked in at build time, so a redeploy is required)

Without this step, you'll see CORS errors in the browser console.

---

## 5. Environment variables checklist

### Backend (Render)
| Variable | Required? | Notes |
|---|---|---|
| `MONGO_URI` | Yes | Your Atlas connection string |
| `JWT_SECRET` | Yes | Long random string — Render can auto-generate this |
| `CLIENT_URL` | Yes (prod) | Your deployed frontend URL, no trailing slash |
| `NODE_ENV` | Recommended | Set to `production` |
| `CODE_TIMEOUT_MS` | Optional | Defaults to 3000 |
| `EMAIL_USER` / `EMAIL_PASS` | Optional | For real email — otherwise dev-mode links are returned in the API response |
| `USE_DOCKER_SANDBOX` | Optional | Leave `false` unless your host supports Docker-in-Docker |

### Frontend (Vercel/Netlify)
| Variable | Required? | Notes |
|---|---|---|
| `REACT_APP_API_URL` | Yes | `https://your-backend-url/api` |
| `REACT_APP_SOCKET_URL` | Yes | `https://your-backend-url` (no `/api`) |

---

## 6. After deploying — seed the question banks

Render's dashboard has a Shell tab for your service where you can run:
```bash
node seed.js
node seedAptitude.js
node seedSituational.js
```
These only need to run once — they populate the shared Atlas database.

---

## 7. Production checklist before sharing your live link

- [ ] `JWT_SECRET` is a real random value, not the placeholder
- [ ] `CLIENT_URL` on the backend matches your frontend URL exactly
- [ ] MongoDB Atlas network access allows your backend's connections
- [ ] Test registering a new account end-to-end on the live URLs
- [ ] Test Socket.io features (Collab Room, Multiplayer, Video Call)
- [ ] `GET https://your-backend-url/api/health` returns `{"status":"ok","dbConnected":true}`
