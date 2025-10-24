/**
 * Delete Shipment Button Component
 * Location: /components/DeleteShipmentButton.tsx
 * Purpose: Client component for deleting a shipment with confirmation dialog.
 * Uses DaisyUI modal and handles API call to delete endpoint. Redirects to
 * shipments list after successful deletion.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteShipmentButtonProps {
  shipmentId: string
}

export default function DeleteShipmentButton({
  shipmentId,
}: DeleteShipmentButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/shipments')
        router.refresh()
      } else {
        alert('Failed to delete shipment')
      }
    } catch (err) {
      console.error('Error deleting shipment:', err)
      alert('An error occurred while deleting the shipment')
    } finally {
      setLoading(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-error btn-outline"
      >
        Delete
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete Shipment?</h3>
            <p className="py-4">
              Are you sure you want to delete this shipment? This action cannot be
              undone and will remove all tracking history.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`btn btn-error ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

