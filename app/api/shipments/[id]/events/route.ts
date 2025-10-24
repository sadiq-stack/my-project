/**
 * Tracking Events API Endpoint
 * Location: /app/api/shipments/[id]/events/route.ts
 * Purpose: Handles tracking events for a specific shipment. POST creates new
 * tracking event. Includes authentication, authorization, and error handling.
 * Used to add manual tracking updates to shipments.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/shipments/[id]/events
 * Creates a new tracking event for a shipment
 * Body: { status, location?, description, event_time }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(`events-post-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 15,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Verify shipment ownership
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { status, location, description, event_time } = body

    // Validation
    if (!status || !description || !event_time) {
      return NextResponse.json(
        { error: 'status, description, and event_time are required' },
        { status: 400 }
      )
    }

    // Create tracking event
    const { data: event, error } = await supabase
      .from('tracking_events')
      .insert({
        shipment_id: params.id,
        status,
        location: location || null,
        description,
        event_time,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tracking event:', error)
      return NextResponse.json(
        { error: 'Failed to create tracking event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Tracking events POST API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

