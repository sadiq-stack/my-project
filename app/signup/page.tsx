/**
 * Sign Up Page
 * Location: /app/signup/page.tsx
 * Purpose: User registration page with comprehensive validation, password matching,
 * and error handling. Uses FormInput components and toast notifications.
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import FormInput from '@/components/FormInput'
import { isValidEmail, isValidLength } from '@/lib/utils/validation'
import { VALIDATION_LIMITS, ERROR_MESSAGES } from '@/lib/config/constants'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
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

    // Full name validation (optional but if provided, must be valid)
    if (fullName && !isValidLength(fullName, VALIDATION_LIMITS.NAME.min, VALIDATION_LIMITS.NAME.max)) {
      newErrors.fullName = `Name must be between ${VALIDATION_LIMITS.NAME.min} and ${VALIDATION_LIMITS.NAME.max} characters`
    }

    // Company name validation (optional)
    if (companyName && companyName.length > VALIDATION_LIMITS.NAME.max) {
      newErrors.companyName = `Company name must be less than ${VALIDATION_LIMITS.NAME.max} characters`
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < VALIDATION_LIMITS.PASSWORD.min) {
      newErrors.password = `Password must be at least ${VALIDATION_LIMITS.PASSWORD.min} characters`
    } else if (password.length > VALIDATION_LIMITS.PASSWORD.max) {
      newErrors.password = `Password must be less than ${VALIDATION_LIMITS.PASSWORD.max} characters`
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
            company_name: companyName.trim() || null,
          },
        },
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        
        // User-friendly error messages
        if (signUpError.message.includes('already registered')) {
          showError('This email is already registered. Please sign in instead.')
        } else {
          showError(signUpError.message || ERROR_MESSAGES.INTERNAL_ERROR)
        }
        return
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: fullName.trim() || null,
            company_name: companyName.trim() || null,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway as user is created
        }

        success('Account created successfully! Welcome to ShipTracker.')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Sign up exception:', err)
      showError(ERROR_MESSAGES.INTERNAL_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center justify-center mb-4">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Get started with shipment tracking today
          </p>

          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <FormInput
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) setErrors({ ...errors, fullName: '' })
              }}
              error={errors.fullName}
              helperText="Optional - helps personalize your experience"
              disabled={loading}
              autoComplete="name"
              maxLength={VALIDATION_LIMITS.NAME.max}
            />

            <FormInput
              id="companyName"
              label="Company Name"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                if (errors.companyName) setErrors({ ...errors, companyName: '' })
              }}
              error={errors.companyName}
              helperText="Optional - for business accounts"
              disabled={loading}
              autoComplete="organization"
              maxLength={VALIDATION_LIMITS.NAME.max}
            />

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
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: '' })
              }}
              error={errors.password}
              helperText={`At least ${VALIDATION_LIMITS.PASSWORD.min} characters`}
              required
              disabled={loading}
              autoComplete="new-password"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
              }}
              error={errors.confirmPassword}
              required
              disabled={loading}
              autoComplete="new-password"
            />

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  disabled={loading}
                />
                <span className="label-text">Show passwords</span>
              </label>
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
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/signin" className="link link-primary font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
