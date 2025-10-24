/**
 * Navbar Component
 * Location: /components/Navbar.tsx
 * Purpose: Main navigation bar for the application. Shows brand logo, navigation
 * links, and user authentication status. Adapts based on whether user is logged in.
 * Uses DaisyUI for consistent styling and responsive design.
 */

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {user ? (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/shipments">Shipments</Link></li>
                <li><Link href="/add-shipment">Add Shipment</Link></li>
                <li><Link href="/integrations">Integrations</Link></li>
                <li><Link href="/products">Products</Link></li>
                <li><Link href="/product-links">Product Links</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/track">Track</Link></li>
                <li><Link href="/#features">Features</Link></li>
              </>
            )}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          📦 ShipTracker
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {user ? (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/shipments">Shipments</Link></li>
              <li>
                <details>
                  <summary>Products</summary>
                  <ul className="p-2 bg-base-100 z-50">
                    <li><Link href="/integrations">Integrations</Link></li>
                    <li><Link href="/products">Products</Link></li>
                    <li><Link href="/product-links">Product Links</Link></li>
                  </ul>
                </details>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/track">Track</Link></li>
              <li><Link href="/#features">Features</Link></li>
            </>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="text-lg">{user.email?.[0].toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li className="menu-title">
                <span>{user.email}</span>
              </li>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/settings">Settings</Link></li>
              <li><button onClick={handleSignOut}>Sign Out</button></li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/signin" className="btn btn-ghost">Sign In</Link>
            <Link href="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        )}
      </div>
    </div>
  )
}

