# SoulMate AI — Deployment & Infrastructure Guide

This guide details the deployment architecture, configuration keys, and continuous delivery setups required to run **SoulMate AI** in production.

---

## 1. Environment & Secrets Setup

Ensure you create environment configurations in your deployment provider dashboards. Do not commit actual secrets to the repository.

### Backend Environment Variables (.env)
| Variable | Purpose | Example Value |
| :--- | :--- | :--- |
| `PORT` | Local runtime port | `5000` |
| `MONGO_URI` | MongoDB Connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/soulmate` |
| `JWT_SECRET` | Authentication key signing secret | `your-secure-random-jwt-key-phrase` |
| `OPENAI_API_KEY` | OpenAI API Key (Preference extraction & scoring) | `sk-proj-xxxxxxxxxxxxxxxxxxxx` |

### Frontend Environment Variables (.env.local)
| Variable | Purpose | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend server URL | `https://soulmate-backend.onrender.com` |

---

## 2. Platform Deployments

### A. Backend API & Socket.IO (Railway or Render)
We recommend **Railway** or **Render** for Express API hosting as they natively support long-lived WebSocket connections.

1. **New Service**: Select *Web Service* connected to your GitHub Repository.
2. **Build Settings**:
   - Build command: `npm run build` (runs TypeScript compiler `tsc`)
   - Start command: `npm run start` (runs `node dist/server.ts`)
3. **CORS Setup**: The backend Express server is configured with CORS enabled. On Render/Railway, specify the deployed Next.js domain under allowed origins if tightening security.
4. **Health Check**: Configured at `/health`.

### B. Database (MongoDB Atlas)
1. Register on **MongoDB Atlas** and create a shared free-tier cluster.
2. Under Network Access, whitelist `0.0.0.0/0` (temporary for Render/Railway dynamic IPs) or set specific provider IPS.
3. Retrieve the Connection String and inject it into the backend `MONGO_URI`.

### C. Frontend Website (Vercel)
Vercel is optimized for Next.js deployments.

**Live Deployment URL:** `https://frontend-2n1x7cef9-yashkumbhare27.vercel.app`

1. Create a project in **Vercel** pointing to the `frontend/` subdirectory of your monorepo.
2. Set Environment Variables: Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
3. Vercel will automatically configure build triggers on every commit pushed to the `main` branch.

---

## 3. CI/CD Integration (GitHub Actions)

Create a GitHub Action file under `.github/workflows/deploy.yml` to run tests and automate releases:

```yaml
name: SoulMate AI CI/CD pipeline

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install Monorepo Dependencies
        run: npm install --legacy-peer-deps
        
      - name: Compile Shared Types
        run: npm run build --workspace=shared
        
      - name: Compile Express Backend
        run: npm run build --workspace=backend
        
      - name: Compile Next.js Frontend
        run: npm run build --workspace=frontend
```

---

## 4. Rollback & Redeployment

- **Vercel**: Go to the *Deployments* tab, select a previous stable deploy, and click **Promote to Production** for instant rollback.
- **Render / Railway**: Under *Deployments*, choose the previous build commit and click **Rollback** to redeploy that specific image.
