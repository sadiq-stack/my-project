/**
 * Dashboard Stats API Endpoint
 * Location: /app/api/dashboard/stats/route.ts
 * Purpose: Provides aggregated statistics for the dashboard with caching.
 * Returns counts of shipments by status for performance optimization.
 * 
 * @route GET /api/dashboard/stats
 * @returns {Object} Dashboard statistics
 * @access Private
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import {
  successResponse,
  unauthorizedResponse,
  rateLimitResponse,
} from '@/lib/utils/api-response'
import {
  handleSupabaseError,
  handleUnknownError,
} from '@/lib/utils/error-handler'
import { RATE_LIMITS, CACHE_TTL } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats
 * Fetches aggregated statistics for user's dashboard
 */
export async function GET() {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/dashboard/stats')

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized dashboard stats access attempt')
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(
      `dashboard-stats-${user.id}`,
      RATE_LIMITS.DEFAULT
    )

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for dashboard stats', { userId: user.id })
      return rateLimitResponse()
    }

    // Fetch all shipments for user (only status field for efficiency)
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('status')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch shipments for stats', error, { userId: user.id })
      return handleSupabaseError(error, 'fetch dashboard statistics')
    }

    // Calculate stats efficiently
    const stats = {
      total_shipments: shipments?.length || 0,
      in_transit: shipments?.filter((s) => s.status === 'in_transit').length || 0,
      out_for_delivery: shipments?.filter((s) => s.status === 'out_for_delivery').length || 0,
      delivered: shipments?.filter((s) => s.status === 'delivered').length || 0,
      pending: shipments?.filter((s) => s.status === 'pending').length || 0,
      failed: shipments?.filter((s) => s.status === 'failed').length || 0,
      cancelled: shipments?.filter((s) => s.status === 'cancelled').length || 0,
    }

    logger.apiResponse('GET', '/api/dashboard/stats', 200, Date.now() - startTime)

    return successResponse({ stats }).then(response => {
      // Add caching headers for better performance
      response.headers.set(
        'Cache-Control',
        `private, max-age=${CACHE_TTL.DASHBOARD_STATS}`
      )
      return response
    })
  } catch (error) {
    logger.error('Dashboard stats API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('GET', '/api/dashboard/stats', 500, Date.now() - startTime)
    return handleUnknownError(error, 'dashboard stats endpoint')
  }
}
