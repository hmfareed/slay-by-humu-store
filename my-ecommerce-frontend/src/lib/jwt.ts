export interface JWTPayload {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function decodeToken(token: string | null | undefined): JWTPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 string safely supporting UTF-8
    let jsonString: string;
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const binaryString = window.atob(base64);
      jsonString = decodeURIComponent(
        binaryString
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else if (typeof atob === 'function') {
      const binaryString = atob(base64);
      jsonString = decodeURIComponent(
        binaryString
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      jsonString = Buffer.from(base64, 'base64').toString('utf8');
    }

    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null | undefined): boolean {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  // exp is in seconds, compare with Date.now() in ms
  return Date.now() >= payload.exp * 1000;
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}
