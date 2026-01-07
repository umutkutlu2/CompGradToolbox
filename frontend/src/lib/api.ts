/**
 * API URL helper for consistent API endpoint construction.
 * 
 * Reads base URL from VITE_API_BASE_URL environment variable.
 * - In production (Vercel): Set VITE_API_BASE_URL=https://compgradtoolbox-production.up.railway.app
 * - In local dev: Omit VITE_API_BASE_URL to rely on Vite proxy or same-origin requests
 */

// Read base URL from environment, trim trailing slashes
const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
export const API_BASE = rawBase.trim().replace(/\/+$/, "");

/**
 * Constructs a full API URL from a path.
 * 
 * @param path - API path (e.g., "/api/login" or "api/login")
 * @returns Full URL if API_BASE is set, otherwise returns the path (for local dev proxy)
 * 
 * @example
 * // Production: apiUrl("/api/login") => "https://compgradtoolbox-production.up.railway.app/api/login"
 * // Local dev: apiUrl("/api/login") => "/api/login" (uses Vite proxy)
 */
export function apiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If API_BASE is empty, return path (for local dev with Vite proxy)
  if (!API_BASE) {
    return normalizedPath;
  }
  
  // Otherwise, combine base + path
  return `${API_BASE}${normalizedPath}`;
}

