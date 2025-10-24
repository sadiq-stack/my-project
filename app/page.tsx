/**
 * Landing Page (Home)
 * Location: /app/page.tsx
 * Purpose: Main landing page showcasing ShipTracker features and benefits.
 * Includes hero section, features grid, and call-to-action. Uses DaisyUI
 * components for modern and responsive design.
 */

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-[600px] bg-gradient-to-br from-primary to-secondary">
        <div className="hero-content text-center text-white">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Track All Your Shipments in One Place
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Multi-carrier shipment tracking made simple. Monitor packages from UPS, FedEx, USPS, DHL, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none">
                Get Started Free
              </Link>
              <Link href="/signin" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex gap-8 justify-center text-sm opacity-80">
              <div>✓ Free Forever</div>
              <div>✓ No Credit Card</div>
              <div>✓ Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ShipTracker?</h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your shipments efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="card-title text-2xl mb-2">Multi-Carrier Support</h3>
                <p className="text-gray-600">
                  Track shipments from UPS, FedEx, USPS, DHL, Amazon, and more carriers all in one dashboard.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="card-title text-2xl mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Get instant notifications when your shipment status changes. Never miss an important update.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="card-title text-2xl mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Visualize your shipping data with comprehensive stats and insights at a glance.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🔔</div>
                <h3 className="card-title text-2xl mb-2">Smart Notifications</h3>
                <p className="text-gray-600">
                  Receive timely alerts about your shipments via email and in-app notifications.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="card-title text-2xl mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data is encrypted and secured with industry-standard security practices.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="card-title text-2xl mb-2">Easy Integration</h3>
                <p className="text-gray-600">
                  Simple API and webhooks to integrate shipment tracking into your workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Start tracking your shipments in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-2xl font-bold mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up for free in seconds. No credit card required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-2xl font-bold mb-2">Add Shipments</h3>
              <p className="text-gray-600">
                Enter your tracking numbers and select carriers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-2xl font-bold mb-2">Track & Monitor</h3>
              <p className="text-gray-600">
                View real-time updates and tracking history all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Simplify Your Shipment Tracking?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust ShipTracker for their logistics needs.
          </p>
          <Link href="/signup" className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none">
            Start Tracking Now - It's Free
          </Link>
        </div>
      </div>
    </div>
  )
}

