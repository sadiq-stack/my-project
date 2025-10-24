/**
 * Dashboard Page (Enhanced)
 * Location: /app/dashboard/page.tsx
 * Purpose: Beautiful dashboard with stats, recent shipments, and quick actions.
 * Features skeletons, animations, and empty states for great UX.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardStats from '@/components/DashboardStats'
import ShipmentCard from '@/components/ShipmentCard'
import Link from 'next/link'
import { Shipment } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch dashboard stats
  const { data: shipments } = await supabase
    .from('shipments')
    .select('status')
    .eq('user_id', user.id)

  const stats = {
    total_shipments: shipments?.length || 0,
    in_transit: shipments?.filter((s) => s.status === 'in_transit').length || 0,
    delivered: shipments?.filter((s) => s.status === 'delivered').length || 0,
    pending: shipments?.filter((s) => s.status === 'pending').length || 0,
  }

  // Fetch recent shipments
  const { data: recentShipments } = await supabase
    .from('shipments')
    .select(`
      *,
      carrier:carriers(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">👋</div>
            <div>
              <h1 className="text-4xl font-bold text-base-content">
                Welcome Back!
              </h1>
              <p className="text-base-content/70 text-lg">Here's an overview of your shipments.</p>
            </div>
          </div>
        </div>

        {/* Stats with animation */}
        <div className="mb-8 animate-slide-in-up">
          <DashboardStats stats={stats} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-fade-in">
          <div className="card bg-base-100 shadow-xl hover-lift">
            <div className="card-body">
              <h2 className="card-title mb-4 text-base-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/add-shipment"
                  className="btn btn-primary gap-2 btn-lg"
                >
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
                <Link
                  href="/shipments"
                  className="btn btn-outline gap-2 btn-lg"
                >
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  View All
                </Link>
                <Link
                  href="/integrations"
                  className="btn btn-ghost gap-2 btn-lg"
                >
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Integrations
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Shipments */}
        <div>
          <div className="flex justify-between items-center mb-6 animate-fade-in">
            <h2 className="text-3xl font-bold flex items-center gap-2 text-base-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Recent Shipments
            </h2>
            {recentShipments && recentShipments.length > 0 && (
              <Link
                href="/shipments"
                className="link link-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>

          {!recentShipments || recentShipments.length === 0 ? (
            <div className="animate-scale-in">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <div className="text-8xl mb-4 animate-bounce">📦</div>
                  <h3 className="text-3xl font-bold mb-3 text-base-content">No Shipments Yet</h3>
                  <p className="text-base-content/70 mb-8 text-lg max-w-md mx-auto">
                    Start tracking your packages by adding your first shipment. Get real-time updates and never miss a delivery!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/add-shipment" className="btn btn-primary btn-lg gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                      Add Your First Shipment
                    </Link>
                    <Link href="/#features" className="btn btn-ghost btn-lg">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {recentShipments.map((shipment: Shipment) => (
                <div key={shipment.id} className="hover-lift">
                  <ShipmentCard shipment={shipment} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Card */}
        {recentShipments && recentShipments.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💡</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-base-content">Pro Tip</h3>
                    <p className="text-sm text-base-content/70">
                      Connect your Shopify store in the Integrations page to automatically track product shipments and sync inventory with TikTok Shop!
                    </p>
                    <Link href="/integrations" className="btn btn-primary btn-sm mt-4">
                      Explore Integrations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
