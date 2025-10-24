/**
 * ShipmentCard Component
 * Location: /components/ShipmentCard.tsx
 * Purpose: Displays a single shipment's information in a card format. Shows
 * tracking number, carrier, status, and delivery information. Uses DaisyUI
 * card component for consistent styling.
 */

import Link from 'next/link'
import { Shipment } from '@/types'
import StatusBadge from './StatusBadge'

interface ShipmentCardProps {
  shipment: Shipment
}

export default function ShipmentCard({ shipment }: ShipmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <article 
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200" 
      aria-label={`Shipment: ${shipment.title || shipment.tracking_number}`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="card-title text-primary">
              {shipment.title || 'Shipment'}
            </h2>
            <p className="text-sm text-gray-500">
              Tracking: <span className="font-mono font-semibold">{shipment.tracking_number}</span>
            </p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>

        <div className="divider my-2"></div>

        <div className="space-y-2">
          {shipment.carrier && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Carrier:</span>
              <span>{shipment.carrier.name}</span>
            </div>
          )}

          {shipment.origin && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">From:</span>
              <span>{shipment.origin}</span>
            </div>
          )}

          {shipment.destination && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">To:</span>
              <span>{shipment.destination}</span>
            </div>
          )}

          {shipment.estimated_delivery_date && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Est. Delivery:</span>
              <span>{formatDate(shipment.estimated_delivery_date)}</span>
            </div>
          )}

          {shipment.delivered_at && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Delivered:</span>
              <span className="text-success">{formatDate(shipment.delivered_at)}</span>
            </div>
          )}
        </div>

        <div className="card-actions justify-end mt-4">
          <Link 
            href={`/shipments/${shipment.id}`} 
            className="btn btn-primary btn-sm"
            aria-label={`View details for ${shipment.title || 'shipment'}`}
          >
            View Details
          </Link>
          {shipment.carrier?.tracking_url_template && (
            <a
              href={shipment.carrier.tracking_url_template.replace('{tracking_number}', shipment.tracking_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              aria-label={`Track shipment on ${shipment.carrier.name} website (opens in new tab)`}
            >
              Track on {shipment.carrier.name}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

