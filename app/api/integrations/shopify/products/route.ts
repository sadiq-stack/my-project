/**
 * Shopify Products API Endpoint
 * Location: /app/api/integrations/shopify/products/route.ts
 * Purpose: Syncs products from Shopify to local database. Fetches products
 * from Shopify store and stores them for linking to TikTok Shop.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { ShopifyClient } from '@/lib/shopify/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/integrations/shopify/products
 * Syncs products from Shopify store to database
 * Body: { integration_id }
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

    const rateLimitResult = checkRateLimit(
      `shopify-sync-${user.id}`,
      {
        interval: 300000, // 5 minutes
        uniqueTokenPerInterval: 3,
      }
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many sync requests. Please wait a few minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { integration_id } = body

    if (!integration_id) {
      return NextResponse.json(
        { error: 'integration_id is required' },
        { status: 400 }
      )
    }

    // Fetch integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .eq('platform', 'shopify')
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Create Shopify client
    const shopifyClient = new ShopifyClient({
      shopUrl: integration.shop_url,
      accessToken: integration.access_token,
    })

    // Fetch products from Shopify
    const shopifyProducts = await shopifyClient.getProducts(250)

    if (!shopifyProducts || shopifyProducts.length === 0) {
      return NextResponse.json({
        message: 'No products found in Shopify store',
        synced: 0,
      })
    }

    // Sync products to database
    let syncedCount = 0
    const errors: string[] = []

    for (const shopifyProduct of shopifyProducts) {
      try {
        const variant = shopifyProduct.variants?.[0]
        const image = shopifyProduct.images?.[0]

        // Upsert product
        const { error: upsertError } = await supabase
          .from('products')
          .upsert(
            {
              user_id: user.id,
              integration_id: integration.id,
              external_id: shopifyProduct.id.toString(),
              title: shopifyProduct.title,
              description: shopifyProduct.body_html || null,
              price: variant ? parseFloat(variant.price) : null,
              currency: 'USD',
              image_url: image?.src || null,
              sku: variant?.sku || null,
              inventory_quantity: variant?.inventory_quantity || 0,
              product_url: `https://${integration.shop_url}/products/${shopifyProduct.handle}`,
              status: shopifyProduct.status === 'active' ? 'active' : 'draft',
            },
            {
              onConflict: 'integration_id,external_id',
            }
          )

        if (upsertError) {
          errors.push(`Product ${shopifyProduct.title}: ${upsertError.message}`)
        } else {
          syncedCount++
        }
      } catch (err) {
        console.error('Error syncing product:', err)
        errors.push(`Product ${shopifyProduct.title}: ${err}`)
      }
    }

    // Update integration last sync time
    await supabase
      .from('integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', integration.id)

    return NextResponse.json({
      message: 'Products synced successfully',
      synced: syncedCount,
      total: shopifyProducts.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Shopify products sync API exception:', error)
    return NextResponse.json(
      { error: 'Failed to sync products from Shopify' },
      { status: 500 }
    )
  }
}

