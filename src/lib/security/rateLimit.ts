/**
 * Client-side rate limiting utility to prevent spam and abuse
 * Implements token bucket algorithm with localStorage persistence
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 3,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000, // 5 minutes
};

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the action (e.g., 'suggest-location-form')
 * @param config - Optional rate limit configuration
 * @returns Object with isAllowed flag and remaining attempts
 */
export const checkRateLimit = (
  key: string,
  config: Partial<RateLimitConfig> = {}
): { isAllowed: boolean; remainingAttempts: number; blockedUntil?: number } => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `rateLimit_${key}`;
  const now = Date.now();

  try {
    // Get current state from localStorage
    const storedState = localStorage.getItem(storageKey);
    let state: RateLimitState = storedState
      ? JSON.parse(storedState)
      : { attempts: 0, firstAttemptTime: now };

    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return {
        isAllowed: false,
        remainingAttempts: 0,
        blockedUntil: state.blockedUntil,
      };
    }

    // Reset if window has passed
    if (now - state.firstAttemptTime > fullConfig.windowMs) {
      state = { attempts: 0, firstAttemptTime: now };
    }

    // Check if limit exceeded
    if (state.attempts >= fullConfig.maxAttempts) {
      state.blockedUntil = now + fullConfig.blockDurationMs;
      localStorage.setItem(storageKey, JSON.stringify(state));
      return {
        isAllowed: false,
        remainingAttempts: 0,
        blockedUntil: state.blockedUntil,
      };
    }

    return {
      isAllowed: true,
      remainingAttempts: fullConfig.maxAttempts - state.attempts,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow the action if localStorage fails
    return { isAllowed: true, remainingAttempts: fullConfig.maxAttempts };
  }
};

/**
 * Record an attempt for rate limiting
 * @param key - Unique identifier for the action
 */
export const recordAttempt = (key: string): void => {
  const storageKey = `rateLimit_${key}`;
  const now = Date.now();

  try {
    const storedState = localStorage.getItem(storageKey);
    let state: RateLimitState = storedState
      ? JSON.parse(storedState)
      : { attempts: 0, firstAttemptTime: now };

    // Reset if window has passed
    if (now - state.firstAttemptTime > DEFAULT_CONFIG.windowMs) {
      state = { attempts: 1, firstAttemptTime: now };
    } else {
      state.attempts += 1;
    }

    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Rate limit record error:', error);
  }
};

/**
 * Reset rate limit for a specific key
 * @param key - Unique identifier for the action
 */
export const resetRateLimit = (key: string): void => {
  const storageKey = `rateLimit_${key}`;
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
};

/**
 * Format remaining time until unblock
 * @param blockedUntil - Timestamp when block expires
 * @returns Human-readable time string
 */
export const formatBlockedTime = (blockedUntil: number): string => {
  const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
  if (remaining <= 0) return '0 secondes';
  
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} seconde${seconds !== 1 ? 's' : ''}`;
  }
  return `${seconds} seconde${seconds !== 1 ? 's' : ''}`;
};
