/**
 * API Rate Limiter Utility
 * Location: /lib/rate-limit.ts
 * Purpose: Implements rate limiting for API endpoints to prevent abuse.
 * Uses in-memory storage for simple rate limiting. For production at scale,
 * consider using Redis or similar. Protects endpoints from excessive requests.
 */

const rateLimit = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  interval: number // milliseconds
  uniqueTokenPerInterval: number // max requests per interval
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 10 }
): { success: boolean; remaining: number } {
  const now = Date.now()
  const tokenData = rateLimit.get(identifier)

  if (!tokenData || now > tokenData.resetTime) {
    // Reset or create new token
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })
    return { success: true, remaining: config.uniqueTokenPerInterval - 1 }
  }

  if (tokenData.count >= config.uniqueTokenPerInterval) {
    return { success: false, remaining: 0 }
  }

  tokenData.count++
  return {
    success: true,
    remaining: config.uniqueTokenPerInterval - tokenData.count,
  }
}

// Cleanup old entries periodically (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) {
        rateLimit.delete(key)
      }
    }
  }, 600000)
}

