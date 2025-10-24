/**
 * Product Integration Type Definitions
 * Location: /types/products.ts
 * Purpose: TypeScript types for Shopify and TikTok Shop product integration
 */

export interface Integration {
  id: string
  user_id: string
  platform: 'shopify' | 'tiktok_shop'
  shop_url: string
  access_token: string
  is_active: boolean
  last_sync_at?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  integration_id: string
  external_id: string
  title: string
  description?: string
  price?: number
  currency: string
  image_url?: string
  sku?: string
  inventory_quantity?: number
  product_url?: string
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
  integration?: Integration
}

export interface ProductLink {
  id: string
  user_id: string
  shopify_product_id: string
  tiktok_product_id: string
  tiktok_product_title?: string
  sync_status: 'pending' | 'synced' | 'error' | 'disabled'
  sync_price: boolean
  sync_inventory: boolean
  last_synced_at?: string
  error_message?: string
  created_at: string
  updated_at: string
  shopify_product?: Product
}

export interface SyncLog {
  id: string
  user_id: string
  product_link_id?: string
  sync_type: 'price' | 'inventory' | 'full'
  status: 'success' | 'error'
  details?: any
  error_message?: string
  created_at: string
}

export interface ShopifyProduct {
  id: string
  title: string
  body_html?: string
  vendor?: string
  product_type?: string
  handle?: string
  status: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
}

export interface ShopifyVariant {
  id: string
  product_id: string
  title: string
  price: string
  sku?: string
  inventory_quantity: number
  image_id?: string
}

export interface ShopifyImage {
  id: string
  product_id: string
  src: string
  alt?: string
}

export interface TikTokProduct {
  product_id: string
  product_name: string
  description?: string
  price: string
  stock_quantity: number
  images: string[]
  sku?: string
}

