export const USE_LIVE_API = true;

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (USE_LIVE_API) {
    const hasBody = options.body !== undefined;
    const response = await fetch(path, {
      credentials: 'include',
      ...options,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data as T;
  }
  
  throw new Error('Using local mock data - live API calls are disabled.');
}
