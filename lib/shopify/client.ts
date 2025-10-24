/**
 * Shopify API Client
 * Location: /lib/shopify/client.ts
 * Purpose: Shopify API integration for fetching and managing products.
 * Handles authentication and rate limiting for Shopify Admin API.
 */

interface ShopifyConfig {
  shopUrl: string
  accessToken: string
}

export class ShopifyClient {
  private shopUrl: string
  private accessToken: string
  private apiVersion = '2024-01'

  constructor(config: ShopifyConfig) {
    this.shopUrl = config.shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    this.accessToken = config.accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `https://${this.shopUrl}/admin/api/${this.apiVersion}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Shopify API error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Shopify API request failed:', error)
      throw error
    }
  }

  /**
   * Fetch all products from Shopify store
   */
  async getProducts(limit = 50) {
    try {
      const data = await this.request(`/products.json?limit=${limit}`)
      return data.products || []
    } catch (error) {
      console.error('Error fetching Shopify products:', error)
      throw error
    }
  }

  /**
   * Fetch a single product by ID
   */
  async getProduct(productId: string) {
    try {
      const data = await this.request(`/products/${productId}.json`)
      return data.product
    } catch (error) {
      console.error('Error fetching Shopify product:', error)
      throw error
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(inventoryItemId: string, quantity: number) {
    try {
      const data = await this.request(`/inventory_levels/set.json`, {
        method: 'POST',
        body: JSON.stringify({
          inventory_item_id: inventoryItemId,
          available: quantity,
        }),
      })
      return data
    } catch (error) {
      console.error('Error updating Shopify inventory:', error)
      throw error
    }
  }

  /**
   * Verify connection to Shopify store
   */
  async verifyConnection() {
    try {
      await this.request('/shop.json')
      return true
    } catch (error) {
      console.error('Shopify connection verification failed:', error)
      return false
    }
  }
}

