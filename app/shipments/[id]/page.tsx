/**
 * Shipment Detail Page
 * Location: /app/shipments/[id]/page.tsx
 * Purpose: Displays detailed information about a specific shipment including
 * tracking timeline, carrier info, and management options. Uses Supabase SSR
 * for secure data fetching and includes delete functionality.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import TrackingTimeline from '@/components/TrackingTimeline'
import Link from 'next/link'
import DeleteShipmentButton from '@/components/DeleteShipmentButton'

export default async function ShipmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch shipment with tracking events
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select(`
      *,
      carrier:carriers(*),
      tracking_events(*)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !shipment) {
    redirect('/shipments')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/shipments" className="btn btn-ghost btn-sm">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Shipments
          </Link>
        </div>

        {/* Shipment Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {shipment.title || 'Shipment Details'}
                </h1>
                <p className="text-sm text-gray-500">
                  Tracking: <span className="font-mono font-semibold">{shipment.tracking_number}</span>
                </p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <div className="divider"></div>

            {/* Shipment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-600 mb-1">Carrier</h3>
                <p className="text-lg">{shipment.carrier.name}</p>
              </div>

              {shipment.origin && (
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Origin</h3>
                  <p className="text-lg">{shipment.origin}</p>
                </div>
              )}

              {shipment.destination && (
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Destination</h3>
                  <p className="text-lg">{shipment.destination}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-600 mb-1">Created</h3>
                <p className="text-lg">{formatDate(shipment.created_at)}</p>
              </div>

              {shipment.estimated_delivery_date && (
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">
                    Estimated Delivery
                  </h3>
                  <p className="text-lg">
                    {formatDate(shipment.estimated_delivery_date)}
                  </p>
                </div>
              )}

              {shipment.delivered_at && (
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Delivered</h3>
                  <p className="text-lg text-success">
                    {formatDate(shipment.delivered_at)}
                  </p>
                </div>
              )}
            </div>

            {shipment.description && (
              <>
                <div className="divider"></div>
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Description</h3>
                  <p>{shipment.description}</p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="card-actions justify-end mt-4">
              {shipment.carrier.tracking_url_template && (
                <a
                  href={shipment.carrier.tracking_url_template.replace(
                    '{tracking_number}',
                    shipment.tracking_number
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Track on {shipment.carrier.name}
                </a>
              )}
              <DeleteShipmentButton shipmentId={shipment.id} />
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Tracking History</h2>
            <TrackingTimeline events={shipment.tracking_events || []} />
          </div>
        </div>
      </div>
    </div>
  )
}

