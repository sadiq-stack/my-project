/**
 * Public Track Page
 * Location: /app/track/page.tsx
 * Purpose: Public-facing page for tracking shipments by tracking number.
 * Allows users to check shipment status without authentication. Uses client-side
 * form submission and displays results. Follows DaisyUI styling.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setNotFound(false)

    // For now, this is a simple placeholder
    // In a production app, you might have a public API endpoint
    // or search through carriers' public tracking pages

    // Simulate search
    setTimeout(() => {
      setSearching(false)
      setNotFound(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-base-200 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Track Your Shipment</h1>
          <p className="text-xl text-gray-600">
            Enter your tracking number to see the latest status of your package
          </p>
        </div>

        {/* Tracking Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">
                    Tracking Number
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  className="input input-bordered input-lg w-full"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value)
                    setNotFound(false)
                  }}
                  required
                  disabled={searching}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg w-full ${
                  searching ? 'loading' : ''
                }`}
                disabled={searching || !trackingNumber.trim()}
              >
                {searching ? 'Tracking...' : 'Track Package'}
              </button>
            </form>

            {notFound && (
              <div className="alert alert-info mt-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="font-bold">Tracking number not found</h3>
                  <div className="text-sm">
                    To track your shipments, please{' '}
                    <Link href="/signin" className="link link-primary">
                      sign in
                    </Link>{' '}
                    or{' '}
                    <Link href="/signup" className="link link-primary">
                      create an account
                    </Link>
                    .
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🚚</div>
            <h3 className="font-bold mb-1">Multiple Carriers</h3>
            <p className="text-sm text-gray-600">
              Track packages from UPS, FedEx, USPS, DHL, and more
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">🔔</div>
            <h3 className="font-bold mb-1">Real-Time Updates</h3>
            <p className="text-sm text-gray-600">
              Get instant notifications on shipment status changes
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold mb-1">Detailed History</h3>
            <p className="text-sm text-gray-600">
              View complete tracking timeline and delivery information
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 card bg-gradient-to-br from-primary to-secondary text-white shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-2xl justify-center">
              Want to track multiple shipments?
            </h2>
            <p className="mb-4">
              Create a free account to manage all your packages in one dashboard
            </p>
            <div className="card-actions justify-center">
              <Link href="/signup" className="btn bg-white text-primary border-none hover:bg-gray-100">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

