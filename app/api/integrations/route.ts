/**
 * Integrations API Endpoint
 * Location: /app/api/integrations/route.ts
 * Purpose: Manages platform integrations (Shopify, TikTok Shop).
 * GET fetches user's integrations, POST creates new integration.
 * Includes authentication, validation, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { ShopifyClient } from '@/lib/shopify/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/integrations
 * Fetches all integrations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitResult = checkRateLimit(`integrations-get-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 30,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching integrations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      )
    }

    // Remove sensitive data before sending
    const sanitizedIntegrations = integrations.map((integration) => ({
      ...integration,
      access_token: '****',
    }))

    return NextResponse.json({ integrations: sanitizedIntegrations })
  } catch (error) {
    console.error('Integrations GET API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/integrations
 * Creates a new integration
 * Body: { platform, shop_url, access_token }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitResult = checkRateLimit(`integrations-post-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 5,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { platform, shop_url, access_token } = body

    // Validation
    if (!platform || !shop_url || !access_token) {
      return NextResponse.json(
        { error: 'platform, shop_url, and access_token are required' },
        { status: 400 }
      )
    }

    if (!['shopify', 'tiktok_shop'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be shopify or tiktok_shop' },
        { status: 400 }
      )
    }

    // Verify connection based on platform
    let connectionValid = false
    if (platform === 'shopify') {
      const shopifyClient = new ShopifyClient({
        shopUrl: shop_url,
        accessToken: access_token,
      })
      connectionValid = await shopifyClient.verifyConnection()
    }
    // Add TikTok Shop verification when available

    if (!connectionValid) {
      return NextResponse.json(
        { error: 'Failed to verify connection. Check your credentials.' },
        { status: 400 }
      )
    }

    // Check if integration already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('shop_url', shop_url)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Integration already exists' },
        { status: 409 }
      )
    }

    // Create integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        user_id: user.id,
        platform,
        shop_url: shop_url.trim(),
        access_token,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating integration:', error)
      return NextResponse.json(
        { error: 'Failed to create integration' },
        { status: 500 }
      )
    }

    // Sanitize response
    return NextResponse.json(
      {
        integration: {
          ...integration,
          access_token: '****',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Integrations POST API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

