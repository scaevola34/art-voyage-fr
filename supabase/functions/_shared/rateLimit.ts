/**
 * Server-side rate limiting utility for Supabase Edge Functions
 * Uses the rate_limits table to track and enforce rate limits
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: Date;
  retryAfter?: number; // seconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000, // 5 minutes
};

/**
 * Check and enforce rate limiting for a specific identifier and action
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param action - Action being rate limited (e.g., 'suggest-location', 'contact-form')
 * @param config - Optional rate limit configuration
 * @returns Rate limit result with allowed status
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date();

  try {
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      // Fail open - allow the request if we can't check rate limits
      return {
        allowed: true,
        remainingAttempts: fullConfig.maxAttempts,
      };
    }

    // Check if currently blocked
    if (existing?.blocked_until) {
      const blockedUntil = new Date(existing.blocked_until);
      if (now < blockedUntil) {
        const retryAfter = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
        return {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil,
          retryAfter,
        };
      }
    }

    // Check if window has passed
    const windowStart = existing ? new Date(existing.window_start) : now;
    const windowExpired = (now.getTime() - windowStart.getTime()) > fullConfig.windowMs;

    if (!existing || windowExpired) {
      // Create new or reset window
      const { error: upsertError } = await supabase
        .from('rate_limits')
        .upsert({
          identifier,
          action,
          attempts: 1,
          window_start: now.toISOString(),
          blocked_until: null,
        }, {
          onConflict: 'identifier,action',
        });

      if (upsertError) {
        console.error('Rate limit upsert error:', upsertError);
      }

      return {
        allowed: true,
        remainingAttempts: fullConfig.maxAttempts - 1,
      };
    }

    // Check if limit exceeded
    const newAttempts = existing.attempts + 1;
    
    if (newAttempts > fullConfig.maxAttempts) {
      const blockedUntil = new Date(now.getTime() + fullConfig.blockDurationMs);
      
      // Update with block
      await supabase
        .from('rate_limits')
        .update({
          attempts: newAttempts,
          blocked_until: blockedUntil.toISOString(),
        })
        .eq('identifier', identifier)
        .eq('action', action);

      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
        retryAfter: Math.ceil(fullConfig.blockDurationMs / 1000),
      };
    }

    // Increment attempts
    await supabase
      .from('rate_limits')
      .update({
        attempts: newAttempts,
      })
      .eq('identifier', identifier)
      .eq('action', action);

    return {
      allowed: true,
      remainingAttempts: fullConfig.maxAttempts - newAttempts,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow the request if something goes wrong
    return {
      allowed: true,
      remainingAttempts: fullConfig.maxAttempts,
    };
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 * @param req - Request object
 * @returns Identifier string
 */
export function getClientIdentifier(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';
}

/**
 * Create rate limit response
 * @param result - Rate limit result
 * @param corsHeaders - CORS headers to include
 * @returns Response object
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': String(DEFAULT_CONFIG.maxAttempts),
    'X-RateLimit-Remaining': String(result.remainingAttempts),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: result.blockedUntil
        ? `Too many requests. Try again in ${result.retryAfter} seconds.`
        : 'Too many requests. Please try again later.',
      blockedUntil: result.blockedUntil?.toISOString(),
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers,
    }
  );
}
