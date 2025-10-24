/**
 * TrackingTimeline Component
 * Location: /components/TrackingTimeline.tsx
 * Purpose: Displays a vertical timeline of tracking events for a shipment.
 * Shows event status, location, description, and timestamp in chronological order.
 * Uses DaisyUI timeline component for visual representation.
 */

import { TrackingEvent } from '@/types'

interface TrackingTimelineProps {
  events: TrackingEvent[]
}

export default function TrackingTimeline({ events }: TrackingTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Sort events by event_time in descending order (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.event_time).getTime() - new Date(a.event_time).getTime()
  )

  if (sortedEvents.length === 0) {
    return (
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>No tracking events available yet.</span>
      </div>
    )
  }

  return (
    <ul className="timeline timeline-vertical" role="list" aria-label="Tracking history">
      {sortedEvents.map((event, index) => (
        <li key={event.id} role="listitem">
          {index !== 0 && <hr className="bg-primary" />}
          <div className="timeline-start timeline-box">
            <div className="font-bold text-primary">{event.status}</div>
            {event.location && (
              <div className="text-sm text-gray-600">{event.location}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(event.event_time)}
            </div>
          </div>
          <div className="timeline-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="timeline-end">
            <p className="text-sm">{event.description}</p>
          </div>
          {index !== sortedEvents.length - 1 && <hr className="bg-primary" />}
        </li>
      ))}
    </ul>
  )
}

