/**
 * Carriers API Endpoint
 * Location: /app/api/carriers/route.ts
 * Purpose: Returns list of available carriers from the database.
 * Includes error handling, logging, and caching headers for optimal performance.
 * 
 * @route GET /api/carriers
 * @returns {Carrier[]} List of active carriers
 * @access Public
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { successResponse, internalErrorResponse } from '@/lib/utils/api-response'
import { handleSupabaseError, handleUnknownError } from '@/lib/utils/error-handler'
import { CACHE_TTL } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/carriers
 * Fetches all active carriers with caching
 */
export async function GET() {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/carriers')

    const supabase = await createClient()

    // Fetch all active carriers
    const { data: carriers, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      logger.error('Failed to fetch carriers', error)
      return handleSupabaseError(error, 'fetch carriers')
    }

    logger.apiResponse('GET', '/api/carriers', 200, Date.now() - startTime)

    return successResponse(
      { carriers },
      undefined,
      undefined,
      200
    ).then(response => {
      // Add caching headers
      response.headers.set(
        'Cache-Control',
        `public, s-maxage=${CACHE_TTL.CARRIERS}, stale-while-revalidate=${CACHE_TTL.CARRIERS * 2}`
      )
      return response
    })
  } catch (error) {
    logger.error('Carriers API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('GET', '/api/carriers', 500, Date.now() - startTime)
    return handleUnknownError(error, 'carriers endpoint')
  }
}
