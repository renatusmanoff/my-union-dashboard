// Simple in-memory cache for API responses
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Generate cache key from URL and options
  generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }
}

export const cache = new Cache();

// Cached fetch wrapper
export async function cachedFetch(url: string, options?: RequestInit, ttl?: number): Promise<Response> {
  const cacheKey = cache.generateKey(url, options);
  
  // For GET requests, try to get from cache first
  if (!options?.method || options.method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Make the actual request
  const response = await fetch(url, options);
  
  // Cache successful GET responses
  if (response.ok && (!options?.method || options.method === 'GET')) {
    const data = await response.clone().json();
    cache.set(cacheKey, data, ttl);
  }

  return response;
}
