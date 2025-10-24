/**
 * Shipments List Page (Enhanced)
 * Location: /app/shipments/page.tsx
 * Purpose: Beautiful shipments list with search, filters, and smooth loading states.
 * Features skeletons, animations, and empty states.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shipment } from '@/types'
import ShipmentCard from '@/components/ShipmentCard'
import { GridSkeleton, ShipmentCardSkeleton } from '@/components/Skeleton'
import { NoShipmentsEmpty, NoResultsEmpty } from '@/components/EmptyState'
import Link from 'next/link'

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      fetchShipments()
    }
    checkAuth()
  }, [])

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments')
      if (response.ok) {
        const data = await response.json()
        setShipments(data.data?.shipments || data.shipments || [])
        setFilteredShipments(data.data?.shipments || data.shipments || [])
      } else if (response.status === 401) {
        router.push('/signin')
      }
    } catch (err) {
      console.error('Error fetching shipments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = [...shipments]

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.tracking_number.toLowerCase().includes(query) ||
          s.title?.toLowerCase().includes(query) ||
          s.carrier?.name.toLowerCase().includes(query)
      )
    }

    setFilteredShipments(result)
  }, [statusFilter, searchQuery, shipments])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-2 mb-8">
            <div className="h-10 w-64 bg-base-300 animate-pulse rounded"></div>
            <div className="h-5 w-96 bg-base-300 animate-pulse rounded"></div>
          </div>

          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-12 flex-1 bg-base-300 animate-pulse rounded"></div>
                <div className="h-12 md:w-64 bg-base-300 animate-pulse rounded"></div>
              </div>
            </div>
          </div>

          <GridSkeleton count={6} Component={ShipmentCardSkeleton} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                My Shipments
              </h1>
              <p className="text-gray-600">View and manage all your tracked packages.</p>
            </div>
            <Link href="/add-shipment" className="btn btn-primary gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Add Shipment
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl mb-6 animate-slide-in-up">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by tracking number, title, or carrier..."
                    className="input input-bordered w-full pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control md:w-64">
                <select
                  className="select select-bordered w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">📦 Pending</option>
                  <option value="in_transit">🚚 In Transit</option>
                  <option value="out_for_delivery">🏃 Out for Delivery</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="failed">❌ Failed</option>
                  <option value="cancelled">⛔ Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-primary">{filteredShipments.length}</span> of{' '}
                <span className="font-semibold">{shipments.length}</span> shipments
              </div>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  className="btn btn-ghost btn-sm gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Shipments Grid */}
        {filteredShipments.length === 0 ? (
          <div className="animate-scale-in">
            {shipments.length === 0 ? (
              <NoShipmentsEmpty />
            ) : (
              <NoResultsEmpty
                onClear={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="hover-lift">
                <ShipmentCard shipment={shipment} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
