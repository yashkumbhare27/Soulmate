# SoulMate AI — AI-Powered Matrimonial Platform

> "Find Your Perfect Soulmate with AI"
> **Positioning:** "The only matchmaking AI that tells you why."

SoulMate AI is a premium relationship and matrimonial platform designed specifically for the modern Indian context. Unlike generic dating apps, SoulMate AI integrates AI compatibility explanation directly into its UX, fostering deep trust, explainable matches, and safety.

---

## 1. Brand Identity & Design System

### Color Palette (WCAG AA Compliant)
- **Primary:** Deep Lavender / Orchid (`#8B5FBF`)
- **Secondary:** Dusty Rose / Muted Pink (`#E8A0BF`)
- **Dark Neutral Base:** Plum-Black (`#0F0B13`)
- **Light Neutral Base:** Warm Cream (`#FCFAF7`)
- **AI Accent:** Iridescent Gold gradient (`#F59E0B` to `#D4AF37`)

### Logo Design — Metallic 3D Mark
The platform logo is rendered in a polished liquid-metal/brushed-chrome aesthetic.
- **Symbolism:** Two asymmetric ribbon-like forms curve toward each other from opposite sides. Separately incomplete, they merge to complete a shared silhouette. Where they meet, a central cluster of glowing neural nodes sparks — indicating AI alignment.
- **Implementation:** Custom vector-styled SVG (`SpecularLogo.tsx`) with specular overlay paths and drop-shadow Gaussian blurs, giving high visual depth.

---

## 2. Core Features & Differentiators

1. **AI Natural-Language Preference Chat:** Skip lengthy, tedious registration forms. Users describe their partner preferences conversationally, and the AI extracts structured preferences.
2. **Explainable Match Compatibility:** Every profile displays a compatibility percentage and a plain-language summary of why they matched (along with explicit green/red flags).
3. **7-Day Chat Window Countdowns:** Matched users chat for 7 days (indicated by a live HUD clock). They must mutually confirm continued interest before unlocking deeper matrimonial stages.
4. **Trust Badge System:** Profiles display distinct verifications (ID Verified, Video Verified, Family Verified) managed through an administrative moderation queue.

---

## 3. Tech Stack

- **Frontend (Web):** Next.js (React) + Tailwind CSS v4 + Framer Motion (intro animations and page transitions) + Lucide Icons.
- **Backend:** Node.js + Express + TypeScript + Socket.IO (real-time chat messaging).
- **Database:** MongoDB + Mongoose Schemas.
- **AI Integration:** OpenAI API client with robust sandbox fallback.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (or Atlas URI)

### Quick Setup

1. **Clone & Install Workspace Dependencies:**
   From the root folder, run:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables:**
   - In `backend/`, copy `.env.example` to `.env` and fill in secrets (e.g. `MONGO_URI`, `OPENAI_API_KEY`).
   - Defaults are pre-configured to run with local MongoDB and mock AI generators if no keys are set.

3. **Start the Express API Server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the Next.js Frontend Development Server:**
   Open a separate terminal and run:
   ```bash
   cd frontend
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

5. **Local Authentication Credentials:**
   To test registration and login, use any phone number and enter simulated OTP code: **`123456`**.
