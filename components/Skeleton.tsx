/**
 * Skeleton Loading Components
 * Location: /components/Skeleton.tsx
 * Purpose: Beautiful skeleton loaders for better loading UX.
 * Replaces generic spinners with content-aware loading states.
 */

/**
 * Base Skeleton Component
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-base-300 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Shipment Card Skeleton
 */
export function ShipmentCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="divider my-2"></div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="stat">
      <div className="stat-figure">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="stat-title">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="stat-value">
        <Skeleton className="h-10 w-16" />
      </div>
      <div className="stat-desc">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

/**
 * Dashboard Stats Skeleton
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  )
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        <Skeleton className="h-48 w-full rounded-xl" />
      </figure>
      <div className="card-body">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  )
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton() {
  return (
    <tr>
      <td><Skeleton className="h-4 w-full" /></td>
      <td><Skeleton className="h-4 w-full" /></td>
      <td><Skeleton className="h-4 w-full" /></td>
      <td><Skeleton className="h-4 w-20" /></td>
    </tr>
  )
}

/**
 * Timeline Event Skeleton
 */
export function TimelineEventSkeleton() {
  return (
    <li>
      <hr className="bg-base-300" />
      <div className="timeline-start timeline-box">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="timeline-middle">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="timeline-end">
        <Skeleton className="h-4 w-full" />
      </div>
      <hr className="bg-base-300" />
    </li>
  )
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-12 w-full mt-6" />
    </div>
  )
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />
    </div>
  )
}

/**
 * Grid Skeleton - Multiple Cards
 */
export function GridSkeleton({ 
  count = 6, 
  Component = ShipmentCardSkeleton 
}: { 
  count?: number
  Component?: React.ComponentType 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

