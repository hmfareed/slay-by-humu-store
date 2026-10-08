export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://slay-by-humu-store.onrender.com/api'
    : 'http://localhost:5000/api');

