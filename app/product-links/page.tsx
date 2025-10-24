/**
 * Product Links Management Page
 * Location: /app/product-links/page.tsx
 * Purpose: Manages links between Shopify and TikTok Shop products.
 * Allows users to create links, view sync status, and manually sync products.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductLink, Product } from '@/types/products'

export default function ProductLinksPage() {
  const [productLinks, setProductLinks] = useState<ProductLink[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [shopifyProductId, setShopifyProductId] = useState('')
  const [tiktokProductId, setTiktokProductId] = useState('')
  const [tiktokProductTitle, setTiktokProductTitle] = useState('')
  const [syncPrice, setSyncPrice] = useState(true)
  const [syncInventory, setSyncInventory] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchData()

    // Pre-select product from query param
    const productId = searchParams.get('product_id')
    if (productId) {
      setShopifyProductId(productId)
      setShowModal(true)
    }
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
      const [linksRes, productsRes] = await Promise.all([
        fetch('/api/product-links'),
        fetch('/api/products'),
      ])

      if (linksRes.ok) {
        const data = await linksRes.json()
        setProductLinks(data.product_links || [])
      }

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/product-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopify_product_id: shopifyProductId,
          tiktok_product_id: tiktokProductId,
          tiktok_product_title: tiktokProductTitle,
          sync_price: syncPrice,
          sync_inventory: syncInventory,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setShopifyProductId('')
        setTiktokProductId('')
        setTiktokProductTitle('')
        fetchData()
      } else {
        setError(data.error || 'Failed to create product link')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSync = async (linkId: string) => {
    setSyncing(linkId)

    try {
      const response = await fetch(`/api/product-links/${linkId}/sync`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        alert('Product synced successfully!')
        fetchData()
      } else {
        alert(data.error || 'Failed to sync product')
      }
    } catch (err) {
      alert('An error occurred while syncing')
    } finally {
      setSyncing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: 'badge-warning',
      synced: 'badge-success',
      error: 'badge-error',
      disabled: 'badge-ghost',
    }
    return `badge ${statusMap[status as keyof typeof statusMap] || 'badge-neutral'}`
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Links</h1>
          <p className="text-gray-600">
            Link Shopify products to TikTok Shop for automatic syncing
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Create Link
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : productLinks.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-2">No Product Links Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first link between Shopify and TikTok Shop products
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {productLinks.map((link) => (
              <div key={link.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {link.shopify_product?.title || 'Product'}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-semibold">TikTok Product ID:</span>{' '}
                          {link.tiktok_product_id}
                        </p>
                        {link.tiktok_product_title && (
                          <p>
                            <span className="font-semibold">TikTok Title:</span>{' '}
                            {link.tiktok_product_title}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {link.sync_price && (
                            <span className="badge badge-sm">Sync Price</span>
                          )}
                          {link.sync_inventory && (
                            <span className="badge badge-sm">Sync Inventory</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={getStatusBadge(link.sync_status)}>
                        {link.sync_status.toUpperCase()}
                      </span>
                      {link.last_synced_at && (
                        <p className="text-xs text-gray-500">
                          Last synced:{' '}
                          {new Date(link.last_synced_at).toLocaleString()}
                        </p>
                      )}
                      {link.error_message && (
                        <p className="text-xs text-error">{link.error_message}</p>
                      )}
                      <button
                        onClick={() => handleSync(link.id)}
                        className={`btn btn-primary btn-sm ${
                          syncing === link.id ? 'loading' : ''
                        }`}
                        disabled={syncing === link.id}
                      >
                        {syncing === link.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Link Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Create Product Link</h3>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateLink} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Shopify Product</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={shopifyProductId}
                    onChange={(e) => setShopifyProductId(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title} - {product.sku || 'No SKU'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">TikTok Shop Product ID</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter TikTok Shop product ID"
                    className="input input-bordered"
                    value={tiktokProductId}
                    onChange={(e) => setTiktokProductId(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      TikTok Product Title (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="For reference only"
                    className="input input-bordered"
                    value={tiktokProductTitle}
                    onChange={(e) => setTiktokProductTitle(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Sync Price</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={syncPrice}
                      onChange={(e) => setSyncPrice(e.target.checked)}
                      disabled={submitting}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Sync Inventory</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={syncInventory}
                      onChange={(e) => setSyncInventory(e.target.checked)}
                      disabled={submitting}
                    />
                  </label>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-ghost"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

