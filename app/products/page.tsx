/**
 * Products Management Page
 * Location: /app/products/page.tsx
 * Purpose: Displays all synced products from Shopify. Users can view products,
 * search, filter by integration, and navigate to create product links.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Integration } from '@/types/products'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [integrationFilter, setIntegrationFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signin')
    }
  }

  const fetchData = async () => {
    try {
      const [productsRes, integrationsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/integrations'),
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }

      if (integrationsRes.ok) {
        const data = await integrationsRes.json()
        setIntegrations(data.integrations || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = [...products]

    if (integrationFilter !== 'all') {
      result = result.filter((p) => p.integration_id === integrationFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(result)
  }, [integrationFilter, searchQuery, products])

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">
            Manage products synced from your integrations
          </p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <input
                  type="text"
                  placeholder="Search by title or SKU..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="form-control md:w-64">
                <select
                  className="select select-bordered"
                  value={integrationFilter}
                  onChange={(e) => setIntegrationFilter(e.target.value)}
                >
                  <option value="all">All Integrations</option>
                  {integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.platform === 'shopify' ? '🛍️' : '📱'}{' '}
                      {integration.shop_url}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-2">
                {products.length === 0
                  ? 'No Products Yet'
                  : 'No Matching Products'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0
                  ? 'Sync products from your Shopify store to get started'
                  : 'Try adjusting your filters or search query'}
              </p>
              {products.length === 0 && (
                <Link href="/integrations" className="btn btn-primary">
                  Go to Integrations
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                {product.image_url && (
                  <figure className="px-4 pt-4">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="rounded-xl h-48 w-full object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h2 className="card-title text-lg">
                    {product.title}
                    <div
                      className={`badge badge-sm ${
                        product.status === 'active'
                          ? 'badge-success'
                          : 'badge-ghost'
                      }`}
                    >
                      {product.status}
                    </div>
                  </h2>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">Price:</span>{' '}
                      {formatPrice(product.price, product.currency)}
                    </p>
                    {product.sku && (
                      <p>
                        <span className="font-semibold">SKU:</span>{' '}
                        {product.sku}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Stock:</span>{' '}
                      {product.inventory_quantity || 0} units
                    </p>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    {product.product_url && (
                      <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </a>
                    )}
                    <Link
                      href={`/product-links?product_id=${product.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Link to TikTok
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

