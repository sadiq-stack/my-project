/**
 * Products API Endpoint
 * Location: /app/api/products/route.ts
 * Purpose: Manages synced products from integrations. GET fetches products,
 * supports filtering by integration and search.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/products
 * Fetches all products for the authenticated user
 * Query params: integration_id (optional), search (optional)
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

    const rateLimitResult = checkRateLimit(`products-get-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 50,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integration_id')
    const searchQuery = searchParams.get('search')

    let query = supabase
      .from('products')
      .select(`
        *,
        integration:integrations(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (integrationId) {
      query = query.eq('integration_id', integrationId)
    }

    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`
      )
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products GET API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

