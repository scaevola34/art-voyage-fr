/**
 * Client-side helper for working with server-side rate limiting
 * Provides utilities to handle rate limit responses and display appropriate messages
 */

export interface RateLimitError {
  error: string;
  message: string;
  blockedUntil?: string;
  retryAfter?: number;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: any): error is RateLimitError {
  return error?.error === 'Rate limit exceeded' && typeof error?.retryAfter === 'number';
}

/**
 * Format retry time from seconds to human-readable string
 */
export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconde${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} seconde${remainingSeconds !== 1 ? 's' : ''}`;
}

/**
 * Get rate limit info from response headers
 */
export function getRateLimitInfo(response: Response): {
  limit?: number;
  remaining?: number;
  retryAfter?: number;
} {
  return {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0') || undefined,
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0') || undefined,
    retryAfter: parseInt(response.headers.get('Retry-After') || '0') || undefined,
  };
}

/**
 * Handle rate limit error and return user-friendly message
 */
export function handleRateLimitError(error: RateLimitError): string {
  if (error.retryAfter) {
    return `Trop de tentatives. Veuillez attendre ${formatRetryTime(error.retryAfter)} avant de réessayer.`;
  }
  return 'Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.';
}
