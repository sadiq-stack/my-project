/**
 * Single Shipment API Endpoint
 * Location: /app/api/shipments/[id]/route.ts
 * Purpose: Handles operations for a specific shipment by ID with comprehensive
 * validation, authorization, and error handling.
 * 
 * @route GET /api/shipments/[id] - Get shipment details
 * @route PUT /api/shipments/[id] - Update shipment
 * @route DELETE /api/shipments/[id] - Delete shipment
 * @access Private (requires authentication + ownership)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/utils/logger'
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  rateLimitResponse,
  validationErrorResponse,
  noContentResponse,
} from '@/lib/utils/api-response'
import {
  handleSupabaseError,
  handleUnknownError,
} from '@/lib/utils/error-handler'
import {
  validateRequest,
  isValidUUID,
  isValidShipmentStatus,
  sanitizeString,
} from '@/lib/utils/validation'
import { RATE_LIMITS, VALIDATION_LIMITS, SHIPMENT_STATUSES } from '@/lib/config/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/shipments/[id]
 * Fetches a specific shipment with tracking events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    logger.apiRequest('GET', `/api/shipments/${params.id}`)

    // Validate shipment ID format
    if (!isValidUUID(params.id)) {
      return validationErrorResponse({ id: 'Invalid shipment ID format' })
    }

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`shipment-get-${user.id}`, RATE_LIMITS.SHIPMENTS_READ)

    if (!rateLimitResult.success) {
      return rateLimitResponse()
    }

    // Fetch shipment with carrier and tracking events
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select(`
        *,
        carrier:carriers(*),
        tracking_events(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      logger.error('Failed to fetch shipment', error, { shipmentId: params.id, userId: user.id })
      return handleSupabaseError(error, 'fetch shipment')
    }

    if (!shipment) {
      logger.warn('Shipment not found or unauthorized access', { shipmentId: params.id, userId: user.id })
      return notFoundResponse('Shipment')
    }

    logger.apiResponse('GET', `/api/shipments/${params.id}`, 200, Date.now() - startTime)

    return successResponse({ shipment })
  } catch (error) {
    logger.error('Shipment GET API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('GET', `/api/shipments/${params.id}`, 500, Date.now() - startTime)
    return handleUnknownError(error, 'shipment GET endpoint')
  }
}

/**
 * PUT /api/shipments/[id]
 * Updates a specific shipment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    logger.apiRequest('PUT', `/api/shipments/${params.id}`)

    // Validate shipment ID format
    if (!isValidUUID(params.id)) {
      return validationErrorResponse({ id: 'Invalid shipment ID format' })
    }

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`shipment-put-${user.id}`, RATE_LIMITS.SHIPMENTS_WRITE)

    if (!rateLimitResult.success) {
      return rateLimitResponse()
    }

    // Parse request body
    const body = await request.json()
    
    const validation = validateRequest(body, [
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
      {
        field: 'status',
        required: false,
        type: 'string',
        custom: (value) => !value || isValidShipmentStatus(value),
        customError: `Invalid status. Must be one of: ${SHIPMENT_STATUSES.join(', ')}`,
      },
    ])

    if (!validation.isValid) {
      return validationErrorResponse(validation.errors)
    }

    const { title, description, origin, destination, status } = body

    // Build update object
    const updateData: any = {}
    if (title !== undefined) updateData.title = title ? sanitizeString(title.trim()) : null
    if (description !== undefined) updateData.description = description ? sanitizeString(description.trim()) : null
    if (origin !== undefined) updateData.origin = origin ? sanitizeString(origin.trim()) : null
    if (destination !== undefined) updateData.destination = destination ? sanitizeString(destination.trim()) : null
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      return validationErrorResponse({ _: 'No fields to update' })
    }

    // Update shipment
    const { data: shipment, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select(`
        *,
        carrier:carriers(*)
      `)
      .maybeSingle()

    if (error) {
      logger.error('Failed to update shipment', error, { shipmentId: params.id, userId: user.id })
      return handleSupabaseError(error, 'update shipment')
    }

    if (!shipment) {
      return notFoundResponse('Shipment')
    }

    logger.info('Shipment updated successfully', { shipmentId: params.id, userId: user.id })
    logger.apiResponse('PUT', `/api/shipments/${params.id}`, 200, Date.now() - startTime)

    return successResponse({ shipment }, 'Shipment updated successfully')
  } catch (error) {
    logger.error('Shipment PUT API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('PUT', `/api/shipments/${params.id}`, 500, Date.now() - startTime)
    return handleUnknownError(error, 'shipment PUT endpoint')
  }
}

/**
 * DELETE /api/shipments/[id]
 * Deletes a specific shipment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()

  try {
    logger.apiRequest('DELETE', `/api/shipments/${params.id}`)

    // Validate shipment ID format
    if (!isValidUUID(params.id)) {
      return validationErrorResponse({ id: 'Invalid shipment ID format' })
    }

    const supabase = await createClient()

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return unauthorizedResponse()
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`shipment-delete-${user.id}`, RATE_LIMITS.SHIPMENTS_WRITE)

    if (!rateLimitResult.success) {
      return rateLimitResponse()
    }

    // Delete shipment (tracking events will be cascade deleted)
    const { data, error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      logger.error('Failed to delete shipment', error, { shipmentId: params.id, userId: user.id })
      return handleSupabaseError(error, 'delete shipment')
    }

    if (!data) {
      return notFoundResponse('Shipment')
    }

    logger.info('Shipment deleted successfully', { shipmentId: params.id, userId: user.id })
    logger.apiResponse('DELETE', `/api/shipments/${params.id}`, 204, Date.now() - startTime)

    return noContentResponse()
  } catch (error) {
    logger.error('Shipment DELETE API exception', error instanceof Error ? error : undefined)
    logger.apiResponse('DELETE', `/api/shipments/${params.id}`, 500, Date.now() - startTime)
    return handleUnknownError(error, 'shipment DELETE endpoint')
  }
}
