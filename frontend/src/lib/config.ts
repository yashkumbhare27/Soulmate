// Central place for the backend URL.
// Set NEXT_PUBLIC_API_URL in your deployment provider (Vercel) to your
// deployed backend URL (Railway/Render), e.g. https://soulmate-backend.onrender.com
// Falls back to localhost for local development only.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
