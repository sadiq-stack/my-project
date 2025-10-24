/**
 * Health Check API Endpoint
 * Location: /app/api/health/route.ts
 * Purpose: Health check endpoint for monitoring and uptime checks.
 * Returns application status and database connectivity.
 * 
 * @route GET /api/health
 * @returns {Object} Health status information
 * @access Public
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown' as 'healthy' | 'unhealthy' | 'unknown',
    },
  }

  try {
    // Check database connectivity
    const supabase = await createClient()
    const { error } = await supabase
      .from('carriers')
      .select('count')
      .limit(1)
      .single()

    health.checks.database = error ? 'unhealthy' : 'healthy'

    if (error) {
      logger.warn('Database health check failed', { error: error.message })
      health.status = 'degraded'
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        ...health,
        responseTime: `${responseTime}ms`,
      },
      {
        status: health.status === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : undefined)
    
    return NextResponse.json(
      {
        ...health,
        status: 'unhealthy',
        checks: {
          database: 'unhealthy',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

