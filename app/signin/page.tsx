/**
 * Sign In Page
 * Location: /app/signin/page.tsx
 * Purpose: User authentication page with comprehensive validation, error handling,
 * and accessibility features. Uses FormInput components and toast notifications.
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import FormInput from '@/components/FormInput'
import { isValidEmail } from '@/lib/utils/validation'
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '@/lib/config/constants'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()
  const { success, error: showError } = useToast()

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < VALIDATION_LIMITS.PASSWORD.min) {
      newErrors.password = `Password must be at least ${VALIDATION_LIMITS.PASSWORD.min} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        
        // User-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          showError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          showError('Please confirm your email address before signing in.')
        } else {
          showError(error.message || ERROR_MESSAGES.INTERNAL_ERROR)
        }
      } else {
        success('Signed in successfully!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Sign in exception:', err)
      showError(ERROR_MESSAGES.INTERNAL_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center justify-center mb-4">
            Sign In
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Welcome back! Sign in to track your shipments.
          </p>

          <form onSubmit={handleSignIn} className="space-y-4" noValidate>
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              error={errors.email}
              required
              disabled={loading}
              autoComplete="email"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
              required
              disabled={loading}
              autoComplete="current-password"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="text-right">
              <Link href="/forgot-password" className="link link-primary link-hover text-sm">
                Forgot password?
              </Link>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="link link-primary font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
