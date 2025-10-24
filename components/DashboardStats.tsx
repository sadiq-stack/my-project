/**
 * DashboardStats Component
 * Location: /components/DashboardStats.tsx
 * Purpose: Displays key statistics about shipments on the dashboard.
 * Shows total shipments, in transit, delivered, and pending counts
 * using DaisyUI stat cards with icons.
 */

import { DashboardStats as Stats } from '@/types'

interface DashboardStatsProps {
  stats: Stats
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
        </div>
        <div className="stat-title">Total Shipments</div>
        <div className="stat-value text-primary">{stats.total_shipments}</div>
        <div className="stat-desc">All tracked packages</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div className="stat-title">In Transit</div>
        <div className="stat-value text-info">{stats.in_transit}</div>
        <div className="stat-desc">Currently shipping</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-success">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-title">Delivered</div>
        <div className="stat-value text-success">{stats.delivered}</div>
        <div className="stat-desc">Successfully delivered</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-warning">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-title">Pending</div>
        <div className="stat-value text-warning">{stats.pending}</div>
        <div className="stat-desc">Awaiting shipment</div>
      </div>
    </div>
  )
}

