'use client'

import * as React from 'react'
import { storyblokEditable } from '@storyblok/react/rsc'
import type { RegistrationFormContent } from '../content'

export type RegistrationFormProps = {
  blok: RegistrationFormContent
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormFields = {
  firstName: string
  lastName: string
  email: string
  phoneNo: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

// ─── Validation ───────────────────────────────────────────────────────────────

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateFields(fields: FormFields): FormErrors {
  const errors: FormErrors = {}

  if (!fields.firstName.trim()) {
    errors.firstName = 'First name is required.'
  } else if (fields.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.'
  } else if (fields.firstName.trim().length > 50) {
    errors.firstName = 'First name must be 50 characters or fewer.'
  }

  if (!fields.lastName.trim()) {
    errors.lastName = 'Last name is required.'
  } else if (fields.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.'
  } else if (fields.lastName.trim().length > 50) {
    errors.lastName = 'Last name must be 50 characters or fewer.'
  }

  if (!fields.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!fields.phoneNo.trim()) {
    errors.phoneNo = 'Phone number is required.'
  } else if (!PHONE_REGEX.test(fields.phoneNo.replace(/[\s\-()]/g, ''))) {
    errors.phoneNo = 'Please enter a valid phone number (e.g. +91 9876543210).'
  }

  return errors
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type FieldProps = {
  id: string
  label: string
  type?: React.HTMLInputTypeAttribute
  value: string
  error?: string
  placeholder?: string
  autoComplete?: string
  onChange: (value: string) => void
  onBlur: () => void
}

function FormField({
  id,
  label,
  type = 'text',
  value,
  error,
  placeholder,
  autoComplete,
  onChange,
  onBlur,
}: FieldProps) {
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-stone-700"
      >
        {label}
        <span
          className="ml-0.5 text-red-500"
          aria-hidden="true"
        >
          *
        </span>
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={[
          'w-full rounded-lg border px-4 py-3 text-sm text-stone-900',
          'placeholder:text-stone-400 outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-offset-0',
          hasError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 bg-white focus:border-stone-900 focus:ring-stone-200',
        ].join(' ')}
      />

      {hasError && (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600"
        >
          <svg
            className="h-3 w-3 flex-shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.75a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 1.5 0v3z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-green-800"
    >
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-800"
    >
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_FIELDS: FormFields = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNo: '',
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RegistrationForm({ blok }: RegistrationFormProps) {
  const [fields, setFields] = React.useState<FormFields>(INITIAL_FIELDS)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof FormFields, boolean>>>({})
  const [status, setStatus] = React.useState<FormStatus>('idle')
  const [serverErrorMessage, setServerErrorMessage] = React.useState<string>('')

  // Validate on touched change
  React.useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateFields(fields)
      // Only show errors for touched fields
      const filteredErrors: FormErrors = {}
      for (const key of Object.keys(touched) as (keyof FormFields)[]) {
        if (newErrors[key]) filteredErrors[key] = newErrors[key]
      }
      setErrors(filteredErrors)
    }
  }, [fields, touched])

  const handleChange = (field: keyof FormFields) => (value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof FormFields) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Touch all fields to show all errors
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {
      firstName: true,
      lastName: true,
      email: true,
      phoneNo: true,
    }
    setTouched(allTouched)

    const validationErrors = validateFields(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setStatus('submitting')
    setServerErrorMessage('')

    try {
      const endpoint = blok.apiEndpoint?.trim() || '/api/registration'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim().toLowerCase(),
          phoneNo: fields.phoneNo.trim(),
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message ?? `Server error: ${response.status}`)
      }

      setStatus('success')
      setFields(INITIAL_FIELDS)
      setTouched({})
      setErrors({})
    } catch (err) {
      setStatus('error')
      setServerErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setServerErrorMessage('')
  }

  const isSubmitting = status === 'submitting'

  return (
    <section
      {...storyblokEditable(blok)}
      className="self-stretch flex justify-center bg-white py-16 px-4"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        {(blok.title || blok.subtitle) && (
          <div className="mb-8 text-center">
            {blok.title && (
              <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">
                {blok.title}
              </h2>
            )}
            {blok.subtitle && (
              <p className="mt-2 text-sm text-stone-500">{blok.subtitle}</p>
            )}
          </div>
        )}

        {/* Success State */}
        {status === 'success' ? (
          <div className="space-y-4">
            <SuccessBanner
              message={
                blok.successMessage ||
                'Registration successful! We will be in touch shortly.'
              }
            />
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              Register another
            </button>
          </div>
        ) : (
          /* Form */
          <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            {/* Server error */}
            {status === 'error' && serverErrorMessage && (
              <ErrorBanner message={serverErrorMessage} />
            )}

            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="firstName"
                label="First Name"
                value={fields.firstName}
                error={errors.firstName}
                placeholder="Jane"
                autoComplete="given-name"
                onChange={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
              />
              <FormField
                id="lastName"
                label="Last Name"
                value={fields.lastName}
                error={errors.lastName}
                placeholder="Smith"
                autoComplete="family-name"
                onChange={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
              />
            </div>

            <FormField
              id="email"
              label="Email Address"
              type="email"
              value={fields.email}
              error={errors.email}
              placeholder="jane@example.com"
              autoComplete="email"
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
            />

            <FormField
              id="phoneNo"
              label="Phone Number"
              type="tel"
              value={fields.phoneNo}
              error={errors.phoneNo}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              onChange={handleChange('phoneNo')}
              onBlur={handleBlur('phoneNo')}
            />

            {/* Required note */}
            <p className="text-xs text-stone-400">
              <span className="text-red-500">*</span> Required fields
            </p>

            {/* Submit */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={[
                'w-full rounded-lg px-4 py-3 text-sm font-semibold text-white',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2',
                isSubmitting
                  ? 'cursor-not-allowed bg-stone-400'
                  : 'bg-stone-900 hover:bg-stone-700 active:bg-stone-800',
              ].join(' ')}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Submitting…
                </span>
              ) : (
                (blok.submitLabel || 'Register Now')
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default RegistrationForm