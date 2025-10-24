/**
 * StatusBadge Component
 * Location: /components/StatusBadge.tsx
 * Purpose: Displays a color-coded badge for shipment status. Uses DaisyUI badge
 * component with conditional styling based on status type.
 */

import React from 'react'

interface StatusBadgeProps {
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = () => {
    switch (status) {
      case 'delivered':
        return 'badge-success'
      case 'in_transit':
        return 'badge-info'
      case 'out_for_delivery':
        return 'badge-warning'
      case 'failed':
        return 'badge-error'
      case 'cancelled':
        return 'badge-ghost'
      default:
        return 'badge-neutral'
    }
  }

  const getStatusText = () => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <span 
      className={`badge ${getStatusClass()} badge-lg`}
      role="status"
      aria-label={`Shipment status: ${getStatusText()}`}
    >
      {getStatusText()}
    </span>
  )
}

