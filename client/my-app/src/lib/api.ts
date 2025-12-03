/**
 * Helper function to get the API base URL
 * Uses NEXT_PUBLIC_APP_URL environment variable or defaults to http://localhost:8066
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or default
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8066';
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8066';
}

/**
 * Helper function to build API endpoint URL
 */
export function apiUrl(path: string): string {
  const base = getApiUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}

