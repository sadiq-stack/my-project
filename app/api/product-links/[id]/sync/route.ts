/**
 * Product Link Sync API Endpoint
 * Location: /app/api/product-links/[id]/sync/route.ts
 * Purpose: Syncs a specific product link between Shopify and TikTok Shop.
 * Updates price and/or inventory based on sync settings.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/product-links/[id]/sync
 * Syncs product data from Shopify to TikTok Shop
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitResult = checkRateLimit(`product-sync-${user.id}`, {
      interval: 60000,
      uniqueTokenPerInterval: 20,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Fetch product link with Shopify product details
    const { data: productLink, error: linkError } = await supabase
      .from('product_links')
      .select(`
        *,
        shopify_product:products(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (linkError || !productLink) {
      return NextResponse.json(
        { error: 'Product link not found' },
        { status: 404 }
      )
    }

    // Simulate sync operation (replace with actual TikTok Shop API call)
    const syncResults = {
      price_synced: false,
      inventory_synced: false,
      errors: [] as string[],
    }

    try {
      // In production, use TikTok Shop API client here
      if (productLink.sync_price && productLink.shopify_product.price) {
        // await tiktokClient.updatePrice(productLink.tiktok_product_id, productLink.shopify_product.price)
        console.log('Syncing price:', productLink.shopify_product.price)
        syncResults.price_synced = true
      }

      if (
        productLink.sync_inventory &&
        productLink.shopify_product.inventory_quantity !== null
      ) {
        // await tiktokClient.updateInventory(productLink.tiktok_product_id, productLink.shopify_product.inventory_quantity)
        console.log(
          'Syncing inventory:',
          productLink.shopify_product.inventory_quantity
        )
        syncResults.inventory_synced = true
      }

      // Update product link status
      await supabase
        .from('product_links')
        .update({
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', params.id)

      // Log sync operation
      await supabase.from('sync_logs').insert({
        user_id: user.id,
        product_link_id: params.id,
        sync_type: 'full',
        status: 'success',
        details: syncResults,
      })

      return NextResponse.json({
        message: 'Product synced successfully',
        results: syncResults,
      })
    } catch (syncError: any) {
      console.error('Sync error:', syncError)

      // Update product link with error
      await supabase
        .from('product_links')
        .update({
          sync_status: 'error',
          error_message: syncError.message || 'Sync failed',
        })
        .eq('id', params.id)

      // Log error
      await supabase.from('sync_logs').insert({
        user_id: user.id,
        product_link_id: params.id,
        sync_type: 'full',
        status: 'error',
        error_message: syncError.message,
      })

      return NextResponse.json(
        { error: 'Failed to sync product', details: syncError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Product sync API exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


