/**
 * Safe Custom API Fetch Utility for FlourishCare
 * Safely appends Bearer authentication token from localStorage
 * to any server requests made to /api/* endpoints.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  const cleanInput = typeof input === 'string' ? input : input.toString();

  // Only inject Authorization header for our app's internal API endpoints
  if (token && cleanInput.startsWith('/api/')) {
    init = init || {};
    
    // Create copy of headers to avoid mutating read-only Headers
    const headers = new Headers(init.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    init.headers = headers;
  }
  
  return fetch(input, init);
}
