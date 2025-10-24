/**
 * Integrations Settings Page
 * Location: /app/integrations/page.tsx
 * Purpose: Manages platform integrations (Shopify, TikTok Shop).
 * Allows users to connect stores, view existing integrations, and sync products.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Integration } from '@/types/products'
import Link from 'next/link'

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [platform, setPlatform] = useState<'shopify' | 'tiktok_shop'>('shopify')
  const [shopUrl, setShopUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchIntegrations()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signin')
    }
  }

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (err) {
      console.error('Error fetching integrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          shop_url: shopUrl,
          access_token: accessToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setShopUrl('')
        setAccessToken('')
        fetchIntegrations()
      } else {
        setError(data.error || 'Failed to add integration')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSyncProducts = async (integrationId: string) => {
    setSyncing(integrationId)

    try {
      const response = await fetch('/api/integrations/shopify/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integrationId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Successfully synced ${data.synced} products!`)
        fetchIntegrations()
      } else {
        alert(data.error || 'Failed to sync products')
      }
    } catch (err) {
      alert('An error occurred while syncing')
    } finally {
      setSyncing(null)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Integrations</h1>
          <p className="text-gray-600">
            Connect your Shopify and TikTok Shop accounts to sync products
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Integration
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : integrations.length === 0 ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold mb-2">No Integrations Yet</h3>
              <p className="text-gray-600 mb-6">
                Connect your Shopify or TikTok Shop account to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <div key={integration.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="card-title">
                        {integration.platform === 'shopify'
                          ? '🛍️ Shopify'
                          : '📱 TikTok Shop'}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {integration.shop_url}
                      </p>
                    </div>
                    <div
                      className={`badge ${
                        integration.is_active
                          ? 'badge-success'
                          : 'badge-ghost'
                      }`}
                    >
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {integration.last_sync_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last synced:{' '}
                      {new Date(integration.last_sync_at).toLocaleString()}
                    </p>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {integration.platform === 'shopify' && (
                      <button
                        onClick={() => handleSyncProducts(integration.id)}
                        className={`btn btn-primary btn-sm ${
                          syncing === integration.id ? 'loading' : ''
                        }`}
                        disabled={syncing === integration.id}
                      >
                        {syncing === integration.id
                          ? 'Syncing...'
                          : 'Sync Products'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Quick Links</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href="/products" className="btn btn-outline btn-sm">
                View Products
              </Link>
              <Link href="/product-links" className="btn btn-outline btn-sm">
                Manage Links
              </Link>
            </div>
          </div>
        </div>

        {/* Add Integration Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Integration</h3>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAddIntegration} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Platform</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={platform}
                    onChange={(e) =>
                      setPlatform(e.target.value as 'shopify' | 'tiktok_shop')
                    }
                    disabled={submitting}
                  >
                    <option value="shopify">Shopify</option>
                    <option value="tiktok_shop">TikTok Shop</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Shop URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="your-store.myshopify.com"
                    className="input input-bordered"
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Access Token</span>
                  </label>
                  <input
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxx"
                    className="input input-bordered"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      Get this from your {platform} admin panel
                    </span>
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
                    className={`btn btn-primary ${
                      submitting ? 'loading' : ''
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Integration'}
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

