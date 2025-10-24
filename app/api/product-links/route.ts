/**
 * Product Links API Endpoint
 * Location: /app/api/product-links/route.ts
 * Purpose: Manages links between Shopify and TikTok Shop products.
 * GET fetches links, POST creates new link, PUT updates sync settings.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/product-links
 * Fetches all product links for the authenticated user
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

    const rateLimitResult = checkRateLimit(`product-links-get-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 30,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { data: productLinks, error } = await supabase
      .from('product_links')
      .select(`
        *,
        shopify_product:products(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching product links:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product links' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product_links: productLinks })
  } catch (error) {
    console.error('Product links GET API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/product-links
 * Creates a new product link
 * Body: { shopify_product_id, tiktok_product_id, tiktok_product_title?, sync_price?, sync_inventory? }
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

    const rateLimitResult = checkRateLimit(`product-links-post-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 10,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      shopify_product_id,
      tiktok_product_id,
      tiktok_product_title,
      sync_price = true,
      sync_inventory = true,
    } = body

    // Validation
    if (!shopify_product_id || !tiktok_product_id) {
      return NextResponse.json(
        { error: 'shopify_product_id and tiktok_product_id are required' },
        { status: 400 }
      )
    }

    // Verify product ownership
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', shopify_product_id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if link already exists
    const { data: existing } = await supabase
      .from('product_links')
      .select('id')
      .eq('shopify_product_id', shopify_product_id)
      .eq('tiktok_product_id', tiktok_product_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Product link already exists' },
        { status: 409 }
      )
    }

    // Create product link
    const { data: productLink, error } = await supabase
      .from('product_links')
      .insert({
        user_id: user.id,
        shopify_product_id,
        tiktok_product_id: tiktok_product_id.trim(),
        tiktok_product_title: tiktok_product_title || null,
        sync_status: 'pending',
        sync_price,
        sync_inventory,
      })
      .select(`
        *,
        shopify_product:products(*)
      `)
      .single()

    if (error) {
      console.error('Error creating product link:', error)
      return NextResponse.json(
        { error: 'Failed to create product link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product_link: productLink }, { status: 201 })
  } catch (error) {
    console.error('Product links POST API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

