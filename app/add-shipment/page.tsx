/**
 * Add Shipment Page
 * Location: /app/add-shipment/page.tsx
 * Purpose: Page for adding new shipments with comprehensive validation,
 * error handling, and accessibility. Uses FormInput components and toast notifications.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'
import FormInput, { FormTextarea, FormSelect } from '@/components/FormInput'
import { Carrier } from '@/types'
import { isValidTrackingNumber, isValidLength } from '@/lib/utils/validation'
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '@/lib/config/constants'

export default function AddShipmentPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [carrierId, setCarrierId] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loadingCarriers, setLoadingCarriers] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { success, error: showError } = useToast()

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        showError('Please sign in to add shipments')
        router.push('/signin')
      }
    }
    checkAuth()

    // Fetch carriers
    const fetchCarriers = async () => {
      try {
        const response = await fetch('/api/carriers')
        if (response.ok) {
          const data = await response.json()
          setCarriers(data.data?.carriers || data.carriers || [])
        } else {
          showError('Failed to load carriers. Please refresh the page.')
        }
      } catch (err) {
        console.error('Error fetching carriers:', err)
        showError('Failed to load carriers. Please refresh the page.')
      } finally {
        setLoadingCarriers(false)
      }
    }
    fetchCarriers()
  }, [router])

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Carrier validation
    if (!carrierId) {
      newErrors.carrierId = 'Please select a carrier'
    }

    // Tracking number validation
    if (!trackingNumber.trim()) {
      newErrors.trackingNumber = 'Tracking number is required'
    } else if (!isValidTrackingNumber(trackingNumber)) {
      newErrors.trackingNumber = 'Tracking number must be 6-50 alphanumeric characters'
    }

    // Title validation (optional but if provided must be valid)
    if (title && !isValidLength(title, VALIDATION_LIMITS.TITLE.min, VALIDATION_LIMITS.TITLE.max)) {
      newErrors.title = `Title must be between ${VALIDATION_LIMITS.TITLE.min} and ${VALIDATION_LIMITS.TITLE.max} characters`
    }

    // Description validation (optional)
    if (description && description.length > VALIDATION_LIMITS.DESCRIPTION.max) {
      newErrors.description = `Description must be less than ${VALIDATION_LIMITS.DESCRIPTION.max} characters`
    }

    // Origin validation (optional)
    if (origin && origin.length > VALIDATION_LIMITS.LOCATION.max) {
      newErrors.origin = `Origin must be less than ${VALIDATION_LIMITS.LOCATION.max} characters`
    }

    // Destination validation (optional)
    if (destination && destination.length > VALIDATION_LIMITS.LOCATION.max) {
      newErrors.destination = `Destination must be less than ${VALIDATION_LIMITS.LOCATION.max} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrier_id: carrierId,
          tracking_number: trackingNumber.trim(),
          title: title.trim() || null,
          description: description.trim() || null,
          origin: origin.trim() || null,
          destination: destination.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        success('Shipment added successfully!')
        router.push(`/shipments/${data.data.shipment.id}`)
      } else {
        // Handle validation errors from API
        if (data.error?.code === 'VALIDATION_ERROR' && data.error?.details) {
          setErrors(data.error.details)
          showError('Please fix the errors in the form')
        } else if (data.error?.code === 'CONFLICT') {
          showError('This tracking number already exists in your shipments')
        } else {
          showError(data.error?.message || ERROR_MESSAGES.INTERNAL_ERROR)
        }
      }
    } catch (err) {
      console.error('Error adding shipment:', err)
      showError(ERROR_MESSAGES.INTERNAL_ERROR)
    } finally {
      setLoading(false)
    }
  }

  if (loadingCarriers) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Loading carriers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add New Shipment</h1>
          <p className="text-gray-600">
            Enter your tracking information to start monitoring your package.
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Carrier Selection */}
              <FormSelect
                id="carrierId"
                label="Carrier"
                value={carrierId}
                onChange={(e) => {
                  setCarrierId(e.target.value)
                  if (errors.carrierId) setErrors({ ...errors, carrierId: '' })
                }}
                error={errors.carrierId}
                required
                disabled={loading}
                options={[
                  { value: '', label: 'Select a carrier' },
                  ...carriers.map((carrier) => ({
                    value: carrier.id,
                    label: carrier.name,
                  })),
                ]}
              />

              {/* Tracking Number */}
              <FormInput
                id="trackingNumber"
                label="Tracking Number"
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value)
                  if (errors.trackingNumber) setErrors({ ...errors, trackingNumber: '' })
                }}
                error={errors.trackingNumber}
                helperText="6-50 alphanumeric characters"
                required
                disabled={loading}
                maxLength={VALIDATION_LIMITS.TRACKING_NUMBER.max}
                showCharCount
              />

              <div className="divider">Optional Details</div>

              {/* Title */}
              <FormInput
                id="title"
                label="Title"
                type="text"
                placeholder="e.g., New Laptop Order"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors({ ...errors, title: '' })
                }}
                error={errors.title}
                helperText="Give your shipment a memorable name"
                disabled={loading}
                maxLength={VALIDATION_LIMITS.TITLE.max}
                showCharCount
              />

              {/* Description */}
              <FormTextarea
                id="description"
                label="Description"
                placeholder="Add notes about this shipment"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errors.description) setErrors({ ...errors, description: '' })
                }}
                error={errors.description}
                helperText="Any additional information about the package"
                disabled={loading}
                rows={3}
                maxLength={VALIDATION_LIMITS.DESCRIPTION.max}
                showCharCount
              />

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="origin"
                  label="Origin"
                  type="text"
                  placeholder="City, Country"
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value)
                    if (errors.origin) setErrors({ ...errors, origin: '' })
                  }}
                  error={errors.origin}
                  disabled={loading}
                  maxLength={VALIDATION_LIMITS.LOCATION.max}
                />

                <FormInput
                  id="destination"
                  label="Destination"
                  type="text"
                  placeholder="City, Country"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value)
                    if (errors.destination) setErrors({ ...errors, destination: '' })
                  }}
                  error={errors.destination}
                  disabled={loading}
                  maxLength={VALIDATION_LIMITS.LOCATION.max}
                />
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading || loadingCarriers}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Adding Shipment...
                    </>
                  ) : (
                    <>
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
                      Add Shipment
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-ghost btn-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
