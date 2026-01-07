const RAW_BASE = import.meta.env.VITE_API_BASE_URL;

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  if (!RAW_BASE) return path; // local dev => Vite proxy
  const base = RAW_BASE.replace(/\/$/, ""); // trim trailing slash
  return `${base}${path}`;
}
