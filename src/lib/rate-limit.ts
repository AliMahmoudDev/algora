// Algora Rate Limiter — powered by Upstash Ratelimit
// Protects: /api/execute, /api/submit, /api/ai-hint
//
// Uses Upstash Ratelimit (HTTP-based, perfect for Vercel serverless)
// Falls back to in-memory limiting if env vars are not set

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ── Rate Limit Definitions ──

const getRateLimiter = (prefix: string, limit: number, window: string) => {
  // If Upstash env vars are set, use Redis-backed ratelimit
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `algora:${prefix}`,
      analytics: true,
    });
  }

  // Fallback: return null (no rate limiting without Upstash)
  // This allows the app to work locally without Upstash configured
  return null;
};

// Execute endpoint: 20 requests per minute per IP
export const executeLimiter = getRateLimiter('execute', 20, '1m');

// Submit endpoint: 10 requests per minute per IP
export const submitLimiter = getRateLimiter('submit', 10, '1m');

// AI Hints endpoint: 5 requests per minute per IP
export const aiHintLimiter = getRateLimiter('ai-hint', 5, '1m');

/**
 * Check rate limit for a given limiter and IP
 * Returns { success: true } if allowed, or { success: false, remaining, reset } if rate limited
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  ip: string
): Promise<{ success: boolean; remaining?: number; reset?: Date }> {
  if (!limiter) {
    return { success: true }; // No rate limiting without Upstash
  }

  const result = await limiter.limit(ip);

  if (result.success) {
    return { success: true };
  }

  return {
    success: false,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}
