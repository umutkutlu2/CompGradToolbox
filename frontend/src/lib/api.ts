const RAW_BASE = import.meta.env.VITE_API_BASE_URL;

let warnedInvalidEnv = false;

export function apiUrl(path: string): string {
  // Ensure path starts with "/"
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  // If no base URL, return path for local dev (uses Vite proxy)
  if (!RAW_BASE || RAW_BASE.trim() === "") {
    return path;
  }
  
  // Trim whitespace and trailing slashes
  let base = RAW_BASE.trim().replace(/\/+$/, "");
  
  // If base doesn't start with http:// or https://, prefix with https://
  // This prevents relative paths like "compgradtoolbox-production.up.railway.app"
  // from being treated as relative to the frontend domain
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    if (!warnedInvalidEnv) {
      console.warn(
        `[apiUrl] VITE_API_BASE_URL doesn't start with http:// or https://. ` +
        `Auto-prefixing with https://. Value: "${RAW_BASE}"`
      );
      warnedInvalidEnv = true;
    }
    base = `https://${base}`;
  }
  
  return `${base}${path}`;
}
