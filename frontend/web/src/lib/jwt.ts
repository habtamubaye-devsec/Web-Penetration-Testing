/**
 * Minimal JWT payload decoder for UI decisions.
 *
 * IMPORTANT:
 * - This does NOT verify the signature.
 * - Use it ONLY for UI rendering (role-based menus/routes).
 * - The backend is the source of truth for authorization.
 */

export type JwtPayload = {
  id?: string;
  userId?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};
