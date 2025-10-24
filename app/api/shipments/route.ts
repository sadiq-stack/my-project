/**
 * Shipments API Endpoint
 * Location: /app/api/shipments/route.ts
 * Purpose: Handles CRUD operations for shipments with comprehensive validation,
 * error handling, and logging. Optimized for Vercel deployment with proper caching.
 * 
 * @route GET /api/shipments - List user's shipments
 * @route POST /api/shipments - Create new shipment
 * @access Private (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  rateLimitResponse,
  conflictResponse,
  validationErrorResponse,
} from '@/lib/utils/api-response'
import {
  handleSupabaseError,
  handleUnknownError,
} from '@/lib/utils/error-handler'
import {
  validateRequest,
  isValidUUID,
  isValidTrackingNumber,
  isValidShipmentStatus,
  sanitizeString,
} from '@/lib/utils/validation'
import { RATE_LIMITS, VALIDATION_LIMITS, SHIPMENT_STATUSES } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/shipments
 * Fetches all shipments for the authenticated user
 * @query status - Optional status filter
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', '/api/shipments')

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized shipments access attempt')
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`shipments-get-${user.id}`, RATE_LIMITS.SHIPMENTS_READ)

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for shipments GET', { userId: user.id })
      return rateLimitResponse()
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    // Validate status filter
    if (statusFilter && !isValidShipmentStatus(statusFilter)) {
      return validationErrorResponse({
        status: `Invalid status. Must be one of: ${SHIPMENT_STATUSES.join(', ')}`,
      })
    }

    // Build query
    let query = supabase
      .from('shipments')
      .select(`
        *,
        carrier:carriers(*)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Apply status filter if provided
    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: shipments, error, count } = await query

    if (error) {
      logger.error('Failed to fetch shipments', error, { userId: user.id })
      return handleSupabaseError(error, 'fetch shipments')
    }

    logger.apiResponse('GET', '/api/shipments', 200, Date.now() - startTime)

    return successResponse(
      { shipments },
      undefined,
      {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    )
  } catch (error) {
    logger.error('Shipments GET API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('GET', '/api/shipments', 500, Date.now() - startTime)
    return handleUnknownError(error, 'shipments GET endpoint')
  }
}

/**
 * POST /api/shipments
 * Creates a new shipment for the authenticated user
 * @body carrier_id - Carrier UUID (required)
 * @body tracking_number - Tracking number (required, 6-50 chars)
 * @body title - Shipment title (optional, max 200 chars)
 * @body description - Description (optional, max 2000 chars)
 * @body origin - Origin location (optional, max 200 chars)
 * @body destination - Destination location (optional, max 200 chars)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.apiRequest('POST', '/api/shipments')

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized shipment creation attempt')
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`shipments-post-${user.id}`, RATE_LIMITS.SHIPMENTS_WRITE)

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded for shipments POST', { userId: user.id })
      return rateLimitResponse()
    }

    // Parse and validate request body
    const body = await request.json()
    
    const validation = validateRequest(body, [
      { field: 'carrier_id', required: true, type: 'uuid' },
      { 
        field: 'tracking_number', 
        required: true, 
        type: 'string', 
        minLength: VALIDATION_LIMITS.TRACKING_NUMBER.min,
        maxLength: VALIDATION_LIMITS.TRACKING_NUMBER.max,
        custom: (value) => isValidTrackingNumber(value),
        customError: 'Tracking number must be 6-50 alphanumeric characters',
      },
      { 
        field: 'title', 
        required: false, 
        type: 'string',
        maxLength: VALIDATION_LIMITS.TITLE.max,
      },
      { 
        field: 'description', 
        required: false, 
        type: 'string',
        maxLength: VALIDATION_LIMITS.DESCRIPTION.max,
      },
      { 
        field: 'origin', 
        required: false, 
        type: 'string',
        maxLength: VALIDATION_LIMITS.LOCATION.max,
      },
      { 
        field: 'destination', 
        required: false, 
        type: 'string',
        maxLength: VALIDATION_LIMITS.LOCATION.max,
      },
    ])

    if (!validation.isValid) {
      logger.warn('Shipment creation validation failed', { errors: validation.errors, userId: user.id })
      return validationErrorResponse(validation.errors)
    }

    const {
      carrier_id,
      tracking_number,
      title,
      description,
      origin,
      destination,
    } = body

    // Verify carrier exists
    const { data: carrier, error: carrierError } = await supabase
      .from('carriers')
      .select('id')
      .eq('id', carrier_id)
      .eq('is_active', true)
      .single()

    if (carrierError || !carrier) {
      logger.warn('Invalid carrier for shipment', { carrierId: carrier_id, userId: user.id })
      return validationErrorResponse({
        carrier_id: 'Invalid or inactive carrier',
      })
    }

    // Check if shipment already exists for this user
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', user.id)
      .eq('tracking_number', tracking_number.trim())
      .eq('carrier_id', carrier_id)
      .maybeSingle()

    if (existingShipment) {
      logger.warn('Duplicate shipment creation attempt', { 
        trackingNumber: tracking_number, 
        userId: user.id 
      })
      return conflictResponse('Shipment with this tracking number already exists')
    }

    // Create shipment
    const { data: shipment, error } = await supabase
      .from('shipments')
      .insert({
        user_id: user.id,
        carrier_id,
        tracking_number: sanitizeString(tracking_number.trim()),
        title: title ? sanitizeString(title.trim()) : null,
        description: description ? sanitizeString(description.trim()) : null,
        origin: origin ? sanitizeString(origin.trim()) : null,
        destination: destination ? sanitizeString(destination.trim()) : null,
        status: 'pending',
      })
      .select(`
        *,
        carrier:carriers(*)
      `)
      .single()

    if (error) {
      logger.error('Failed to create shipment', error, { userId: user.id })
      return handleSupabaseError(error, 'create shipment')
    }

    logger.info('Shipment created successfully', { 
      shipmentId: shipment.id, 
      userId: user.id 
    })
    logger.apiResponse('POST', '/api/shipments', 201, Date.now() - startTime)

    return createdResponse({ shipment }, 'Shipment created successfully')
  } catch (error) {
    logger.error('Shipments POST API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('POST', '/api/shipments', 500, Date.now() - startTime)
    return handleUnknownError(error, 'shipments POST endpoint')
  }
}
